/**
 * AI Configuration 🤖
 * Central management for AI Providers (Groq, Ollama, OpenAI, Roboflow).
 * 
 * INSTRUCTIONS:
 * 1. Get a FREE API Key from Groq: https://console.groq.com/keys
 * 2. Paste it below in GROQ_API_KEY.
 * 3. Set USE_REAL_AI = true to switch from Simulation to Real Intelligence.
 */

export const AI_CONFIG = {
    // Master Switch: Set to 'true' to use real APIs
    USE_REAL_AI: false,

    // Text & Audio Provider (Groq is fastest for Llama 3 & Whisper)
    LLM_PROVIDER: 'groq', // Options: 'groq', 'ollama', 'openai'
    GROQ_MODEL: 'llama3-70b-8192',
    GROQ_API_KEY: '', // Get a FREE key from https://console.groq.com/keys
    GROQ_VISION_MODEL: 'llava-v1.5-7b-4096-preview',
    // GROQ_AUDIO_MODEL: 'distil-whisper-large-v3-en', // DISABLED per user request

    // Vision Provider
    VISION_PROVIDER: 'groq_vision', // Switched to Groq (LLaVA)
    ROBOFLOW_API_KEY: '',

    // Local Options (Privacy Focused)
    OLLAMA_ENDPOINT: 'http://localhost:11434/api/generate',
    OLLAMA_MODEL: 'llama3',
};
