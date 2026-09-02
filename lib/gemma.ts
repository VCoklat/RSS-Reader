import { GoogleGenerativeAI } from "@google/generative-ai";

// Wraps the Gemini API call to Google's Gemma model. Given full article
// text, returns a short summary plus a few actionable insights.
export async function summarizeWithGemma(
  title: string,
  fullText: string
): Promise<{ summary: string; insights: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fail soft: ingestion should still store the article without AI output
    // rather than blocking the whole cron run.
    return { summary: "", insights: "" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemma-3-27b-it",
  });

  // Truncate to keep prompt/token usage predictable at scale.
  const truncated = fullText.slice(0, 12000);

  const prompt = `You are an assistant that condenses articles for a busy research reader.
Article title: ${title}
Article text:
"""
${truncated}
"""

Respond in exactly this format, no extra commentary:
SUMMARY: <2-3 sentence summary>
INSIGHTS: <2-4 bullet points of actionable takeaways, separated by " | ">`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?:\nINSIGHTS:|$)/i);
    const insightsMatch = text.match(/INSIGHTS:\s*([\s\S]*)/i);

    return {
      summary: summaryMatch?.[1]?.trim() ?? text.trim(),
      insights: insightsMatch?.[1]?.trim() ?? "",
    };
  } catch (err) {
    console.error("Gemma summarization failed:", err);
    return { summary: "", insights: "" };
  }
}
