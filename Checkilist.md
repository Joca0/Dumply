Com base na análise do arquivo `requisitos.md` e do estado atual do projeto no repositório, aqui está a lista do que ainda **falta ser implementado ou documentado** para cumprir todos os requisitos listados:

### 1. Autenticação e Gestão de Credenciais
*   **1.5 e 1.6 Autenticação de Dois Fatores (2FA):** Não há implementação de 2FA (como Google Authenticator, SMS ou e-mail de confirmação) no fluxo de login atual.
*   **1.10 Invalidação de sessão no logout:** Como o sistema utiliza JWT de forma *stateless* (sem estado no servidor), não há um mecanismo de "blacklist" de tokens ou invalidação no servidor ao fazer logout.
*   **1.11 Proteção contra força bruta:** Não foram encontrados mecanismos de *rate limiting* ou bloqueio temporário de IP/usuário após várias tentativas falhas.
*   **1.12 Justificativas técnicas:** Falta um documento formal justificando a escolha das tecnologias (como o uso do BCrypt e JWT).

### 2. Recuperação de Senha
*   **2.1 a 2.7 Fluxo de Recuperação:** Toda a seção 2 está pendente. Não existe funcionalidade de "esqueci minha senha", geração de tokens de recuperação, envio de e-mail ou logs desse processo.

### 3. Criptografia e Comunicação Segura
*   **3.1 a 3.3 TLS/HTTPS:** O projeto está configurado para rodar em HTTP. Falta a configuração de certificados SSL/TLS e a evidência de tráfego cifrado.
*   **3.4 Dados sensíveis em repouso:** Atualmente, apenas as senhas são cifradas (BCrypt). Outros dados sensíveis (como documentos de usuários) estão em texto claro no banco de dados.
*   **3.7 e 3.8 Documentação:** Falta a estratégia de criptografia documentada e as justificativas técnicas.

### 4. Conformidade com a LGPD
*   **4.4 a 4.7 Consentimento:** Não há registro explícito de consentimento, gestão de versões de termos de uso ou data de aceite no banco de dados.
*   **4.8 a 4.10 Direitos do Titular:** Faltam as funcionalidades para o próprio usuário consultar, exportar (portabilidade) ou excluir (anonimização) seus dados pessoais de forma automatizada.
*   **4.1 a 4.3 e 4.11 Documentação:** Falta o mapeamento de dados (Data Mapping) e o fluxo de atendimento aos direitos documentado.

### 5. Auditoria e Logs
*   **5.1 e 5.2 Logs de Autenticação/Falhas:** O sistema não possui logs estruturados que registrem quem logou, quando e se houve falha (especialmente logs persistentes para auditoria).
*   **5.3 Proteção dos logs:** Não há mecanismos de proteção contra alteração de logs.
*   **5.4 Exemplo de análise:** Falta apresentar um relatório ou análise baseada nesses logs.

### 6, 7 e 8. Documentação e Itens Científicos
*   **Todos os itens (6.1 a 8.7):** Embora existam alguns diagramas (`DIAGRAMA_CLASSES.md`), faltam:
    *   Documento de visão geral e arquitetura.
    *   Análise de riscos (Ameaças vs Contramedidas).
    *   Resultados de testes de segurança (Pentest/SAST/DAST).
    *   Resumo Científico (200-300 palavras) e Pôster para apresentação.
    *   Referências bibliográficas normalizadas (ABNT/APA).

### Resumo do que já está feito (Check):
*   `1.1 a 1.4`: Hash de senha com BCrypt e Salt único (gerido pelo BCrypt) estão implementados.
*   `1.9`: Sessões possuem tempo de expiração (configurado para 8 horas no `TokenService.java`).
*   `4.10`: Existe a funcionalidade técnica de `deleteUser`, mas ela remove o registro físico, o que pode precisar de revisão para atender à LGPD (anonimização vs exclusão).
*   `6.2`: Existe um diagrama de classes básico.