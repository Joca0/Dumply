Caminho: src/main/java/com/dumply/model/User.java

  // ============================================================
 //  LGPD — Registro de Consentimento (Req. 4.4, 4.5 e 4.7)
// ============================================================

O que mudou:

✅ 3 novos atributos adicionados: consentGiven, consentGivenAt, consentVersion
✅ Mantidos @Getter @Setter @AllArgsConstructor @NoArgsConstructor (Lombok já em uso no projeto)
✅ consentGiven é Boolean (objeto, não primitivo) — permite distinguir "não respondido" de false se necessário no futuro, mas inicia com false para compatibilidade
✅ Bloco delimitado por comentário para facilitar localização e revisão


Caminho: src/main/java/com/dumply/model/ConsentLog.java

Entidade de auditoria imutável (append-only) que registra cada manifestação de consentimento — atende ao princípio da prestação de contas (Art. 6º, X da LGPD).

Pontos de destaque:

✅ Padrão Lombok idêntico ao usado nas demais entidades (@Getter @Setter @NoArgsConstructor @AllArgsConstructor)
✅ Todos os campos relevantes marcados como updatable = false — reforço da imutabilidade no nível de mapeamento JPA
✅ @PrePersist preenche automaticamente o timestamp se não fornecido
✅ Índices em user_id e timestamp para consultas eficientes em auditoria
✅ Construtor extra de conveniência (5 parâmetros, sem id e timestamp) para facilitar o uso no service
✅ userId como UUID solto (não @ManyToOne) — preserva histórico mesmo após anonimização do User


Caminho: src/main/java/com/dumply/repository/ConsentLogRepository.java

Novo arquivo. Usa Repository<> em vez de JpaRepository<> para bloquear update/delete no nível da API — garantindo o caráter append-only exigido pelo Req. 4.7.

Pontos de destaque:

✅ Estende Repository<ConsentLog, UUID> puro — sem delete, sem update, sem findAll
✅ Apenas 3 métodos expostos: save, busca por usuário, busca por usuário+finalidade
✅ Javadoc explicando o porquê dessa restrição


Caminho: src/main/java/com/dumply/model/AuditLog.java

Novo arquivo. Entidade para logs estruturados de eventos de segurança — atende aos Reqs. 5.1, 5.2 e 5.3.

Pontos de destaque:

✅ Todos os campos updatable = false — reforço de imutabilidade
✅ Suporta userId = null (eventos de tentativas com e-mail inexistente)
✅ Inclui companyId para filtragens contextuais multi-tenant
✅ Campo outcome separado (SUCCESS/FAILURE) facilita queries de análise
✅ details como TEXT para metadados livres em JSON
✅ Índices nos campos mais consultados (user, type, timestamp, ip)
✅ Dois construtores de conveniência para diferentes níveis de detalhe

Caminho: src/main/java/com/dumply/repository/AuditLogRepository.java

Novo arquivo. Mesmo princípio do ConsentLogRepository — usa Repository<> para impedir update/delete.


Pontos de destaque:

✅ Estende Repository<> puro — sem expor delete*
✅ Métodos Page<> paginados para evitar OOM em consultas grandes
✅ Métodos pré-prontos para os 3 cenários típicos de análise (Req. 5.4): logs por usuário, falhas de login num intervalo, ataques distribuídos por IP
✅ Método de contagem (countByEmailAndEventTypeAndTimestampAfter) útil para alertas em tempo real


***********************PASSO 2 *****************

Caminho: src/main/java/com/dumply/common/dto/ConsentPurpose.java

Enum centralizando as finalidades de consentimento. Atende ao Req. 4.5 (consentimento associado à finalidade).


Caminho: src/main/java/com/dumply/common/dto/ConsentRequest.java

DTO de entrada para o endpoint de concessão de consentimento (a ser exposto no Passo 3).

Caminho: src/main/java/com/dumply/common/dto/CompleteWelcomeRequest.java

DTO de entrada para o fluxo de primeiro login (Req. 4.4) — exige aceite explícito antes de concluir o onboarding.


Caminho: src/main/java/com/dumply/common/dto/ConsentStatusDTO.java

DTO de resposta resumindo o estado atual dos consentimentos do titular.

Caminho: src/main/java/com/dumply/service/ConsentService.java

Service central de gestão de consentimentos. Atende aos Reqs. 4.4, 4.5, 4.6 e 4.7.

Caminho: src/main/java/com/dumply/service/AuthService.java

Substitui o arquivo existente. Mudanças localizadas no construtor (recebe ConsentService) e no método completeWelcome(). Os demais métodos permanecem idênticos ao original.



O frontend deverá agora enviar um body como:

{ "consentGiven": true, "consentVersion": "v1.0" }


✅ Resumo do que foi entregue no Passo 2
Arquivo	Status	Propósito
common/dto/ConsentPurpose.java	🆕 Novo	Enum de finalidades (Req. 4.5)
common/dto/ConsentRequest.java	🆕 Novo	DTO de concessão de finalidade específica
common/dto/CompleteWelcomeRequest.java	🆕 Novo	DTO de aceite no primeiro login (Req. 4.4)
common/dto/ConsentStatusDTO.java	🆕 Novo	DTO de resposta com estado atual
service/ConsentService.java	🆕 Novo	Service central de consentimento (Reqs. 4.4 a 4.7)
service/AuthService.java	✏️ Atualizado	Construtor + completeWelcome com aceite obrigatório
controller/AuthController.java	✏️ Snippet	Apenas o método completeWelcome precisa ser ajustado


Passo 3 — Controller e Service LGPD

