# 🛡️ Dumply - Gestão Segura de Ativos

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.1-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
![Oracle](https://img.shields.io/badge/Oracle-Database-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-Structured_Query-blue?style=for-the-badge&logo=postgresql)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

O **Dumply** é uma solução robusta para gestão de equipamentos e locações, desenvolvida com um foco rigoroso em **segurança da informação** e conformidade com a **LGPD** (Lei Geral de Proteção de Dados). O projeto integra autenticação multifator (2FA), criptografia de dados sensíveis e uma arquitetura escalável.

---

## 🚀 Funcionalidades Principais

- **Autenticação Avançada:** Login seguro com hash Argon2/BCrypt e Autenticação de Dois Fatores (2FA) via Google Authenticator.
- **Gestão de Ativos:** Controle total de equipamentos, locações e clientes.
- **Conformidade LGPD:** Ferramentas integradas para exportação, consulta e exclusão de dados pessoais, além de gestão de consentimento.
- **Segurança em Camadas:** Proteção contra força bruta, expiração de sessões e comunicação criptografada (TLS).
- **Multi-tenant:** Arquitetura preparada para isolamento de dados entre diferentes empresas/entidades.

---

## 📂 Estrutura do Projeto

Abaixo está a organização das pastas e os principais componentes do ecossistema Dumply:

```text
.
├── frontend/             # Aplicação cliente em React.js
│   ├── src/api/          # Configuração de serviços e chamadas HTTP
│   ├── src/components/   # Componentes de UI reutilizáveis
│   ├── src/context/      # Estados globais (Ex: AuthContext)
│   ├── src/pages/        # Telas da aplicação (Login, Dashboard, etc)
│   └── Dockerfile        # Configuração de container para o frontend
├── src/                  # Código fonte do backend (Java/Spring Boot)
│   ├── main/java/com/dumply/
│   │   ├── config/       # Configurações de Segurança, CORS e Multi-tenancy
│   │   ├── controller/   # Controllers REST (Endpoints da API)
│   │   ├── model/        # Entidades de banco de dados (JPA)
│   │   ├── repository/   # Camada de persistência (Spring Data JPA)
│   │   └── service/      # Regras de negócio e integração
│   └── main/resources/   # Propriedades e configurações externas
├── docker-compose.yml    # Orquestração para rodar o ecossistema completo
├── Dockerfile            # Dockerfile para build da imagem do backend
├── REQUIREMENTS.md       # Documentação detalhada de requisitos e LGPD
└── CLASS_DIAGRAM.md      # Modelagem técnica do sistema
```

### 🌍 Acesso Remoto
Para instruções de como acessar a aplicação em outros dispositivos na mesma rede local, consulte o guia [Acesso em Rede Local](README_NETWORK.md).

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17** & **Spring Boot 3.4.1**
- **Spring Security** com **JWT** e **OAuth2 (2FA)**
- **Spring Data JPA** (PostgreSQL / Oracle / H2)
- **Redis** para cache e blacklist de tokens
- **Lombok** para redução de boilerplate
- **Maven** para gestão de dependências

### Frontend
- **React** (Vite)
- **Tailwind CSS** para estilização
- **Axios** para integração com API
- **Lucide React** para iconografia

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- JDK 17
- Node.js 18+
- Docker & Docker Compose (Opcional, mas recomendado)
- PostgreSQL ou Oracle Database

### 1. Configurando o Backend
No diretório raiz:
```bash
# Instalar dependências e buildar o projeto
./mvnw clean install

# Rodar a aplicação
./mvnw spring-boot:run
```
> **Nota:** Certifique-se de configurar as variáveis de ambiente no `application.properties` ou via variáveis de sistema.

### 2. Configurando o Frontend
No diretório `frontend`:
```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse em: `http://localhost:5173`

---

## 🐳 Executando com Docker

As imagens oficiais estão disponíveis no Docker Hub:
- Backend: `jjsalustiano/backend-java`
- Frontend: `jjsalustiano/frontend-react`

Para rodar todo o ambiente (Frontend + Backend + Banco) com um único comando:

```bash
docker-compose up -d
```

As imagens serão baixadas ou buildadas conforme o `docker-compose.yml`. 

### ⚙️ Variáveis de Ambiente Necessárias

| Variável | Descrição |
|----------|-----------|
| `DB_USER` | Usuário do banco de dados |
| `DB_PASSWORD` | Senha do banco de dados |
| `APP_PASSWORD` | Senha de aplicação (Ex: para envio de e-mails) |
| `JWT_API_SECRET` | Chave secreta para assinatura dos tokens JWT |

Certifique-se de definir estas variáveis no seu ambiente ou em um arquivo `.env` na raiz.

---

## ☁️ Deploy e Cloud

A aplicação está configurada para ser deployada em ambientes cloud através de containers. 

### Considerações para Cloud:
- **Banco de Dados:** Compatível com **Oracle Autonomous Database** (via Oracle Wallet).
- **Variavéis de Ambiente:** Devem ser configuradas no seu provedor (OCI, AWS, Azure).
- **HTTPS/TLS:** Recomendado o uso de um Ingress Controller ou Load Balancer para gerenciar os certificados.

Para deploy na **Oracle Cloud (OCI)**, utilize o volume configurado para a Wallet:
```yaml
volumes:
  - /home/opc/app/wallet:/app/wallet
```

---

## 🛡️ Segurança e LGPD

O Dumply segue as melhores práticas de segurança:
1.  **Minimização de Dados:** Coletamos apenas o estritamente necessário.
2.  **Criptografia:** Dados sensíveis são criptografados em repouso (AES) e em trânsito (TLS).
3.  **Direitos do Titular:** Implementado fluxo para consulta, exclusão e portabilidade de dados.
4.  **Auditoria:** Logs detalhados de tentativas de login e acesso a dados sensíveis.

Consulte o arquivo `REQUIREMENTS.md` para a lista completa de conformidade.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---
Desenvolvido por **Joca0** - 2025
