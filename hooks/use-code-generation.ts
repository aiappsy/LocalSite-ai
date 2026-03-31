import { useState } from "react"
import { toast } from "sonner"

interface GenerateCodeParams {
    prompt: string
    model: string
    provider: string
    maxTokens?: number
    temperature?: number
    topP?: number
    topK?: number
    systemPromptType: string // 'default', 'thinking', 'custom'
    customSystemPrompt?: string
    customCredentials?: Record<string, { apiKey?: string; baseUrl?: string }>
    isSearchEnabled?: boolean
    attachedFiles?: File[]
}

// Interface for NDJSON stream parts
interface StreamPart {
    type: 'text' | 'reasoning'
    content: string
}

const DESIGN_EXCELLENCE_SUFFIX = `

## ELITE DESIGN ENFORCEMENT
- Use Tailwind CSS v3 (Play CDN) for all styling.
- Use GSAP (CDN) for entrance and scroll animations.
- Use Lucide Icons (CDN) with lucide.createIcons() initialization.
- Implement a 'Bento Box' or 'Glassmorphism' layout.
- Use premium Google Fonts (Outfit, Playfair Display).
- Ensure 100% mobile responsiveness.
- STRICTLY ONLY output raw HTML. No markdown code blocks.
`;

export function useCodeGeneration() {
    const [generatedCode, setGeneratedCode] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationComplete, setGenerationComplete] = useState(false)
    const [thinkingOutput, setThinkingOutput] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    
    const generateCode = async ({
        prompt,
        model,
        provider,
        maxTokens,
        temperature,
        topP,
        topK,
        systemPromptType,
        customSystemPrompt,
        customCredentials,
        isSearchEnabled,
        attachedFiles
    }: GenerateCodeParams) => {
        if (!prompt.trim() || !model || !provider) {
            toast.error("Please enter a prompt and select a provider and model.")
            return
        }

        const finalPrompt = `
### USER'S PRIMARY REQUEST (CRITICAL PRIORITY):
${prompt}

---
### ELITE DESIGN SPECIFICATIONS (Apply to the request above):
${DESIGN_EXCELLENCE_SUFFIX}
`;

        setIsGenerating(true)
        setGeneratedCode("")
        setThinkingOutput("")
        setIsThinking(false)
        setGenerationComplete(false)
        
        // Process files to Base64 if any
        let processedFiles: { name: string, type: string, data: string }[] = []
        if (attachedFiles && attachedFiles.length > 0) {
            processedFiles = await Promise.all(attachedFiles.map(async (file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        resolve({
                            name: file.name,
                            type: file.type,
                            data: reader.result as string
                        })
                    }
                    reader.readAsDataURL(file)
                })
            })) as any
        }

        try {
            // Construct the system prompt logic here or in the API route.
            let finalCustomSystemPrompt = null;

            if (systemPromptType === 'custom') {
                finalCustomSystemPrompt = customSystemPrompt;
            }

            const response = await fetch('/api/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    model,
                    provider,
                    maxTokens,
                    temperature,
                    topP,
                    topK,
                    systemPromptType,
                    customSystemPrompt: finalCustomSystemPrompt,
                    customCredentials,
                    isSearchEnabled,
                    attachedFiles: processedFiles
                }),
            })

            if (!response.ok) {
                try {
                    const errorData = await response.json()
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error)
                    }
                } catch (jsonError) {
                    // Ignore json parse error
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('Stream could not be read')
            }

            let codeBuffer = ""
            let reasoningBuffer = ""
            let lineBuffer = ""
            let hasReceivedReasoning = false

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                const chunk = new TextDecoder().decode(value)
                lineBuffer += chunk

                // Process complete lines (NDJSON format)
                const lines = lineBuffer.split('\n')
                // Keep the last incomplete line in the buffer
                lineBuffer = lines.pop() || ""

                for (const line of lines) {
                    if (!line.trim()) continue

                    try {
                        const part: StreamPart = JSON.parse(line)

                        if (part.type === 'text') {
                            codeBuffer += part.content
                            // Robust extraction: try to find <!DOCTYPE html> ... </html>
                            const htmlMatch = codeBuffer.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
                            if (htmlMatch) {
                                setGeneratedCode(htmlMatch[0]);
                            } else {
                                // Fallback: strip markdown if present
                                setGeneratedCode(codeBuffer.replace(/^```html\n/, '').replace(/```$/, '').trim());
                            }
                        } else if (part.type === 'reasoning') {
                            if (!hasReceivedReasoning) {
                                setIsThinking(true)
                                hasReceivedReasoning = true
                            }
                            reasoningBuffer += part.content
                            setThinkingOutput(reasoningBuffer)
                        }
                    } catch (parseError) {
                        // If JSON parse fails, it might be legacy plain text format
                        // Try to handle it gracefully
                        console.warn('Failed to parse stream part:', line, parseError)
                    }
                }
            }

            // Process any remaining content in the buffer
            if (lineBuffer.trim()) {
                try {
                    const part: StreamPart = JSON.parse(lineBuffer)
                    if (part.type === 'text') {
                        codeBuffer += part.content
                        setGeneratedCode(codeBuffer.replace(/^```html\n/, '').replace(/```$/, ''))
                    } else if (part.type === 'reasoning') {
                        reasoningBuffer += part.content
                        setThinkingOutput(reasoningBuffer)
                    }
                } catch {
                    // Ignore parse errors for incomplete lines
                }
            }

            // End thinking state
            if (hasReceivedReasoning) {
                setIsThinking(false)
            }

            setGenerationComplete(true)
        } catch (error) {
            console.error('Error generating code:', error)
            if (error instanceof Error) {
                const errorMessage = error.message
                if (errorMessage.includes('Ollama')) {
                    toast.error('Cannot connect to Ollama. Is the server running?')
                } else if (errorMessage.includes('LM Studio')) {
                    toast.error('Cannot connect to LM Studio. Is the server running?')
                } else if (provider === 'deepseek' || provider === 'openai_compatible') {
                    toast.error('Make sure the Base URL and API Keys are correct in your .env.local file.')
                } else {
                    toast.error(errorMessage || 'Error generating code. Please try again later.')
                }
            } else {
                toast.error('Error generating code. Please try again later.')
            }
        } finally {
            setIsGenerating(false)
        }
    }

    return {
        generatedCode,
        isGenerating,
        generationComplete,
        thinkingOutput,
        isThinking,
        generateCode,
        setGeneratedCode
    }
}
