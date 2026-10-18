# 💬 TalkHub API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

> API RESTful robusta desenvolvida com NestJS para gerenciamento de usuários e sistema de mensagens, focada em arquitetura escalável, segurança e testes automatizados.

---

## 📄 Sobre o Projeto

O **TalkHub API** é o backend de uma plataforma de comunicação. Ele gerencia o ciclo de vida de usuários (cadastro, autenticação, upload de perfil) e permite a troca de mensagens entre eles.

O diferencial deste projeto é a aplicação prática dos conceitos avançados do **NestJS**, aliada a uma infraestrutura dockerizada e uma suíte completa de testes (Unitários e E2E), garantindo uma aplicação segura e confiável.

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Login com **JWT** (Access Token e Refresh Token).
- Hashing seguro de senhas com `bcrypt`.
- Proteção de rotas com Guards personalizados.
- Rate Limiting com `Throttler` contra ataques de força bruta.

### 👤 Gestão de Usuários
- CRUD completo com validação de dados via `DTOs`.
- Upload de imagem de perfil processado com `Multer`.

### 💬 Sistema de Mensagens
- Envio de mensagens persistidas no banco de dados.
- **Notificações por E-mail:** Integração com `Nodemailer`.

> **Nota:** Como este é um projeto de estudo, o envio de e-mails está configurado via **Mailtrap (Sandbox)**. Os e-mails não são enviados para caixas de entrada reais, ficando retidos no ambiente de teste para validação do fluxo.

### 📚 Documentação
- **Swagger (OpenAPI):** Documentação interativa dos endpoints.
- **VS Code REST Client:** Arquivo `client.rest` incluso no projeto, permitindo testar as requisições (Login, CRUD, Mensagens) diretamente no editor, sem necessidade de ferramentas externas como Postman ou Insomnia.
---

## 🛠️ Tecnologias e Arquitetura

A aplicação segue uma arquitetura modular baseada em Injeção de Dependência:

- **Core:** NestJS 11
- **Banco de Dados:** PostgreSQL com **TypeORM**
- **Infraestrutura:** Docker Compose para orquestração do banco
- **Testes:**
  - ✅ Testes Unitários (Services e Controllers)
  - ✅ Testes E2E (Integração completa de rotas + banco)

---

## 🚀 Como rodar o projeto

### 📌 Pré-requisitos

- Node.js
- Docker
- Docker Compose

---

### 📥 Instalação

```bash
# Clone o repositório
git clone https://github.com/GUSTAV0-CRUZ/talkHub-api.git

# Acesse a pasta do projeto
cd talkHub-api

# Instale as dependências
npm install

# Suba o banco de dados via Docker
docker-compose up -d

# Execute a aplicação
npm run start:dev
```

📍 Acesse a documentação Swagger em:  
http://localhost:3000/api

---

## 🧪 Rodando os Testes

Para garantir a confiabilidade do código, execute:

```bash
# Testes Unitários
npm run test

# Testes E2E (Ponta a Ponta)
npm run test:e2e
```

---

## 📚 Agradecimentos e Créditos

Este projeto foi desenvolvido com base nos ensinamentos do curso de NestJS ministrado pelo professor **Luiz Otávio Miranda**.

---

## 👨‍💻 Autor

<img src="https://github.com/GUSTAV0-CRUZ.png" width="100px;" alt="Gustavo Cruz"/>

**Gustavo Cruz**  
📧 gustavo.cruzs.dev@gmail.com

🔗 https://github.com/GUSTAV0-CRUZ

🔗 https://www.linkedin.com/in/gustavo-cruz-4a467b377

---
