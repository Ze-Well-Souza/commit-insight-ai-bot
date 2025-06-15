
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 90000, // 90 segundos de timeout
  maxRetries: 2
});

/**
 * Analisa um commit usando a API da OpenAI, incluindo o diff.
 * @param {object} commitData - Dados do commit.
 * @param {string} commitData.repo - Nome do repositório.
 * @param {string} commitData.author - Autor do commit.
 * @param {string} commitData.message - Mensagem do commit.
 * @param {string} commitData.diff - O diff do commit.
 * @returns {Promise<string>} Análise do commit.
 */
export async function analisarCommit({ repo, author, message, diff }) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Chave da API OpenAI não configurada");
    return "Erro: Chave da API OpenAI não configurada.";
  }
  
  // Limita o diff para não exceder o limite de tokens da API
  const diffLimitado = diff.length > 8000 ? diff.substring(0, 8000) + "\n... (diff truncado)" : diff;

  try {
    console.log("🧠 Enviando commit para análise (com diff)...");
    const start = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: 
            "Você é um especialista em code review. Analise o commit a seguir, focando na qualidade, padrões de código, possíveis bugs e sugestões de melhoria. Seja conciso e direto ao ponto. Forneça o feedback em português."
        },
        {
          role: "user",
          content: `Analise o commit do repositório "${repo}":\n\n` +
                   `**Autor:** ${author}\n` +
                   `**Mensagem:** ${message}\n\n` +
                   `**Alterações (diff):**\n` +
                   `\`\`\`diff\n${diffLimitado}\n\`\`\``,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`🧠 Análise concluída em ${elapsed}s`);
    
    const resposta = completion.choices[0].message.content;
    console.log("📝 Resposta da IA:", resposta.substring(0, 150) + "...");
    return resposta;
    
  } catch (error) {
    console.error("❌ Erro ao chamar a OpenAI:", error.message);
    return `Erro ao chamar a API da OpenAI: ${error.message}`;
  }
}
