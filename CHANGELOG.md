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