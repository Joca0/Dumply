# Conformidade com a Lei Geral de Proteção de Dados (LGPD)

Este documento descreve a implementação dos controles de privacidade e proteção de dados pessoais no projeto **Dumply**, em atendimento à **Lei nº 13.709/2018 (LGPD)** e aos requisitos 4.1 a 4.11 do arquivo `REQUIREMENTS.md` (disciplina de Segurança da Informação — Universidade de Mogi das Cruzes / UMC).

> **Controlador dos Dados:** Dumply — Projeto Acadêmico
> **Encarregado pelo Tratamento de Dados (DPO):** [nome do responsável] — `dpo@dumply.local`
> **Versão da Política de Privacidade vigente:** `v1.0`
> **Versão do schema de exportação:** `1.0`
> **Última atualização:** 2026-05-12

---

## 1. Introdução

A LGPD estabelece princípios e obrigações para o tratamento de dados pessoais, com o objetivo de proteger os direitos fundamentais de liberdade, privacidade e o livre desenvolvimento da personalidade do titular (Art. 1º). Este documento sistematiza, sob a ótica técnica, como o sistema **Dumply** materializa tais obrigações em sua arquitetura, modelagem de dados e fluxos de processamento.

A abordagem adotada segue o paradigma **Privacy by Design** (Cavoukian, 2011), incorporando a proteção de dados desde a concepção do software, e o paradigma **Privacy by Default**, garantindo que as configurações mais restritivas sejam aplicadas por padrão.

### 1.1 Arquitetura Multi-Tenant

O Dumply adota arquitetura **multi-tenant** baseada em duas entidades principais: `User` (pessoa física — titular de dados pessoais) e `Company` (pessoa jurídica — cliente contratante). Embora a LGPD se aplique ao tratamento de dados de pessoas naturais (Art. 1º), o sistema adota o princípio da cautela e estende controles equivalentes aos dados da `Company` quando há vinculação indireta a pessoa física (ex.: MEI, EIRELI, empresário individual).

---

## 2. Mapeamento Requisito × Implementação

| Req. | Item | Mecanismo | Artefato no Repositório |
|---|---|---|---|
| 4.1 | Listagem de dados pessoais | Tabelas enumerativas (Seção 4.1) | `model/User.java`, `model/Company.java` |
| 4.2 | Finalidade dos dados | Tabela finalidade × base legal | Seção 4.2 |
| 4.3 | Minimização | Privacy by Design | `model/User.java`, `common/dto/ProfileDTO.java` |
| 4.4 | Registro de consentimento | Campos no `User` + entidade `ConsentLog` | `model/User.java`, `model/ConsentLog.java`, `service/AuthService.completeWelcome` |
| 4.5 | Consentimento × finalidade | Enum `ConsentPurpose` + coluna `purpose` | `common/dto/ConsentPurpose.java`, `service/ConsentService.grantConsent` |
| 4.6 | Revogação | `DELETE /lgpd/consent` | `controller/LgpdController.revokeConsent` |
| 4.7 | Data e versão | Colunas `timestamp` e `version` (append-only) | `model/ConsentLog.java`, `repository/ConsentLogRepository.java` |
| 4.8 | Consulta | `GET /lgpd/me/data` | `service/LgpdService.getMyData` |
| 4.9 | Exportação | `GET /lgpd/me/export` | `service/LgpdService.exportMyData` |
| 4.10 | Exclusão | `DELETE /lgpd/me` (anonimização estruturada) | `service/LgpdService.deleteMyAccount` |
| 4.11 | Fluxo documentado | Seção 4.11 deste documento | `LGPD.md` |

---

## 4.1 Listagem Completa dos Dados Pessoais Coletados

A aplicação coleta apenas os dados pessoais estritamente necessários à autenticação segura do titular, ao funcionamento da arquitetura multi-tenant e à gestão do ciclo de vida contratual da empresa contratante.

### 4.1.1 Inventário dos Dados Pessoais (entidade `User`)

Implementação em `src/main/java/com/dumply/model/User.java`.