Caminho: src/main/java/com/dumply/common/dto/LgpdDataDTO.java

TO retornado por GET /lgpd/me/data — atende ao Req. 4.8 (consulta aos dados do titular).


Caminho: src/main/java/com/dumply/common/dto/LgpdExportDTO.java

DTO retornado por GET /lgpd/me/export — atende ao Req. 4.9 (portabilidade de dados, Art. 18, V da LGPD).


Caminho: src/main/java/com/dumply/common/dto/AccountDeletionRequest.java

DTO recebido por DELETE /lgpd/me — exige confirmação dupla (senha atual + string literal).

Caminho: src/main/java/com/dumply/service/LgpdService.java

Service que orquestra os direitos do titular: consulta, exportação e exclusão.

Caminho: src/main/java/com/dumply/controller/LgpdController.java

Expõe os 5 endpoints /lgpd/* cobrindo Reqs. 4.5, 4.6, 4.8, 4.9 e 4.10.

✅ Resumo do que foi entregue no Passo 3
Arquivo	Status	Propósito
common/dto/LgpdDataDTO.java	🆕 Novo	Resposta de GET /lgpd/me/data (com CPF mascarado)
common/dto/LgpdExportDTO.java	🆕 Novo	Resposta de GET /lgpd/me/export (JSON estruturado)
common/dto/AccountDeletionRequest.java	🆕 Novo	Body de DELETE /lgpd/me (com confirmação dupla)
service/LgpdService.java	🆕 Novo	Lógica de consulta, exportação e anonimização
controller/LgpdController.java	🆕 Novo	Os 5 endpoints REST
service/AuthService.java	✅ Sem mudança	getAuthenticatedUser() já público
config/security/TokenService.java	✅ Sem mudança	validateToken() já público
🎯 O que esses arquivos juntos atendem
✅ Req. 4.5 — POST /lgpd/consent concede consentimento granular por finalidade
✅ Req. 4.6 — DELETE /lgpd/consent?purpose=X revoga consentimento opcional; bloqueia revogação de finalidade obrigatória
✅ Req. 4.8 — GET /lgpd/me/data retorna dados completos com CPF mascarado (suporta CPF e CNPJ)
✅ Req. 4.9 — GET /lgpd/me/export gera download de JSON estruturado com schema versionado
✅ Req. 4.10 — DELETE /lgpd/me faz anonimização estruturada com confirmação dupla e revoga JWT



Passo 4 — Auditoria e Logs (Etapa 5 dos requisitos):

Caminho: src/main/java/com/dumply/common/dto/AuditEventType.java

Enum centralizando todos os tipos de eventos auditáveis. Mantém consistência e evita "magic strings" espalhadas pelo código.

Caminho: src/main/java/com/dumply/common/dto/AuditLogResponse.java

DTO de resposta retornado pelo endpoint administrativo de listagem.

Caminho: src/main/java/com/dumply/repository/AuditLogRepository.java

Substitui o arquivo criado no Passo 1. Adiciona suporte a Specification para filtros dinâmicos no endpoint admin, mantendo o caráter append-only.

Caminho: src/main/java/com/dumply/service/AuditLogService.java

🆕 Service central de gravação de eventos. Sempre assíncrono para nunca atrasar a resposta HTTP do fluxo principal.


Caminho: src/main/java/com/dumply/DumplyApplication.java

⚠️ Substitui o arquivo existente. Adiciona apenas a anotação @EnableAsync para que o @Async do AuditLogService funcione.

Caminho: src/main/java/com/dumply/service/AuthService.java

⚠️ Substitui o arquivo do Passo 2. As mudanças são:

Recebe AuditLogService no construtor
Recebe HttpServletRequest nos métodos que registram auditoria
Adiciona chamadas a auditLogService.record* nos pontos críticos

Caminho: src/main/java/com/dumply/controller/AuthController.java

⚠️ Substitui o arquivo atualizado no Passo 2. Adiciona HttpServletRequest em todos os endpoints que agora auditam.


8a LgpdService.java — adicionar auditoria
⚠️ Substitui o arquivo do Passo 3. Adiciona AuditLogService no construtor e chamadas nos 3 métodos principais.

8b LgpdController.java — passar HttpServletRequest aos métodos auditados
⚠️ Substitui o arquivo do Passo 3. Apenas adiciona HttpServletRequest httpRequest aos métodos getMyData, exportMyData e deleteMyAccount.

Caminho: src/main/java/com/dumply/controller/AuditController.java

🆕 Endpoint administrativo GET /admin/audit/logs com filtros dinâmicos. Protegido por @PreAuthorize("hasAnyRole('ADMIN','OWNER')") no padrão do projeto.


✅ Resumo do Passo 4
Arquivo	Status	Propósito
common/dto/AuditEventType.java	🆕 Novo	Enum de eventos auditáveis
common/dto/AuditLogResponse.java	🆕 Novo	DTO de resposta do endpoint admin
repository/AuditLogRepository.java	✏️ Atualizado	Adicionado findAll(Specification, Pageable)
service/AuditLogService.java	🆕 Novo	Service central de auditoria (assíncrono)
DumplyApplication.java	✏️ Atualizado	@EnableAsync
service/AuthService.java	✏️ Atualizado	Integração de auditoria em todos os fluxos
controller/AuthController.java	✏️ Atualizado	Recebe e propaga HttpServletRequest
service/LgpdService.java	✏️ Atualizado	Auditoria nos 3 fluxos LGPD
controller/LgpdController.java	✏️ Atualizado	Propaga HttpServletRequest
controller/AuditController.java	🆕 Novo	Endpoint admin de análise

