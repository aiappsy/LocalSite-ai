import { LLMProvider } from '../lib/providers/config';
import { generateCodeStream } from '../lib/providers/provider';

async function test() {
  const prompt = "Change the button to red";
  const previousCode = "<html><body><button>Hello</button></body></html>";
  
  console.log("Testing Iterative Prompt Construction...");
  
  // We can't easily run generateCodeStream because of dependencies, 
  // but we can look at the code or try to isolate the logic.
  
  // The logic we want to test is:
  /*
  let currentPrompt = prompt;
  if (options?.previousCode) {
    currentPrompt = `...`.trim();
  }
  */
  
  const currentPrompt = `
I have some existing code that I need you to update.

EXISTING CODE:
${previousCode}

USER REQUEST FOR UPDATES:
${prompt}

Please apply the requested changes to the existing code and output the COMPLETE upgraded HTML file.
IMPORTANT RULES:
1. Output ONLY the raw HTML code.
2. Start with <!DOCTYPE html> and end with </html>.
3. Incorporate all requested updates while preserving existing functionality unless asked to change it.
4. Do NOT include any markdown code blocks or explanations.
5. The output must be a complete, self-contained file including all CSS and JS.
`.trim();

  console.log("CONSTRUCTED PROMPT:");
  console.log("-------------------");
  console.log(currentPrompt);
  console.log("-------------------");
}

test();
