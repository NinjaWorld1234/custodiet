import { UnifiedEvent } from '../types';
import { AI_CONFIG } from './aiConfig';
import { COUNTRY_TRANSLATIONS } from '../constants';

/**
 * AI SERVICE: The Cognitive Layer 🧠
 * Wraps calls to Open Source Models (Llama 3, YOLOv8, Whisper).
 * 
 * IMPLEMENTATION NOTE: 
 * For this MVP phase, we are SIMULATING the heavy model inference 
 * to prove the architecture. In production, these would be calls to:
 * - http://localhost:11434/api/generate (Ollama/Llama3)
 * - http://localhost:9001/inference (Roboflow/YOLO)
 */

interface AIAnalysisResult {
    summary?: string;
    sentiment?: { score: number, label: 'positive' | 'negative' | 'neutral' };
    detected_objects?: string[];
    audio_transcript?: string;
}

// --- REAL API UTILS ---

const callGroqLLM = async (prompt: string): Promise<string> => {
    if (!AI_CONFIG.GROQ_API_KEY) return "Error: No API Key provided for Groq.";

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_CONFIG.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: AI_CONFIG.GROQ_MODEL,
                temperature: 0.5
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "AI Error: No response";
    } catch (e) {
        console.error("Groq API Failed", e);
        return "AI Connection Error";
    }
};

// --- ANALYSTS ---

// 1. TEXT ANALYST (Llama 3)
const analyzeTextWithLLM = async (text: string, context: string): Promise<Pick<AIAnalysisResult, 'summary' | 'sentiment'>> => {
    // REAL MODE
    if (AI_CONFIG.USE_REAL_AI) {
        const prompt = `
        Act as a Military Intelligence Analyst.
        Summarize the following event in one concise strategic sentence (max 20 words).
        Then, provide a sentiment score (-1.0 to 1.0) and label (positive/negative/neutral).
        
        Event: ${text}
        Context: ${context}
        
        Output format JSON: { "summary": "...", "score": -0.5, "label": "negative" }
        Only return JSON.
        `;

        const raw = await callGroqLLM(prompt);
        // Basic parsing try/catch for JSON
        try {
            const parsed = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
            return {
                summary: parsed.summary,
                sentiment: { score: parsed.score, label: parsed.label }
            };
        } catch (e) {
            return { summary: raw.substring(0, 100) + "...", sentiment: { score: 0, label: 'neutral' } };
        }
    }

    // SIMULATION MODE
    // Heuristic Simulation for Demo
    // We return the original text as 'summary' so the Translation Dictionary can match keywords in it.
    // In a real app, the LLM would generate a new summary and valid JSON.
    const isConflict = text.toLowerCase().includes('conflict') || text.toLowerCase().includes('attack');
    const isCyber = text.toLowerCase().includes('cyber') || text.toLowerCase().includes('hack');

    return {
        summary: text, // Keep original text so dictionary translation works
        sentiment: {
            score: isConflict ? -0.8 : -0.4,
            label: 'negative'
        }
    };
};

// 2. VISION ANALYST (Groq LLaVA)
const analyzeImageWithGroq = async (imageUrl: string): Promise<string[]> => {
    if (!AI_CONFIG.USE_REAL_AI || !AI_CONFIG.GROQ_API_KEY) {
        // Fallback to Simulation
        const objects = ['Arleigh Burke Destroyer', 'Fishing Vessel', 'Oil Tanker', 'Zodiac Skiff'];
        return [objects[Math.floor(Math.random() * objects.length)]];
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AI_CONFIG.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: "List the military or maritime objects in this image. Return ONLY a JSON array of strings. Example: ['Ship', 'Tank']. Do not explain." },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }],
                model: AI_CONFIG.GROQ_VISION_MODEL,
                temperature: 0.1
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "[]";

        // Parse JSON array from text
        const match = content.match(/\[.*\]/s);
        if (match) {
            return JSON.parse(match[0]);
        }
        return [content.substring(0, 20)]; // Fallback if no JSON found

    } catch (e) {
        console.error("Vision Analysis Failed", e);
        return ["Vision Error"];
    }
};


