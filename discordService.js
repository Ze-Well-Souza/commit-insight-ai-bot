
import fetch from 'node-fetch';

/**
 * Envia uma notificação de análise de commit para o Discord.
 * @param {object} dados - Os dados para a notificação.
 * @param {string} dados.repo - O nome do repositório.
 * @param {string} dados.author - O autor do commit.
 * @param {string} dados.message - A mensagem do commit.
 * @param {string} dados.url - A URL do commit.
 * @param {string} dados.analise - O texto da análise da IA.
 */
export async function enviarNotificacaoDiscord({ repo, author, message, url, analise }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("⚠️ A variável de ambiente DISCORD_WEBHOOK_URL não está configurada. Notificação pulada.");
    return;
  }

  const embed = {
    title: `📝 Novo Commit Analisado em: ${repo}`,
    url: url,
    color: 0x2ECC71, // Verde
    fields: [
      { name: "Autor", value: author, inline: true },
      { name: "Mensagem", value: `\`\`\`${message}\`\`\``, inline: false },
      { name: "🤖 Análise da IA", value: analise.substring(0, 1024), inline: false },
    ],
    footer: {
      text: "Repo Analyzer Bot",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
    console.log("✅ Notificação enviada para o Discord com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao enviar notificação para o Discord:", error.message);
  }
}
