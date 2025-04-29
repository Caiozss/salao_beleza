# Documentação do Aplicativo de Gerenciamento para Salão de Beleza

## Visão Geral

Este aplicativo foi desenvolvido para gerenciar um salão de beleza e estética, oferecendo funcionalidades para agendamento de serviços, gerenciamento de clientes, profissionais, estoque e lembretes. O sistema possui uma versão web e mobile, permitindo acesso tanto para administradores quanto para clientes.

## Arquitetura do Sistema

O sistema foi desenvolvido utilizando a seguinte arquitetura:

- **Frontend Web**: React com TypeScript e Material UI
- **Frontend Mobile**: React Native/Expo com TypeScript
- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB (NoSQL)
- **Autenticação**: JWT (JSON Web Tokens)
- **Notificações**: Sistema de emails com Nodemailer

A arquitetura segue o padrão MVC (Model-View-Controller) e utiliza APIs RESTful para comunicação entre frontend e backend.

## Funcionalidades Principais

### 1. Gerenciamento de Clientes
- Cadastro e atualização de clientes
- Histórico de atendimentos
- Análise de clientes inativos
- Sistema de notificações para reativação de clientes

### 2. Agendamento de Serviços
- Verificação de disponibilidade em tempo real
- Confirmação automática por email
- Lembretes de agendamentos
- Visualização de agendamentos por cliente e profissional

### 3. Gerenciamento de Profissionais
- Cadastro de profissionais e suas especialidades
- Definição de horários de trabalho
- Análise de desempenho
- Associação com serviços específicos

### 4. Controle de Estoque
- Cadastro de produtos
- Controle de entrada e saída
- Alertas de estoque baixo
- Histórico de movimentação

### 5. Sistema de Lembretes
- Lembretes de limpeza e manutenção
- Notificações automáticas
- Controle de periodicidade
- Histórico de execuções

### 6. Análises e Relatórios
- Serviços mais procurados
- Desempenho de profissionais
- Análise de clientes inativos
- Uso de produtos

## Requisitos do Sistema

### Requisitos de Hardware
- Servidor: 2GB RAM, 1 CPU, 20GB de armazenamento
- Cliente: Qualquer dispositivo com navegador web moderno ou smartphone Android/iOS

### Requisitos de Software
- Servidor: Node.js 14+, MongoDB 4.4+
- Cliente Web: Navegador moderno (Chrome, Firefox, Safari, Edge)
- Cliente Mobile: Android 8+ ou iOS 12+

## Instalação e Configuração

### Backend

1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd salao_beleza/backend
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor
```bash
npm start
```

### Frontend Web

1. Navegue até a pasta do frontend web
```bash
cd salao_beleza/frontend/web/salao-web
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor de desenvolvimento
```bash
npm start
```

### Frontend Mobile

1. Navegue até a pasta do frontend mobile
```bash
cd salao_beleza/frontend/mobile/SalaoMobile
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor de desenvolvimento
```bash
npm start
```

## Estrutura do Banco de Dados

O sistema utiliza MongoDB como banco de dados, com os seguintes modelos principais:

### Cliente
- Informações pessoais (nome, telefone, email)
- Endereço
- Preferências
- Histórico de visitas
- Última visita (para análise de inatividade)

### Profissional
- Informações pessoais
- Especialidades
- Horários de trabalho
- Histórico de atendimentos

### Serviço
- Nome e descrição
- Duração
- Preço
- Categoria
- Profissionais habilitados

### Agendamento
- Cliente
- Profissional
- Serviço
- Data e hora
- Status (agendado, confirmado, concluído, cancelado)
- Notificações enviadas

### Produto
- Nome e descrição
- Categoria
- Quantidade em estoque
- Nível mínimo de estoque
- Histórico de movimentação

### Lembrete
- Tipo (limpeza, manutenção)
- Título e descrição
- Frequência
- Data da próxima execução
- Histórico de execuções

## APIs Disponíveis

O sistema oferece as seguintes APIs RESTful:

### Clientes
- `GET /api/v1/clientes` - Listar todos os clientes
- `GET /api/v1/clientes/:id` - Obter cliente específico
- `POST /api/v1/clientes` - Criar novo cliente
- `PUT /api/v1/clientes/:id` - Atualizar cliente
- `DELETE /api/v1/clientes/:id` - Desativar cliente
- `PUT /api/v1/clientes/:id/ultima-visita` - Atualizar última visita

### Profissionais
- `GET /api/v1/profissionais` - Listar todos os profissionais
- `GET /api/v1/profissionais/:id` - Obter profissional específico
- `POST /api/v1/profissionais` - Criar novo profissional
- `PUT /api/v1/profissionais/:id` - Atualizar profissional
- `DELETE /api/v1/profissionais/:id` - Desativar profissional
- `GET /api/v1/profissionais/especialidade/:especialidade` - Listar por especialidade