// 3. TRANSLATION AGENT (Llama 3)
export const translateText = async (text: string, targetLang: 'ar' | 'en' | 'de'): Promise<string> => {
    if (!text) return "";

    // Quick cache check (mock)
    // In real app, we'd cache by hash(text+lang) to save tokens

    if (AI_CONFIG.USE_REAL_AI && AI_CONFIG.GROQ_API_KEY) {
        const prompt = `
        Translate the following text to ${targetLang === 'ar' ? 'Arabic' : targetLang === 'de' ? 'German' : 'English'}.
        Ensure the tone is professional and suitable for a military/intelligence report.
        Do not add explanations. Just return the translated text.
        
        Text: "${text}"
        `;

        const translation = await callGroqLLM(prompt);
        return translation.replace(/"/g, '').trim(); // Clean up quotes
    }

    // SIMULATION MODE
    // Dictionary of pre-translated phrases for the Mock Data to ensure it looks "Real"
    if (targetLang === 'ar') {
        const lower = text.toLowerCase();

        // --- USGS / REALTIME PATTERNS ---

        // Pattern: M 3.4 - 49 km WSW of Kailua-Kona, Hawaii
        // Regex to capture Magnitude, Distance, Direction, Location
        const usgsTitleParams = text.match(/M\s?([\d\.]+)\s?(-|Explosion|Quake)?\s?-\s?([\d\.]+)\s?km\s?([NSEW]+)?\s?of\s?(.*)/i);
        if (usgsTitleParams) {
            const mag = usgsTitleParams[1];
            const typeRaw = usgsTitleParams[2] || '';
            const type = typeRaw.toLowerCase().includes('explosion') ? 'انفجار' : 'زلزال';
            const dist = usgsTitleParams[3];
            const dirRaw = usgsTitleParams[4] || '';
            const loc = usgsTitleParams[5];

            // Map directions
            const dirs: Record<string, string> = {
                'N': 'شمال', 'S': 'جنوب', 'E': 'شرق', 'W': 'غرب',
                'NE': 'شمال شرق', 'NW': 'شمال غرب', 'SE': 'جنوب شرق', 'SW': 'جنوب غرب',
                'NNE': 'شمال شمال شرق', 'NNW': 'شمال شمال غرب', // etc... simplified
                'ENE': 'شرق شمال شرق', 'WNW': 'غرب شمال غرب',
                'WSW': 'غرب جنوب غرب', 'ESE': 'شرق جنوب شرق',
                'SSW': 'جنوب جنوب غرب', 'SSE': 'جنوب جنوب شرق'
            };
            const dirAr = dirs[dirRaw.toUpperCase()] || dirRaw;

            // Translate Country if possible
            let locAr = loc;
            const parts = loc.split(',').map(s => s.trim());
            if (parts.length > 0) {
                const countryKey = parts[parts.length - 1];
                const countryTrans = COUNTRY_TRANSLATIONS[countryKey]?.['ar'];
                if (countryTrans) {
                    if (parts.length > 1) {
                        // "Calumet, Oklahoma" -> "Oklahoma - Calumet" (Arabic style often reverses or keeps as is)
                        // Let's keep it "Calumet, أوكلاهوما" or just replace the country part
                        parts[parts.length - 1] = countryTrans;
                        locAr = parts.join('، '); // Use Arabic comma
                    } else {
                        locAr = countryTrans;
                    }
                }
            }

            return `${type} بقوة ${mag} - على بعد ${dist} كم ${dirAr} من ${locAr}`;
        }

        // Simple USGS fallback (just Magnitude)
        if (text.match(/^M\s?[\d\.]+/)) {
            return text.replace('M ', 'زلزال بقوة ').replace('Explosion', 'انفجار').replace(' km ', ' كم ').replace(' of ', ' من ');
        }

        // Summary: Depth: 3.36km. Magnitude: 3.35
        if (lower.includes('depth:') && lower.includes('magnitude:')) {
            return text.replace('Depth:', 'العمق:').replace('Magnitude:', 'القوة:').replace('km', ' كم');
        }

        // --- STATIC DICTIONARY ---

        // --- STATIC DICTIONARY (EXPANDED) ---

        // Mock Scenarios
        if (lower.includes('ssh port 22')) return "تم اكتشاف محاولة وصول غير مصرح بها للجذر عبر منفذ SSH 22.";
        if (lower.includes('health check')) return "تم اجتياز فحص الحالة الروتيني بنجاح.";
        if (lower.includes('massive protest')) return "تجمعات احتجاجية ضخمة بالقرب من ساحة المدينة للمطالبة بتغيير السياسات.";
        if (lower.includes('viral infection')) return "رصد تفشي جديد لعدوى فيروسية في المستشفى الإقليمي.";
        if (lower.includes('darkcry')) return "برمجية الفدية 'DarkCry' تستهدف المؤسسات المالية.";
        if (lower.includes('coordinated attacks')) return "معلومات استخباراتية موثوقة حول هجمات منسقة على مراكز النقل.";
        if (lower.includes('border skirmishes')) return "تقارير عن تصاعد المناوشات الحدودية في المنطقة.";
        if (lower.includes('teachers marching')) return "مسيرة للمعلمين للمطالبة بزيادة الأجور في وسط المدينة.";
        if (lower.includes('small arms')) return "أنباء عن تبادل لإطلاق نار بالأسلحة الخفيفة.";

        // ACLED & General Terms
        if (lower.includes('battles') && lower.includes('remote outpost')) return "اشتباكات مسلحة في موقع نائي.";
        if (lower.includes('armed clash')) return "اشتباك مسلح.";
        if (lower.includes('protests') && lower.includes('madrid')) return "احتجاجات في مدريد.";
        if (lower.includes('peaceful protest')) return "احتجاج سلمي.";
        if (lower.includes('ransomware')) return "هجوم فدية (Ransomware).";
        if (lower.includes('malware')) return "برمجيات خبيثة.";

        // Partial Matches for Dynamic Composition
        if (lower.includes('battles')) return lower.replace('battles', 'معارك').replace(' in ', ' في ');
        if (lower.includes('protests')) return lower.replace('protests', 'احتجاجات').replace(' in ', ' في ');
        if (lower.includes('explosion')) return lower.replace('explosion', 'انفجار');

        // Fallback for unknown text - Return plain text to avoid ugliness
        // If we can't translate it, better not to show [Translate]
        return text;
    }

    if (targetLang === 'de') return `[Automatische Übersetzung]: ${text}`;
    return text;
}

// 4. AUDIO ANALYST (Disabled)
const analyzeAudioWithGroq = async (audioUrl: string): Promise<string> => {
    return "Audio Analysis Disabled under current Rules of Engagement.";
};

// MAIN ORCHESTRATOR
export const enrichEventWithAI = async (event: UnifiedEvent): Promise<UnifiedEvent> => {
    const insights: AIAnalysisResult = {};

    // A. Always run Text Analysis
    const textResult = await analyzeTextWithLLM(event.summary, event.category);
    insights.summary = textResult.summary;
    insights.sentiment = textResult.sentiment;

    // B. Run Vision (Aggressive Mode)
    if (event.url && (event.url.match(/\.(jpeg|jpg|gif|png)$/) != null)) {
        insights.detected_objects = await analyzeImageWithGroq(event.url);
    }
    else if (event.tags.includes('ais')) {
        insights.detected_objects = ['Simulated Vessel (No Image Source)'];
    }

    // C. Auto-Translation (New Feature)
    // We translate to Arabic by default for the "Arrival" view as requested
    // In a real app, this target lang would come from User Settings context
    let translated = undefined;
    try {
        const [trTitle, trSummary] = await Promise.all([
            translateText(event.title, 'ar'),
            translateText(insights.summary || event.summary, 'ar')
        ]);
        translated = {
            title: trTitle,
            summary: trSummary,
            lang: 'ar'
        };
    } catch (e) {
        console.warn("Auto-translation failed", e);
    }

    // Return enriched event
    return {
        ...event,
        ai_insights: insights,
        translated
    };
};