| Atributo | Tipo Java | Categoria LGPD (Art. 5º) | Armazenamento | Origem |
|---|---|---|---|---|
| `id` | `UUID` | Identificador interno | UUID gerado pelo JPA | Sistema |
| `email` | `String` | Dado pessoal (Art. 5º, I) | Texto em claro | Titular |
| `fullName` | `String` | Dado pessoal | Texto em claro | Titular |
| `document` | `String` (CPF/CNPJ) | Identificador civil | Texto em claro | Titular |
| `password` | `String` | Credencial | **Hash BCrypt + salt** | Titular |
| `secret2fa` | `String` | Credencial (segredo TOTP) | Texto (revogável) | Sistema |
| `is2faEnabled` | `boolean` | Atributo de configuração | Boolean | Sistema |
| `firstLogin` | `boolean` | Telemetria funcional | Boolean | Sistema |
| `failedLoginAttempts` | `int` | Telemetria de segurança | Inteiro | Sistema |
| `locktime` | `LocalDateTime` | Telemetria de segurança | Timestamp | Sistema |
| `passwordResetToken` | `String` | Token temporário (TTL 1h) | Texto (UUID) | Sistema |
| `passwordResetExpiresAt` | `LocalDateTime` | Carimbo de expiração | Timestamp | Sistema |
| `accountNonLocked` | `boolean` | Estado da conta | Boolean | Sistema |
| `disable2faCode` | `String` | Código transacional one-time | Texto | Sistema |
| `role` | `Role` (enum) | Atribuição funcional | Texto | Sistema |
| `consentGiven` | `Boolean` | **Registro de consentimento** | Boolean | Titular |
| `consentGivenAt` | `LocalDateTime` | **Carimbo do consentimento** | Timestamp | Sistema |
| `consentVersion` | `String` | **Versão do termo aceito** | Texto (ex.: `"v1.0"`) | Sistema |
| `company_id` (FK) | `UUID` | Vínculo organizacional | UUID | Sistema |

### 4.1.2 Inventário dos Dados de Pessoa Jurídica (entidade `Company`)

Implementação em `src/main/java/com/dumply/model/Company.java`.

| Atributo | Tipo | Natureza | Armazenamento |
|---|---|---|---|
| `id` | `UUID` | Identificador interno | UUID |
| `name` | `String` | Razão social / nome fantasia | Texto |
| `slug` | `String` | Identificador público único | Texto |
| `status` | `CompanyStatus` (enum) | Estado contratual | Texto |
| `trialEndsAt` | `LocalDateTime` | Fim do período de avaliação | Timestamp |
| `createdAt` | `LocalDateTime` | Carimbo de criação | Timestamp |

### 4.1.3 Inventário dos Dados de Auditoria de Consentimento (entidade `ConsentLog`)

Implementação em `src/main/java/com/dumply/model/ConsentLog.java`. Tabela **append-only** (Req. 4.7).

| Atributo | Tipo | Finalidade |
|---|---|---|
| `id` | `UUID` | Identificador do evento |
| `userId` | `UUID` | Referência ao titular |
| `action` | `String` | `"GRANT"` ou `"REVOKE"` |
| `purpose` | `String` | Finalidade específica (vide `ConsentPurpose`) |
| `version` | `String` | Versão da política aceita |
| `ipAddress` | `String` | IP de origem da manifestação |
| `userAgent` | `String` | User-Agent do dispositivo |
| `timestamp` | `LocalDateTime` | Carimbo temporal automático (`@PrePersist`) |

### 4.1.4 Dados Pessoais **Não Coletados**

Em obediência ao princípio da necessidade (Art. 6º, III da LGPD), o sistema **não coleta**: endereço residencial, telefone, data de nascimento, gênero, dados biométricos, geolocalização, dados financeiros (cartão), nem qualquer dado pessoal sensível previsto no Art. 5º, II (origem racial, convicção religiosa, opinião política, filiação sindical, saúde, vida sexual, dados genéticos ou biométricos).

---

## 4.2 Associação de Cada Dado a uma Finalidade

Em conformidade com o princípio da finalidade (Art. 6º, I da LGPD), cada dado coletado está vinculado a um propósito legítimo e a uma base legal do Art. 7º.

### 4.2.1 Finalidades dos Dados Pessoais (`User`)

