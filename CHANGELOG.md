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