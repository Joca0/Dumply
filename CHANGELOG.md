## [2.1] - 11-04-2026

### Segurança & Autenticação (2FA)
- **Autenticação de Dois Fatores (TOTP)**: Implementação completa de 2FA utilizando o padrão TOTP (Time-based One-time Password), compatível com Google Authenticator, Authy e outros.
- **Configuração via QR Code**: Novo fluxo intuitivo para ativação do 2FA com geração dinâmica de QR Code para facilitar o escaneamento no aplicativo móvel.
- **Login em Duas Etapas**: Processo de autenticação reforçado que exige a verificação do código temporário caso o 2FA esteja habilitado, mitigando riscos de acesso não autorizado por roubo de senha.
- **Desativação via E-mail**: Implementado fluxo de desativação segura do 2FA, validado por código de verificação enviado ao e-mail cadastrado do usuário.

### Comunicação & Infraestrutura
- **Serviço de E-mail Integrado**: Introdução do `EmailService` e integração com `spring-boot-starter-mail` para disparo de e-mails transacionais de segurança e alertas do sistema.
- **Gerenciamento do Ciclo de Vida do 2FA**: Adição de novos endpoints na API (`/auth/2fa/**`) para configuração, confirmação e desativação da proteção.
- **Atualização de Dependências**: Inclusão das bibliotecas `googleauth` e `spring-boot-starter-mail` no `pom.xml` para suporte às novas funcionalidades.

### Front-end (UI/UX)
- **Interface de Verificação 2FA**: Nova tela de desafio de código integrada ao fluxo de login, garantindo uma experiência fluida mesmo com a segurança adicional.
- **Configurações de Segurança no Perfil**: Atualização da interface de usuário para permitir a ativação, monitoramento e desativação do 2FA diretamente no perfil.
- **Integração Robusta de API**: Ajustes no serviço de chamadas da API (`frontend/src/api/index.js`) para suportar o fluxo de autenticação em múltiplas etapas.

## [2.0.x] - 25-03-2026

### Patches & Hotfixes
- **Correção em Aluguéis**: Ajustes na lógica de `RentalService` para garantir a integridade dos dados durante a transição de status de locação.
- **Melhorias em ScheduledList**: Refinamento na listagem de aluguéis agendados no frontend, incluindo melhor visualização e filtros.
- **Ajustes de API**: Correção em rotas de listagem e tratamento de usuários no `UserRepository`.

## [2.0] - 24-03-2026

### Gestão de Usuários & Controle de Acesso
- **CRUD de Usuários**: Implementação completa de gerenciamento para Motoristas (`DRIVER`) e Gerentes (`MANAGER`).
- **Níveis de Permissão (RBAC)**: Introdução de segurança baseada em funções (`@PreAuthorize`) em todos os endpoints críticos, restringindo ações conforme o papel do usuário (ADMIN, OWNER, MANAGER, DRIVER).
- **Atribuição de Motorista**: Agora é possível atribuir um motorista específico a cada aluguel durante a criação ou edição.
- **Listagem por Papel**: Novos endpoints e interfaces para visualizar listas filtradas de motoristas e gerentes da empresa.

### Gestão de Aluguéis (Melhorias)
- **Meus Aluguéis (Motorista)**: Nova funcionalidade e endpoint `/rentals/assigned` para que motoristas visualizem apenas as locações sob sua responsabilidade.
- **Refinamento de Status**: Melhorias na lógica de transição entre estados (Agendado, Ativo, Finalizado) com validações robustas de regras de negócio.
- **Edição Flexível**: Suporte a alteração de cliente, motorista e equipamento em aluguéis existentes, com liberação automática de equipamentos substituídos.

### Segurança & Multi-tenancy
- **Filtro por Tenant (Inquilino)**: Refinamento na busca de usuários autenticados para garantir que dados sejam restritos estritamente ao contexto da empresa (`company_id`).
- **Constraints de Unicidade**: Adicionada restrição de unicidade composta (Empresa, Documento, E-mail) para evitar conflitos de dados entre diferentes empresas.
- **Tratamento de Erros 401**: Melhoria na interceptação de respostas não autorizadas no front-end para redirecionamento e feedback imediato ao usuário.

### Front-end (UI/UX)
- **Novas Páginas**: Implementadas as telas `UserForm`, `DriverList`, `ManagerList` e `AssignedList`.
- **Autocomplete de Motoristas**: Campo de busca inteligente integrado ao formulário de aluguel para seleção rápida de motoristas.
- **Landing Page**: Adicionada página inicial institucional (`LandingPage`) como porta de entrada do sistema.

## [1.9] - 05-03-2026

