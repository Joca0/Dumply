# Implementações de Segurança e LGPD no Front-end

Este documento descreve as alterações realizadas no front-end para acompanhar as atualizações de segurança e conformidade implementadas no back-end.

## 1. Proteção contra Brute Force
- **Tratamento de Bloqueio:** O interceptor de API (`api/index.js`) agora captura o erro `429 (Too Many Requests)` e exibe uma mensagem clara de que a conta está temporariamente bloqueada após 5 tentativas falhas.

## 2. Conformidade LGPD (Lei Geral de Proteção de Dados)
- **Onboarding com Consentimento:** A tela de boas-vindas (`WelcomeStep.jsx`) agora exige o aceite explícito da Política de Privacidade. O botão "Começar a usar" só é habilitado após o checkbox ser marcado.
- **Registro de Consentimento:** O aceite é enviado ao back-end junto com a versão da política, garantindo a rastreabilidade do consentimento.
- **Direitos do Titular (Modal de Perfil):**
    - **Consulta de Dados:** Adicionada funcionalidade "Ver Meus Dados", que exibe em tempo real todas as informações pessoais que o sistema possui sobre o usuário.
    - **Portabilidade (Exportação):** Implementado botão para baixar todos os dados pessoais em formato JSON.
    - **Direito ao Esquecimento (Exclusão):** Fluxo de exclusão de conta com dupla confirmação (senha + frase literal). A exclusão no back-end realiza a anonimização dos dados conforme exigido por lei.

## 3. Segurança Multi-fator (2FA)
- **Fluxo de Ativação:** Interface para escanear QR Code e confirmar código TOTP.
- **Desativação Segura:** Processo de desativação que exige código de segurança enviado por e-mail.
- **Visualização de Status:** Indicador visual no perfil se o 2FA está ativo ou não.

## 4. Rastreabilidade e Auditoria
- **Painel de Logs (Somente Owner):** Nova página de Auditoria disponível exclusivamente para o papel Owner, permitindo visualizar:
    - Login (Sucessos e Falhas)
    - Alterações de Senha
    - Bloqueios de Conta
    - Exportação e Exclusão de dados
    - Endereços IP e timestamps de cada evento
- **Filtros Avançados:** Busca por descrição/usuário e filtro por tipo de evento.

## 5. Alterações Técnicas
- **API Services:** Adicionados novos métodos para os endpoints de LGPD e Auditoria em `frontend/src/api/index.js`.
- **Roteamento:** Nova rota `/audit` configurada e protegida por papel (RBAC).
- **Layout:** Links de navegação e novas seções no modal de gerenciamento de conta.
