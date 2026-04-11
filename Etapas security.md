Com base na análise do arquivo `requisitos.md` e do estado atual do código-fonte no projeto **Dumply**, aqui está o plano detalhado para implementar e validar a **Etapa 1: Autenticação e Gestão de Credenciais**.

Atualmente, o projeto já possui uma base sólida com Spring Security, BCrypt e JWT, mas ainda faltam componentes críticos para a conformidade total com os requisitos.

### Status Atual da Etapa 1

| Item | Descrição | Status | Observação |
| :--- | :--- | :--- | :--- |
| 1.1 | Hash criptográfico seguro | ✅ OK | Utiliza `BCryptPasswordEncoder` em `SecurityConfig.java`. |
| 1.2 | Parâmetros de custo | ⚠️ Parcial | Utiliza o padrão (10). Precisa ser explicitado/justificado. |
| 1.3 | Salt criptográfico único | ✅ OK | O BCrypt gera e armazena o salt automaticamente no hash. |
| 1.4 | Armazenamento correto | ✅ OK | Salvo na coluna `password` da tabela `users`. |
| 1.5 | Autenticação 2FA | ❌ Pendente | Não há lógica de MFA (e-mail, SMS ou TOTP). |
| 1.6 | Validação do 2FA | ❌ Pendente | Depende da implementação do 1.5. |
| 1.7 | Fluxo documentado | ⚠️ Parcial | Existe um `DIAGRAMA_CLASSES.md`, mas falta o fluxo de sequência. |
| 1.9 | Tempo de expiração | ✅ OK | Configurado para 8 horas em `TokenService.java`. |
| 1.10 | Invalidação no logout | ❌ Pendente | JWT é stateless; falta blacklist ou revogação. |
| 1.11 | Proteção Força Bruta | ❌ Pendente | Falta Rate Limiting ou bloqueio de conta. |

---

### Plano de Implementação para Completar a Etapa 1

#### 1. Implementação de Autenticação de Dois Fatores (1.5 e 1.6)
*   **Ação:** Adicionar um campo `secret2fa` e `is2faEnabled` na entidade `User`.
*   **Ação:** Implementar um serviço para gerar códigos (ex: usando a biblioteca Google Authenticator ou envio de código por e-mail).
*   **Fluxo:** No login, se o 2FA estiver ativo, retornar um "token provisório" que permite apenas a chamada do endpoint `/auth/verify-2fa`.

#### 2. Proteção contra Força Bruta (1.11)
*   **Ação:** Implementar um `LoginAttemptService` que utiliza o cache do Spring ou um banco de dados em memória (como Redis ou um simples HashMap limitado) para contar tentativas falhas por e-mail/IP.
*   **Ação:** Bloquear o usuário por 15-30 minutos após 5 tentativas falhas.

#### 3. Invalidação de Sessão no Logout (1.10)
*   **Ação:** Como o sistema é stateless, a melhor abordagem para o requisito é implementar uma **Blacklist de Tokens**.
*   **Ação:** Ao chamar `/auth/logout`, o token atual é armazenado em um cache (com tempo de vida igual ao tempo restante do token). O `SecurityFilter` deve verificar se o token está na blacklist.

#### 4. Documentação e Justificativas (1.2, 1.7, 1.8, 1.12)
*   **Ação:** Criar um arquivo `docs/SECURITY.md` contendo:
    *   Justificativa do uso de **BCrypt** (resistência a ataques de dicionário e brute force via custo computacional).
    *   Diagrama de sequência do fluxo de login (incluindo o novo 2FA).
    *   Explicação de como o Salt é gerido.
    *   Prints ou logs comprovando o bloqueio por força bruta.

### Próximos Passos Recomendados

Para finalizar a Etapa 1, recomendo focar primeiro na **Proteção contra Força Bruta** e no **Mecanismo de Logout**, pois são alterações de infraestrutura de segurança essenciais antes de adicionar a complexidade do 2FA.

Deseja que eu detalhe a estrutura de classes necessária para o **Rate Limiting (Força Bruta)** ou para a **Blacklist de Tokens**?