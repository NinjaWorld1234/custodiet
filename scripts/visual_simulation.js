/**
 * VISUAL SIMULATION: THE AI BRAIN 🧠
 * Demonstrates the Input -> Processing -> Output flow clearly.
 */

// Need to trick functions into working in standalone script (imports issue)
// We will just copy the relevant logic here to ensure it runs perfectly for demo
// without module complexity.

const delay = ms => new Promise(r => setTimeout(r, ms));
const GROQ_KEY = 'gsk_v3BT09HwRw1QY5kjrhuOWGdyb3FYqnH8DKD6DtNOu94Jy1JZHifbZuJG1Bo9vcIhTmLIKvve';

async function callGroq(prompt) {
    if (!GROQ_KEY) return "NO KEY";
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'llama3-70b-8192', temperature: 0.1 })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Error";
    } catch (e) { return "Error: " + e.message; }
}

async function runVisualSimulation() {
    console.clear();
    console.log("================================================================");
    console.log("   🚀  CUSTODIET AI SIMULATION: OPERATION RED TIDE   🚀");
    console.log("================================================================");
    await delay(800);

    // STEP 1: INPUT
    const RAW_INTEL = "BREAKING: State media announces immediate live-fire naval drills blocking the Strait of Hormuz. Commercial vessels advised to leave area. Tone is aggressive.";
    console.log("\n📡 STEP 1: INTELLIGENCE INGESTION");
    console.log("---------------------------------");
    console.log(`📥 RAW DATA: "${RAW_INTEL}"`);
    console.log("   Source: GDELT | Category: Geopolitics | Time: NOW");
    await delay(1500);

    // STEP 2: PROCESSING
    console.log("\n\n🧠 STEP 2: COGNITIVE PROCESSING (Llama 3 - 70B)");
    console.log("-----------------------------------------------");
    console.log("   ⚡ Sending to Neural Engine (Groq)...");

    const startTime = Date.now();
    const prompt = `Act as Intelligence Analyst. Analyze this report: "${RAW_INTEL}". Output JSON: { "threat_level": "low/medium/high/critical", "summary": "brief summary", "strategic_implication": "one sentence" }`;

    // CALL REAL AI
    const rawResult = await callGroq(prompt);
    const duration = Date.now() - startTime;

    console.log(`   ✅ Analysis Complete in ${duration}ms!`);

    let result = null;
    try {
        result = JSON.parse(rawResult.match(/\{[\s\S]*\}/)?.[0] || "{}");
    } catch (e) { result = rawResult; }

    await delay(1000);

    // STEP 3: OUTPUT
    console.log("\n\n📝 STEP 3: STRATEGIC OUTPUT (The Result)");
    console.log("---------------------------------------");
    if (result && result.threat_level) {
        console.log(`🔴 THREAT LEVEL:  ${result.threat_level.toUpperCase()}`);
        console.log(`📄 EXECUTIVE SUMMARY: ${result.summary}`);
        console.log(`♟️ STRATEGIC IMPLICATION: ${result.strategic_implication}`);
    } else {
        console.log("RAW OUTPUT:", rawResult);
    }

    console.log("\n================================================================");
    console.log("   ✅ SIMULATION COMPLETE: Data Transformed into Wisdom.");
    console.log("================================================================");
}

runVisualSimulation();
