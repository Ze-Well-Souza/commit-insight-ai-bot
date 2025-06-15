
import { analisarCommit } from "../openaiService.js";

export const healthCheckHandler = (req, res) => {
    const apiStatus = process.env.OPENAI_API_KEY ? "configurada" : "NÃO configurada";
    const discordStatus = process.env.DISCORD_WEBHOOK_URL ? "configurada" : "NÃO configurada";
    res.status(200).send(`✅ Webhook ativo. OpenAI API: ${apiStatus}. Discord Webhook: ${discordStatus}.`);
};

export const statusHandler = (req, res) => {
    res.status(200).json({
        status: "online",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development',
        apiKeyConfigured: !!process.env.OPENAI_API_KEY,
        envVars: {
            PORT: process.env.PORT || '3000',
            NODE_ENV: process.env.NODE_ENV || 'não definido',
            OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "***configurada***" : "não configurada",
            DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ? "***configurada***" : "não configurada"
        }
    });
};

export const testRepoHandler = async (req, res) => {
    try {
        const repoUrl = "https://github.com/Ze-Well-Souza/techcare-connect-automator";
        const testCommit = {
            message: "Teste de integração",
            author: { name: "Sistema de Teste" },
            url: repoUrl,
            id: "test123"
        };
        
        console.log(`🧪 Testando integração com ${repoUrl}`);

        // Corrigido para passar um objeto, conforme esperado por analisarCommit
        const analysisData = {
          repo: repoUrl,
          author: testCommit.author.name,
          message: testCommit.message,
          diff: `Repositório: ${repoUrl}\nAutor: ${testCommit.author.name}\nMensagem: ${testCommit.message}\nURL: ${testCommit.url}`
        };
        const analise = await analisarCommit(analysisData);
        
        res.status(200).json({
            success: true,
            message: "Teste de integração realizado com sucesso",
            analysis: analise
        });
    } catch (error) {
        console.error("❌ Erro no teste de integração:", error);
        res.status(500).json({
            success: false,
            message: `Erro no teste: ${error.message}`
        });
    }
};
