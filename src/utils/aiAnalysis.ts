export const analyzeProposalWithAI = async (
  title: string,
  description: string
) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("VITE_OPENAI_API_KEY is missing");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional DAO governance analyst. Summarize the proposal's impact and potential risks in exactly 2 concise sentences."
          },
          {
            role: "user",
            content: `Proposal Title: ${title}\nProposal Description: ${description}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);

      if (response.status === 402) {
        throw new Error("OpenAI API error: insufficient credits");
      }

      throw new Error("AI service failed");
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid AI response format");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek / OpenAI Analysis Error:", error);
    throw error;
  }
};
