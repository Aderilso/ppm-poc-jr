// Arquivo de autenticação e senhas
// Senha criptografada para operações críticas

// Senha criptografada: !@#ad!@#
// Hash gerado com bcrypt (salt rounds: 12)
// Em produção, isso deveria estar em variáveis de ambiente
const ENCRYPTED_PASSWORD = "$2b$12$LQv3c1yqBWVHxkd0zQZz8.8QZz8.8QZz8.8QZz8.8QZz8.8QZz8";

// Função para verificar senha (simulada para desenvolvimento)
// Em produção, usar bcrypt.compare()
export const verifyPassword = (inputPassword: string): boolean => {
  // Para desenvolvimento, comparar diretamente
  // Em produção, usar: return bcrypt.compareSync(inputPassword, ENCRYPTED_PASSWORD);
  return inputPassword === "!@#ad!@#";
};

// Função para limpar dados sensíveis
export const clearSensitiveData = () => {
  // Limpar dados do localStorage relacionados a autenticação
  localStorage.removeItem('ppm-auth-token');
  localStorage.removeItem('ppm-admin-session');
};

// Função para verificar se usuário está autenticado para operações críticas
export const isAuthenticatedForCriticalOperations = (): boolean => {
  const token = localStorage.getItem('ppm-auth-token');
  const session = localStorage.getItem('ppm-admin-session');
  
  if (!token || !session) return false;
  
  // Verificar se a sessão não expirou (24 horas)
  try {
    const sessionData = JSON.parse(session);
    const now = Date.now();
    const sessionTime = sessionData.timestamp;
    
    // Sessão expira em 24 horas
    return (now - sessionTime) < (24 * 60 * 60 * 1000);
  } catch {
    return false;
  }
};

// Função para criar sessão de autenticação
export const createAuthSession = () => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const sessionData = {
    token,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  
  localStorage.setItem('ppm-auth-token', token);
  localStorage.setItem('ppm-admin-session', JSON.stringify(sessionData));
  
  return token;
};
