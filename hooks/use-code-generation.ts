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
    previousCode?: string
}

// Interface for NDJSON stream parts
interface StreamPart {
    type: 'text' | 'reasoning' | 'error'
    content: string
}

const DESIGN_EXCELLENCE_SUFFIX = `

## ELITE MASTERPIECE MANDATE (CRITICAL)
- Apply a deep, premium dark theme: Background hsl(222 47% 4%), Surfaces hsl(222 47% 7%).
- Use Glassmorphism (backdrop-blur-xl + bg-white/5) for all cards.
- Implement a structured Bento Grid layout for information density.
- Use GSAP (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js) for staggered entrance animations.
- Use Lucide Icons (https://unpkg.com/lucide@latest) with initialization.
- Every button MUST have hover:scale-[1.02] and hover:shadow-[0_0_20px_rgba(59,130,246,0.3)].
- Ensure high-fidelity typography (Outfit for headings, Inter for UI).
- AUTOMATICALLY include Meta Tags (Title, Description) and OpenGraph tags.
- STRICTLY output the RAW HTML code only. No markdown blocks.
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
        attachedFiles,
        previousCode
    }: GenerateCodeParams) => {
        if (!prompt.trim() || !model || !provider) {
            toast.error("Please enter a prompt and select a provider and model.")
            return
        }

        const finalPrompt = `
### PROJECT REQUIREMENTS:
${prompt}

---
### TECHNICAL SPECIFICATIONS:
${DESIGN_EXCELLENCE_SUFFIX}
`;

        setIsGenerating(true)
        if (!previousCode) {
          setGeneratedCode("")
        }
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
                    attachedFiles: processedFiles,
                    previousCode
                }),
            })

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json()
                    if (errorData && errorData.error) {
                        errorMsg = errorData.error;
                    }
                } catch (jsonError) {
                    // Ignore json parse error
                }
                throw new Error(errorMsg)
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
                            
                            // 1. Try to find complete HTML structure
                            const htmlMatch = codeBuffer.match(/<!DOCTYPE html>[\s\S]*?<\/html>|<html>[\s\S]*?<\/html>/i);
                            if (htmlMatch) {
                                setGeneratedCode(htmlMatch[0]);
                            } else {
                                // 2. Robust markdown block extraction
                                // Match anything between ```html and ``` or just between ``` and ```
                                const blockMatch = codeBuffer.match(/```(?:html|xml|markdown)?\n?([\s\S]*?)(?:```|$)/i);
                                if (blockMatch && blockMatch[1].trim()) {
                                    setGeneratedCode(blockMatch[1].trim());
                                } else {
                                    // 3. Fallback: try to strip delimiters if they exist at start/end
                                    const cleanCode = codeBuffer
                                        .replace(/^```(?:html|xml|markdown)?\n?/, '')
                                        .replace(/```$/, '')
                                        .trim();
                                    setGeneratedCode(cleanCode);
                                }
                            }
                        } else if (part.type === 'reasoning') {
                            if (!hasReceivedReasoning) {
                                setIsThinking(true)
                                hasReceivedReasoning = true
                            }
                            reasoningBuffer += part.content
                            setThinkingOutput(reasoningBuffer)
                        } else if (part.type === 'error') {
                            throw new Error(part.content || 'Error from AI stream');
                        }
                    } catch (parseError: any) {
                        if (parseError.message && (parseError.message.includes('JSON') || parseError.message.includes('Unexpected token'))) {
                            console.warn('Failed to parse stream part:', line, parseError)
                        } else {
                            throw parseError; // Rethrow if it's our manual error from line 186
                        }
                    }
                }
            }

            // Process any remaining content in the buffer
            if (lineBuffer.trim()) {
                try {
                    const part: StreamPart = JSON.parse(lineBuffer)
                    if (part.type === 'text') {
                        codeBuffer += (part.content || "")
                        setGeneratedCode(codeBuffer.replace(/^```html\n?/, '').replace(/```$/, '').trim())
                    } else if (part.type === 'reasoning') {
                        reasoningBuffer += (part.content || "")
                        setThinkingOutput(reasoningBuffer)
                    } else if (part.type === 'error') {
                        throw new Error(part.content || 'Error from AI stream');
                    }
                } catch (e: any) {
                    // Rethrow if it's our manual error
                    if (e.message && e.message.includes('Error from AI stream')) throw e;
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
