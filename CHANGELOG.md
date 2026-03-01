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