| Dado | Finalidade | Base Legal (Art. 7º LGPD) |
|---|---|---|
| `email` | Identificação no login e envio de mensagens transacionais | V — Execução de contrato |
| `fullName` | Personalização e identificação humana | V — Execução de contrato |
| `document` | Identificação civil no contexto multi-tenant | II — Cumprimento de obrigação legal |
| `password` (hash) | Autenticação primária | V — Execução de contrato |
| `secret2fa` | Autenticação de dois fatores | IX — Legítimo interesse (segurança) |
| `failedLoginAttempts`, `locktime`, `accountNonLocked` | Proteção contra força bruta | IX — Legítimo interesse (segurança) |
| `passwordResetToken`, `passwordResetExpiresAt` | Recuperação segura de senha | V — Execução de contrato |
| `disable2faCode` | Desativação segura do 2FA | IX — Legítimo interesse (segurança) |
| `role` | Controle de autorização (RBAC) | V — Execução de contrato |
| `consentGiven`, `consentGivenAt`, `consentVersion` | Prova da manifestação de vontade | II — Obrigação legal e prestação de contas (Art. 6º, X) |
| `company_id` | Isolamento de dados multi-tenant | V — Execução de contrato |

### 4.2.2 Finalidades dos Dados de `Company`

| Dado | Finalidade | Base Legal |
|---|---|---|
| `name` | Identificação da empresa contratante | V — Execução de contrato |
| `slug` | URLs amigáveis por tenant | V — Execução de contrato |
| `status` | Gestão do ciclo de vida contratual | V — Execução de contrato |
| `trialEndsAt` | Controle do período de avaliação | V — Execução de contrato |
| `createdAt` | Auditoria e métricas | IX — Legítimo interesse (gestão administrativa) |

---

## 4.3 Evidência de Minimização de Dados

A minimização foi instituída como princípio arquitetural (Art. 6º, III da LGPD).

### 4.3.1 Evidências no Código

1. **Coleta restrita no cadastro:** o `RegisterRequestDTO` exige apenas `email`, `fullName`, `document`, `password` e `role`.
2. **Ausência de campos invasivos no `User`:** a entidade não armazena telefone, endereço, data de nascimento ou dados sensíveis.
3. **Entidade `Company` enxuta:** apenas seis atributos, todos essenciais ao contrato.
4. **Hash unidirecional de credenciais:** `BCryptPasswordEncoder` configurado em `SecurityConfig.java` — a senha jamais é persistida em claro.
5. **Tokens com TTL curto:** `passwordResetToken` expira em 1h (`AuthService.forgotPassword`); JWTs são revogáveis via Redis (`TokenBlacklistService`).
6. **DTOs de resposta enxutos:** `ProfileDTO` retorna apenas `fullName`, `role`, `firstLogin`, `is2faEnabled` — omite credenciais.
7. **Logs sem dados sensíveis:** `AuthService` registra via SLF4J apenas e-mail e resultado, jamais senha ou segredo 2FA.
8. **Mascaramento de CPF/CNPJ:** método `LgpdService.maskDocument()` aplica mascaramento parcial nas respostas do endpoint de consulta.
9. **Isolamento por tenant:** queries do `UserRepository` são filtradas por `companyId` (vide `findByEmailAndCompanyId`).

---

## 4.4 Registro Explícito de Consentimento

Implementação em `AuthService.completeWelcome` + `ConsentService.recordInitialConsent`.

### 4.4.1 Campos Persistidos no `User`

```java
@Column(name = "consent_given", nullable = false)
private Boolean consentGiven = false;

@Column(name = "consent_given_at")
private LocalDateTime consentGivenAt;

@Column(name = "consent_version", length = 20)
private String consentVersion;
```

### 4.4.2 Fluxo de Coleta

1. No primeiro login, o frontend exibe a tela de boas-vindas com link para a Política de Privacidade.
2. O titular deve marcar uma caixa de seleção **obrigatória, não pré-marcada**.
3. O frontend envia `PATCH /auth/complete-welcome` com o body:
   ```json
   { "consentGiven": true, "consentVersion": "v1.0" }
   ```
4. O backend valida `consentGiven == true` e a versão antes de persistir.
5. Um registro `GRANT` é gravado na `consent_log` para cada finalidade obrigatória.

### 4.4.3 Evidência Técnica

Se o aceite não for fornecido, `AuthService.completeWelcome` lança `BusinessException` com a mensagem:
> *"Aceite dos termos da Política de Privacidade é obrigatório para concluir o cadastro."*

O `GlobalExceptionHandler` traduz para HTTP `409 Conflict`.

---

## 4.5 Consentimento Associado à Finalidade

A LGPD veda autorizações genéricas (Art. 8º, §4º). O Dumply implementa **consentimentos granulares** via enum `ConsentPurpose`.

### 4.5.1 Finalidades Implementadas

Definidas em `src/main/java/com/dumply/common/dto/ConsentPurpose.java`:

