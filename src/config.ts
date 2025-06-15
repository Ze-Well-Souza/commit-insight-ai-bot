
// Usamos variáveis de ambiente do Vite para configurar a URL da API.
// Em produção, você deve definir VITE_API_URL no seu serviço de hospedagem (ex: Railway, Vercel).
// Em desenvolvimento, ele usará o valor padrão 'http://localhost:3000'.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