### Serviços
- `GET /api/v1/servicos` - Listar todos os serviços
- `GET /api/v1/servicos/:id` - Obter serviço específico
- `POST /api/v1/servicos` - Criar novo serviço
- `PUT /api/v1/servicos/:id` - Atualizar serviço
- `DELETE /api/v1/servicos/:id` - Desativar serviço
- `GET /api/v1/servicos/categoria/:categoria` - Listar por categoria

### Agendamentos
- `GET /api/v1/agendamentos` - Listar todos os agendamentos
- `GET /api/v1/agendamentos/:id` - Obter agendamento específico
- `POST /api/v1/agendamentos` - Criar novo agendamento
- `PUT /api/v1/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/v1/agendamentos/:id` - Cancelar agendamento
- `GET /api/v1/agendamentos/cliente/:clienteId` - Listar por cliente
- `GET /api/v1/agendamentos/profissional/:profissionalId` - Listar por profissional
- `POST /api/v1/agendamentos/disponibilidade` - Verificar disponibilidade

### Produtos
- `GET /api/v1/produtos` - Listar todos os produtos
- `GET /api/v1/produtos/:id` - Obter produto específico
- `POST /api/v1/produtos` - Criar novo produto
- `PUT /api/v1/produtos/:id` - Atualizar produto
- `DELETE /api/v1/produtos/:id` - Desativar produto
- `PUT /api/v1/produtos/:id/estoque` - Atualizar estoque
- `GET /api/v1/produtos/estoque-baixo` - Listar produtos com estoque baixo
- `GET /api/v1/produtos/categoria/:categoria` - Listar por categoria

### Lembretes
- `GET /api/v1/lembretes` - Listar todos os lembretes
- `GET /api/v1/lembretes/:id` - Obter lembrete específico
- `POST /api/v1/lembretes` - Criar novo lembrete
- `PUT /api/v1/lembretes/:id` - Atualizar lembrete
- `DELETE /api/v1/lembretes/:id` - Desativar lembrete
- `PUT /api/v1/lembretes/:id/concluir` - Marcar como concluído
- `GET /api/v1/lembretes/tipo/:tipo` - Listar por tipo
- `GET /api/v1/lembretes/hoje` - Listar lembretes para hoje

### Notificações
- `POST /api/v1/notificacoes/cliente-inativo/:id` - Enviar email para cliente inativo
- `POST /api/v1/notificacoes/confirmacao-agendamento/:id` - Enviar confirmação de agendamento
- `POST /api/v1/notificacoes/alerta-estoque/:id` - Enviar alerta de estoque baixo
- `POST /api/v1/notificacoes/lembrete/:id` - Enviar lembrete de limpeza/manutenção

### Análises
- `GET /api/v1/analise/clientes-inativos/:dias` - Analisar clientes inativos
- `GET /api/v1/analise/servicos-populares/:periodo` - Analisar serviços mais procurados
- `GET /api/v1/analise/desempenho-profissionais/:periodo` - Analisar desempenho de profissionais
- `GET /api/v1/analise/uso-produtos/:periodo` - Analisar uso de produtos

## Fluxos de Uso Principais

### Fluxo de Agendamento (Cliente)
1. Cliente acessa o aplicativo
2. Seleciona a categoria de serviço
3. Escolhe o serviço específico
4. Seleciona o profissional
5. Escolhe data e horário disponíveis
6. Fornece seus dados para o agendamento
7. Recebe confirmação por email

### Fluxo de Gerenciamento de Estoque (Administrador)
1. Administrador acessa o painel administrativo
2. Navega até a seção de Produtos
3. Visualiza produtos com estoque baixo
4. Registra entrada de novos produtos
5. Atualiza informações de produtos existentes

### Fluxo de Análise de Clientes Inativos (Administrador)
1. Administrador acessa o painel administrativo
2. Navega até a seção de Análises
3. Seleciona "Clientes Inativos"
4. Visualiza lista de clientes sem visitas recentes
5. Envia notificações para reativação

## Manutenção e Suporte

### Backup do Banco de Dados
Recomenda-se configurar backups automáticos diários do banco de dados MongoDB.

### Atualizações
O sistema foi projetado de forma modular, permitindo atualizações e adições de novas funcionalidades sem comprometer o funcionamento existente.

### Suporte Técnico
Para suporte técnico, entre em contato com a equipe de desenvolvimento através do email: suporte@salaobelezeapp.com.br

## Considerações de Segurança

- O sistema utiliza JWT para autenticação
- Senhas são armazenadas com hash bcrypt
- Todas as requisições API são validadas no servidor
- Dados sensíveis são protegidos

## Próximos Passos e Melhorias Futuras

- Implementação de pagamentos online
- Integração com redes sociais
- Sistema de fidelidade e pontos
- Aplicativo nativo para iOS e Android
- Dashboard avançado com mais análises e gráficos

---

© 2025 Salão de Beleza App - Todos os direitos reservados
