import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analisarCommit(diff) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um assistente que revisa código de commits e dá sugestões técnicas de melhoria.",
        },
        {
          role: "user",
          content: `Analise o seguinte commit e diga se há problemas técnicos, sugestões de melhoria ou boas práticas:\n\n${diff}`,
        },
      ],
    });

    console.log("🧠 GPT respondeu:\n", completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ Erro ao chamar a OpenAI:", error.message);
  }
}