### Cadastro & Onboarding
- **Novo Fluxo de Registro**: Introduzida a página `RegisterForm` para cadastro completo de novas empresas no sistema.
- **Passo a Passo de Boas-vindas**: Adicionada a tela `WelcomeStep` para guiar o usuário em seu primeiro acesso.
- **Mark First Login**: Implementado endpoint `PATCH /auth/complete-welcome` para gerenciar o estado inicial do perfil do usuário.

### Dashboard & Métricas
- **Contagem de Agendamentos**: O Dashboard agora exibe o total de aluguéis com status `SCHEDULED` (Agendados), proporcionando melhor visibilidade de demandas futuras.

### Segurança & Infraestrutura
- **CORS Policy**: Adicionado suporte ao método `PATCH` nas configurações de segurança global.
- **Tratamento de Exceções**: Nova exceção `EmailAlreadyExistsException` com captura no `GlobalExceptionHandler` para evitar duplicidade de cadastros.
- **Validação Global de E-mail**: Refinamento no `AuthService` para verificar a existência de e-mails em todo o ecossistema da aplicação durante o registro.

### Front-end (UX/UI & API)
- **Integração de API**: Adicionados novos serviços de registro de empresa e finalização de boas-vindas.
- **Melhorias na Login Screen**: Inclusão de link para solicitação de acesso Beta e rodapé institucional com copyright.

## [1.8] - 28-02-2026

### Gestão de Documentos & Exportação
- **Exportação em PDF**: Implementado hook `usePDFDownload` para geração de PDFs a partir de elementos HTML (Faturas/Recibos) utilizando `html2canvas-pro` e `jsPDF`.
- **Máscaras de Entrada**: Novos hooks `useDocumentMask` e `usePhoneMask` para padronização e facilitação do preenchimento de documentos (CPF/CNPJ) e telefones.

### Front-end (UX/UI & Feedback)
- **Alertas Animados**: Introdução de `CustomAlert` e `MainAlert` utilizando `framer-motion` para feedbacks visuais mais fluidos e modernos.
- **Página 404**: Adicionada página de erro customizada para rotas não encontradas.
- **Melhorias de Estilo**: Ajustes globais de layout e aplicação de novas dependências visuais.

### Back-end (Estabilidade & Padronização)
- **Tratamento Global de Exceções**: Expansão do `GlobalExceptionHandler` para captura e resposta padronizada de erros (404 Not Found, 400 Bad Request, 401 Unauthorized, 403 Forbidden e 500 Internal Error).
- **Refatoração de Enums**: Reorganização de tipos enumerados para melhor manutenção do código.
- **Validação de Dados**: Melhoria nas respostas de erros de validação de formulários da API.

## [1.7] - 09-02-2026

### Gestão de Aluguéis & Agendamentos
- **Sistema de Agendamento**: Implementada a possibilidade de criar aluguéis sem equipamento atribuído inicialmente (status `SCHEDULED`).
- **Nova Tela de Agendamentos**: Adicionada página exclusiva para gerenciar locações agendadas.
- **Ativação de Aluguel**: Fluxo para atribuir um equipamento e ativar um agendamento pendente.
- **Melhorias no Formulário**: O formulário de aluguel agora suporta a criação simplificada e dinâmica de itens.

### Dashboards & Estatísticas
- **Métricas de Faturamento**: Novo endpoint e interface para visualização de estatísticas financeiras (Total, Pendente, Pago).
- **Cards Dinâmicos**: O Dashboard principal agora exibe contagens reais de aluguéis ativos e faturas pendentes.

### Back-end (Core)
- **Filtros Avançados**: Implementada busca dinâmica e filtros por período (mês/ano) em Aluguéis e Faturas utilizando `JpaSpecification`.
- **Paginação Robusta**: Integração completa de paginação em todos os endpoints de listagem.
- **Novos DTOs**: Estruturação de dados para Autocomplete, Estatísticas e Requisições de Aluguel.

### Front-end (UX/UI)
- **Barra Lateral**: Menu lateral atualizado com novas opções e exibição do perfil do usuário logado.
- **Filtros em Tempo Real**: Adicionados campos de busca e seleção de mês nas listagens de Clientes, Equipamentos, Aluguéis e Faturas.
- **Reformulação Completa no Visual**: Remodelação total nas páginas, um visual moderno com a usabilidade consequentemente mais fácil.
- **Feedback Visual**: Melhorias nas tabelas com badges de status coloridos e formatação de datas/moedas.

### Segurança
- **Filtro de Autenticação**: Refinamento no `SecurityFilter` para melhor tratamento de erros de autorização no contexto da API.