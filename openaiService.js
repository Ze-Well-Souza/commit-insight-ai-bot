
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// Criar cliente OpenAI com configuração de timeout e retry
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 segundos de timeout
  maxRetries: 3   // Máximo de 3 tentativas em caso de erro
});

/**
 * Analisa um commit usando a API da OpenAI
 * @param {string} diff - Informações do commit para análise
 * @returns {Promise<void>}
 */
export async function analisarCommit(diff) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Chave da API OpenAI não configurada");
    return;
  }

  try {
    console.log("🧠 Enviando commit para análise...");
    
    const start = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Usando modelo mais rápido e econômico
      messages: [
        {
          role: "system",
          content: 
            "Você é um assistente especializado em code review que analisa commits do GitHub. " +
            "Forneça feedback técnico construtivo, identifique possíveis problemas e sugira melhorias."
        },
        {
          role: "user",
          content: `Analise o seguinte commit e forneça uma avaliação técnica estruturada:\n\n${diff}`,
        },
      ],
      temperature: 0.3, // Menor temperatura para respostas mais consistentes
      max_tokens: 1000,  // Limitar tamanho da resposta
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log(`🧠 Análise concluída em ${elapsed}s`);
    console.log("📝 Resposta da IA:", completion.choices[0].message.content.substring(0, 150) + "...");
    
    // Aqui você poderia salvar a análise em um banco de dados
    // ou enviar para algum outro serviço/webhook
    
    return completion.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      console.error(`❌ Erro da API OpenAI [${error.response.status}]:`, error.response.data);
    } else {
      console.error("❌ Erro ao chamar a OpenAI:", error.message);
    }
    throw error; // Repassar o erro para tratamento superior
  }
}
