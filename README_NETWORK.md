# Acesso em Outros Dispositivos (Rede Local)

Este guia explica como configurar e acessar a aplicação Dumply a partir de outros dispositivos (celulares, tablets ou outros computadores) que estejam conectados na mesma rede Wi-Fi que o seu notebook.

## Configurações Atuais

A aplicação já foi configurada para operar com o IP local: **192.168.1.140**

### Portas Utilizadas
- **Frontend (Vite):** 5173
- **Backend (Spring Boot):** 8080

---

## Passo a Passo para Acesso

### 1. Conexão de Rede
Certifique-se de que o seu notebook (host) e o dispositivo que deseja usar para acessar a aplicação estão conectados na **mesma rede Wi-Fi**.

### 2. Iniciar a Aplicação
No seu notebook, inicie os servidores:

#### Backend (Spring Boot)
Execute o projeto Spring Boot normalmente pela sua IDE ou via terminal:
```bash
./mvnw spring-boot:run
```

#### Frontend (Vite)
No diretório `frontend`, execute:
```bash
npm run dev
```
*O comando já está configurado com a flag `--host`, permitindo conexões externas.*

### 3. Acessar via Navegador
No dispositivo externo, abra o navegador e digite o seguinte endereço:

**URL do Frontend:**
`http://192.168.1.140:5173`

---

## Observações Importantes

### Firewall
Se você não conseguir acessar a URL acima, é provável que o **Firewall** do seu notebook esteja bloqueando as conexões.
- Certifique-se de que as portas **5173** e **8080** estão autorizadas para conexões de entrada.
- Como teste rápido, você pode tentar desativar o firewall temporariamente (não recomendado para uso prolongado).

### Mudança de IP
Se você trocar de rede Wi-Fi, o seu IP local provavelmente mudará. Caso isso ocorra, será necessário atualizar o IP nos seguintes arquivos do projeto:

1.  **`frontend/src/api/index.js`**: Alterar a `baseURL`.
2.  **`src/main/java/com/dumply/DumplyApplication.java`**: Atualizar o `allowedOrigins` na configuração de CORS.

Para descobrir seu novo IP, use `ipconfig` (Windows) ou `ifconfig` (macOS/Linux) no terminal.