| Finalidade | Identificador | Obrigatória? |
|---|---|---|
| Autenticação e gestão da conta | `AUTHENTICATION` | ✅ Sim |
| E-mails transacionais (segurança) | `TRANSACTIONAL_EMAIL` | ✅ Sim |
| Notificações do plano contratado | `TRIAL_NOTIFICATION` | ✅ Sim |
| Comunicações de marketing | `MARKETING` | ❌ Opcional |

### 4.5.2 Endpoint de Concessão

```http
POST /lgpd/consent
Authorization: Bearer <JWT>
Content-Type: application/json

{ "purpose": "MARKETING", "version": "v1.0" }
```

A finalidade fica vinculada ao registro na coluna `purpose` da `consent_log`.

---

## 4.6 Possibilidade de Revogação do Consentimento

Implementação em `ConsentService.revokeConsent` + `LgpdController.revokeConsent`.

### 4.6.1 Endpoint

```http
DELETE /lgpd/consent?purpose=MARKETING
Authorization: Bearer <JWT>
```

### 4.6.2 Comportamento

- **Finalidades opcionais** (`MARKETING`): grava evento `REVOKE` na `consent_log`; conta permanece ativa.
- **Finalidades obrigatórias** (`AUTHENTICATION`, `TRANSACTIONAL_EMAIL`, `TRIAL_NOTIFICATION`): o método lança `BusinessException` orientando o titular a usar o fluxo de exclusão de conta (`DELETE /lgpd/me`).

### 4.6.3 Característica Append-Only

A revogação **não atualiza** o registro anterior. O método `ConsentService.persistEvent()` sempre executa `INSERT` via `consentLogRepository.save()`.

---

## 4.7 Registro de Data e Versão do Consentimento

Implementação em `src/main/java/com/dumply/model/ConsentLog.java` e `src/main/java/com/dumply/repository/ConsentLogRepository.java`.

### 4.7.1 Atributos Capturados

- **`timestamp`** — `LocalDateTime`, preenchido automaticamente via `@PrePersist`
- **`version`** — versão da Política de Privacidade aceita
- **`ipAddress`** — extraído de `X-Forwarded-For` (proxy reverso) ou `request.getRemoteAddr()`
- **`userAgent`** — header HTTP, truncado em 500 caracteres

### 4.7.2 Garantia de Imutabilidade

**Nível de aplicação:** `ConsentLogRepository` estende `Repository<>` (não `JpaRepository<>`), expondo **apenas**:
- `save(ConsentLog)` — sempre INSERT (ID gerado pelo JPA)
- `findByUserIdOrderByTimestampDesc(UUID)`
- `findByUserIdAndPurposeOrderByTimestampDesc(UUID, String)`

Não há métodos `delete*` ou `update*` expostos.

**Nível de entidade:** todos os atributos da `ConsentLog` (exceto `id` e `timestamp`) usam `@Column(updatable = false)`.

**Nível de banco (recomendação operacional):** revogar privilégios `UPDATE` e `DELETE` na tabela `consent_log` para o usuário de aplicação no SGBD de produção.

### 4.7.3 Versionamento da Política

A constante `ConsentService.CURRENT_POLICY_VERSION` controla a versão vigente. O método `requiresConsentRenewal(User)` retorna `true` se o titular precisa reaceitar (versão diferente da atual).

---

## 4.8 Funcionalidade de Consulta aos Dados do Titular

Implementação em `LgpdService.getMyData` + `LgpdController.getMyData`. Atende ao Art. 18, II da LGPD.

### 4.8.1 Endpoint

```http
GET /lgpd/me/data
Authorization: Bearer <JWT>
```

### 4.8.2 Estrutura da Resposta (`LgpdDataDTO`)

```json
{
  "id": "9c7d4a4e-1f3a-4c7e-8d92-7f3b93ab8120",
  "email": "usuario@exemplo.com",
  "fullName": "Maria da Silva",
  "document": "***.456.789-**",
  "role": "USER",
  "is2faEnabled": true,
  "firstLogin": false,
  "consentStatus": {
    "consentGiven": true,
    "consentGivenAt": "2026-05-01T14:30:00",
    "consentVersion": "v1.0",
    "activePurposes": ["AUTHENTICATION", "TRANSACTIONAL_EMAIL", "TRIAL_NOTIFICATION"],
    "revokedPurposes": ["MARKETING"]
  },
  "company": {
    "id": "...",
    "name": "Empresa Exemplo Ltda.",
    "slug": "empresa-exemplo",
    "status": "ACTIVE",
    "createdAt": "..."
  }
}
```

