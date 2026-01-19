# Changelog DUMPLY.

## [1.6] - 19-01-2026

### Segurança & Autenticação
- Implementada autenticação com JWT
- Persistência de sessão com refresh do usuário
- Correções no fluxo de login/logout para evitar inconsistências de perfil

### Back-end
- Criação da entidade `User`, repositório e fluxo de registro
- Adição de novos DTOs para garantir conformidade e segurança dos dados

### Dashboard & Gestão
- Modificações no dashboard inicial
- Adição de cards de acesso rápido (Faturas, Aluguéis, Equipamentos e Clientes)
- Melhorias gerais na UI do dashboard

### Aluguéis & Equipamentos
- Correção de regras para evitar cobrança duplicada de equipamentos
- Adicionada ação “Ver no Mapa” na listagem de aluguéis

### Localização em Mapa
- Ajustes no comportamento do mapa
- Remoção de pontos de interesse padrão para melhor visualização

### Front-end
- Início do processo de responsividade
- Correções de warnings e erros relacionados a hooks no React
- Atualização de ícones
- Layout agora exibe o usuário logado e sua role (em fase de teste)

### Infraestrutura
- Testes e otimizações de deploy na Oracle Cloud
- Aprendizados sobre limites de recursos e escalabilidade
- Preparação do ambiente para evolução futura como SaaS