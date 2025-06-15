
export function verifyWebhookSecret(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    // Não está configurado, não checar secret
    return next();
  }

  const signature = req.headers['x-webhook-secret'] || req.headers['x-webhook-token'];
  if (!signature || signature !== secret) {
    console.warn(`⚠️ Tentativa de acesso inválido ao webhook!`);
    return res.status(403).json({ error: "Acesso não autorizado. Secret inválida." });
  }
  next();
}
