
interface PuterAI {
  chat(
    message: string,
    options?: {
      model?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    }
  ): Promise<any>;
  
  txt2img(
    prompt: string,
    options?: {
      model?: string;
      width?: number;
      height?: number;
      num_inference_steps?: number;
      guidance_scale?: number;
      negative_prompt?: string;
    }
  ): Promise<HTMLImageElement>;
}

interface Puter {
  ai: PuterAI;
}

declare global {
  interface Window {
    puter: Puter;
  }
}

export {};