### 4.8.3 Controles de Privacidade

- `password`, `secret2fa`, `passwordResetToken` e `disable2faCode` **jamais** retornados.
- `document` mascarado via `LgpdService.maskDocument()`:
  - CPF (11 dígitos): `***.456.789-**`
  - CNPJ (14 dígitos): `**.345.678/****-**`
- Endpoint protegido por JWT (regra `anyRequest().authenticated()` em `SecurityConfig`).
- Cada consulta gera evento `DATA_ACCESSED` no `audit_log`.

---

## 4.9 Funcionalidade de Exportação dos Dados

Implementação em `LgpdService.exportMyData` + `LgpdController.exportMyData`. Atende ao Art. 18, V da LGPD.

### 4.9.1 Endpoint

```http
GET /lgpd/me/export
Authorization: Bearer <JWT>
```

### 4.9.2 Características Técnicas

- **Formato:** JSON estruturado (padrão aberto, interoperável)
- **Conteúdo:** dados do titular + contexto da empresa + histórico completo de `consent_log` + resumo de eventos de segurança
- **Cabeçalho HTTP:** `Content-Disposition: attachment; filename="dumply_dados_<userId>.json"`
- **Schema versionado:** `LgpdService.EXPORT_SCHEMA_VERSION = "1.0"`
- **Documento em texto pleno:** ao contrário da consulta, a exportação **não mascara** o `document` (pois trata-se de portabilidade dos próprios dados do titular)
- Cada exportação gera evento `DATA_EXPORTED` no `audit_log`

### 4.9.3 Estrutura Exportada (`LgpdExportDTO`)

```json
{
  "schemaVersion": "1.0",
  "exportedAt": "2026-05-12T10:00:00",
  "subject": {
    "id": "...",
    "email": "...",
    "fullName": "...",
    "document": "12345678900",
    "role": "USER",
    "is2faEnabled": true
  },
  "companyContext": { "...": "..." },
  "consentHistory": [
    {
      "id": "...",
      "action": "GRANT",
      "purpose": "AUTHENTICATION",
      "version": "v1.0",
      "ipAddress": "192.0.2.10",
      "userAgent": "Mozilla/5.0 ...",
      "timestamp": "2026-05-01T14:30:00"
    }
  ],
  "securityEvents": {
    "failedLoginAttempts": 0,
    "locktime": null,
    "accountNonLocked": true,
    "is2faEnabled": true
  }
}
```

---

## 4.10 Funcionalidade de Exclusão dos Dados Pessoais

Implementação em `LgpdService.deleteMyAccount`. Atende ao Art. 18, VI da LGPD.

### 4.10.1 Endpoint

```http
DELETE /lgpd/me
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "password": "<senha-atual>",
  "confirmation": "EXCLUIR"
}
```

### 4.10.2 Estratégia: Anonimização Estruturada

A exclusão **não remove fisicamente** o registro do `User`, pois isso comprometeria a integridade referencial multi-tenant (vínculo `company_id`, históricos contábeis). Em vez disso, aplica-se anonimização:

1. **Confirmação dupla:** senha atual + string literal `"EXCLUIR"` (validada em `AccountDeletionRequest.EXPECTED_CONFIRMATION`).
2. **Anonimização dos campos identificáveis:**
   - `email` → `anonimizado_<uuid>@deletado.local`
   - `fullName` → `"Usuário Anonimizado"`
   - `document` → `null`
3. **Limpeza de credenciais:** `password`, `secret2fa`, `passwordResetToken`, `passwordResetExpiresAt`, `disable2faCode` → `null`
4. **Bloqueio:** `2faEnabled = false`, `accountNonLocked = false`, `firstLogin = false`
5. **Revogação imediata do JWT corrente:** `TokenBlacklistService.blacklistToken()` é chamado com o tempo restante do token
6. **Auditoria:** evento `ACCOUNT_DELETED` gravado no `audit_log` com o **e-mail original** + `anonymized_id` nos `details`
7. **Preservação do histórico:** `consent_log` mantida por 5 anos (Art. 16, II da LGPD); vínculo `company_id` preservado

### 4.10.3 Característica Irreversível

Sem janela de carência (soft-delete). O método é `@Transactional` — ou todas as etapas são aplicadas, ou nenhuma é (atomicidade).

---

## 4.11 Fluxo de Atendimento aos Direitos do Titular

