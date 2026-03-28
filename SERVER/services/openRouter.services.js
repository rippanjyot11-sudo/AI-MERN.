    



    import axios from "axios"

export const askAi = async (messages) => {
    try {
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini",
          messages: messages,
          max_tokens: 1000
        },
        { headers: {
            Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            "HTTP-Referer": "http://localhost:5173", // Required by some OpenRouter models
      "X-Title": "InterviewIQ",
        }});

        const content = response?.data?.choices?.[0]?.message?.content;    // jo bhi response milega use content mai dalnge;

        // ✅ Clean code fences if returned in ```json format
        const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();

        if (!cleanedContent || !cleanedContent.trim()) {
            throw new Error("AI returned empty response.");
        }

        return cleanedContent;          

    } catch (error) {
        console.error("OpenRouter Error:", error.response?.data || error.message);
        throw new Error("OpenRouter API Error");
    }
}