Atende ao Art. 18 da LGPD e ao prazo do Art. 19, §1º.

### 4.11.1 Canais de Atendimento

| Canal | Endereço | Prazo |
|---|---|---|
| Encarregado (DPO) | `dpo@dumply.local` | Até **15 dias úteis** (Art. 19, §1º) |
| Portal in-app | Menu *Configurações → Privacidade* | Imediato (autosserviço) |
| Suporte | `suporte@dumply.local` | Até 5 dias úteis |

### 4.11.2 Fluxograma do Atendimento

```
┌──────────────────────────────┐
│ Titular formula solicitação  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ É um direito atendível em        │
│ autosserviço? (consulta,         │
│ exportação, revogação, exclusão) │
└──────────┬───────────────┬───────┘
        Sim│              │Não
           ▼              ▼
┌──────────────────┐ ┌────────────────────────────┐
│ App processa via │ │ Solicitação encaminhada    │
│ endpoint /lgpd/* │ │ ao DPO (dpo@dumply.local)  │
└────────┬─────────┘ └──────────────┬─────────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐ ┌────────────────────────────┐
│ Resposta imediata│ │ DPO analisa em até         │
│ + registro em    │ │ 15 dias úteis              │
│ audit_log        │ │                            │
└──────────────────┘ └──────────────┬─────────────┘
                                    │
                                    ▼
                     ┌────────────────────────────┐
                     │ Resposta formal por e-mail │
                     │ + registro em planilha de  │
                     │ auditoria de solicitações  │
                     └────────────────────────────┘
```

### 4.11.3 Mapeamento Direito → Mecanismo

| Direito (Art. 18 LGPD) | Mecanismo de Exercício |
|---|---|
| I — Confirmação de tratamento | `GET /lgpd/me/data` |
| II — Acesso aos dados | `GET /lgpd/me/data` |
| III — Correção de dados | `PATCH /auth/me` (e-mail/nome) |
| IV — Anonimização / bloqueio | Solicitação ao DPO |
| V — Portabilidade | `GET /lgpd/me/export` |
| VI — Eliminação | `DELETE /lgpd/me` |
| VII — Informação sobre compartilhamento | Política de Privacidade (não há compartilhamento com terceiros) |
| VIII — Informação sobre não consentir | Política de Privacidade |
| IX — Revogação do consentimento | `DELETE /lgpd/consent?purpose=X` |

### 4.11.4 Registro Permanente das Solicitações

Todas as solicitações exercidas via API geram registro no `audit_log` com `eventType ∈ {DATA_ACCESSED, DATA_EXPORTED, ACCOUNT_DELETED, CONSENT_GRANTED, CONSENT_REVOKED}`. Solicitações manuais ao DPO são registradas em planilha de controle interno conforme descrito na Seção 4.11.2.

---

## 5. Justificativas Técnicas

| Decisão | Justificativa Técnica | Princípio LGPD |
|---|---|---|
| `consent_log` append-only | Garante prestação de contas e evidência probatória | Art. 6º, X |
| Anonimização em vez de hard-delete | Preserva integridade referencial multi-tenant | Art. 16, II |
| Mascaramento de `document` | Reduz exposição desnecessária | Art. 6º, III |
| BCrypt + 2FA TOTP | Protege credenciais em cenário de incidente | Art. 6º, VII |
| TLS/HTTPS obrigatório (vide `README_NETWORK.md`) | Confidencialidade em trânsito | Art. 46 |
| JWT revogável via Redis blacklist | Invalidação imediata de sessões | Art. 46 e 47 |
| Granularidade de consentimentos por `ConsentPurpose` | Evita autorizações genéricas | Art. 8º, §4º |
| Isolamento multi-tenant (`TenantContext` + filtros JPA) | Evita vazamento entre empresas | Art. 6º, VII |
| Preservação do `company_id` após anonimização | Integridade contábil-operacional | Art. 16, II |
| Auditoria assíncrona (`@Async` em `AuditLogService`) | Performance + nunca bloqueia o fluxo principal | Art. 46 |

---

## 6. Versionamento da Política

| Versão | Data | Alterações |
|---|---|---|
| v1.0 | 2026-05-12 | Versão inicial — dados, finalidades, bases legais, direitos e fluxos |

Alterações materiais exigem **novo aceite** (incremento de `ConsentService.CURRENT_POLICY_VERSION`). O método `requiresConsentRenewal()` determina se o titular precisa reaceitar no próximo login.

---