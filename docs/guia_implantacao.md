# Guia de Instalação e Implantação - Aplicativo de Gerenciamento para Salão de Beleza

Este guia fornece instruções detalhadas para instalar e implantar o aplicativo de gerenciamento para salão de beleza em um ambiente de produção.

## Requisitos de Sistema

### Servidor
- Sistema Operacional: Ubuntu 20.04 LTS ou superior
- CPU: 2 núcleos ou superior
- RAM: 2GB ou superior
- Armazenamento: 20GB ou superior
- Conexão com a internet

### Software Necessário
- Node.js (versão 14.x ou superior)
- MongoDB (versão 4.4 ou superior)
- Nginx (para proxy reverso)
- PM2 (para gerenciamento de processos Node.js)
- Git

## Instalação do Ambiente

### 1. Atualizar o Sistema
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verificar a versão instalada
npm -v   # Verificar a versão do npm
```

### 3. Instalar MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Instalar PM2
```bash
sudo npm install -g pm2
```

## Implantação do Aplicativo

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/salao-beleza-app.git
cd salao-beleza-app
```

### 2. Configurar o Backend

#### Instalar Dependências
```bash
cd backend
npm install
```

#### Configurar Variáveis de Ambiente
```bash
cp .env.example .env
nano .env
```

Edite o arquivo `.env` com as configurações apropriadas:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/salao_beleza
JWT_SECRET=seu_token_secreto_aqui
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
EMAIL_FROM=seu_email@gmail.com
```

#### Iniciar o Backend com PM2
```bash
pm2 start src/server.js --name salao-backend
pm2 save
pm2 startup
```

### 3. Configurar o Frontend Web

#### Instalar Dependências
```bash
cd ../frontend/web/salao-web
npm install
```

#### Configurar API URL
Edite o arquivo `src/services/api.ts` para apontar para o endereço correto da API:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://seu-dominio.com/api/v1'
});

export default api;
```

#### Construir o Frontend
```bash
npm run build
```

#### Configurar Nginx para o Frontend Web
Crie um arquivo de configuração para o Nginx:
```bash
sudo nano /etc/nginx/sites-available/salao-web
```

Adicione o seguinte conteúdo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        root /caminho/para/salao-beleza-app/frontend/web/salao-web/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative a configuração:
```bash
sudo ln -s /etc/nginx/sites-available/salao-web /etc/nginx/sites-enabled/
sudo nginx -t  # Testar a configuração
sudo systemctl restart nginx
```

### 4. Configurar o Frontend Mobile (Expo)

#### Instalar Dependências
```bash
cd ../frontend/mobile/SalaoMobile
npm install
```

#### Configurar API URL
Edite o arquivo de configuração da API para apontar para o endereço correto:
```javascript
// Edite o arquivo de configuração da API
const API_URL = 'http://seu-dominio.com/api/v1';
```

#### Construir o Aplicativo
```bash
expo build:android  # Para Android
expo build:ios      # Para iOS (requer conta de desenvolvedor Apple)
```

## Configuração de Backup

### Configurar Backup do MongoDB
Crie um script de backup:
```bash
sudo nano /usr/local/bin/backup-mongodb.sh
```

Adicione o seguinte conteúdo:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +"%Y-%m-%d-%H-%M")
mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Torne o script executável:
```bash
sudo chmod +x /usr/local/bin/backup-mongodb.sh
```

Configure um cron job para executar o backup diariamente:
```bash
sudo crontab -e
```

Adicione a linha:
```
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

## Monitoramento e Manutenção

### Monitorar Logs do Backend
```bash
pm2 logs salao-backend
```

### Reiniciar o Backend
```bash
pm2 restart salao-backend
```

### Verificar Status do MongoDB
```bash
sudo systemctl status mongod
```

### Verificar Status do Nginx
```bash
sudo systemctl status nginx
```

## Atualizações do Sistema

### Atualizar o Backend
```bash
cd /caminho/para/salao-beleza-app
git pull
cd backend
npm install
pm2 restart salao-backend
```

### Atualizar o Frontend Web
```bash
cd /caminho/para/salao-beleza-app
git pull
cd frontend/web/salao-web
npm install
npm run build
```

## Solução de Problemas Comuns

### Problema: Backend não inicia
Verifique os logs:
```bash
pm2 logs salao-backend
```

Possíveis soluções:
- Verificar se o MongoDB está rodando
- Verificar as variáveis de ambiente
- Verificar permissões de arquivos

### Problema: Frontend não carrega
Verifique os logs do Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

Possíveis soluções:
- Verificar configuração do Nginx
- Verificar se o build do frontend foi gerado corretamente
- Verificar permissões da pasta do build

### Problema: Erro de conexão com o banco de dados
Verifique se o MongoDB está rodando:
```bash
sudo systemctl status mongod
```

Se não estiver:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Segurança

### Configurar Firewall
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### Configurar HTTPS com Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### Proteger MongoDB
Edite o arquivo de configuração do MongoDB:
```bash
sudo nano /etc/mongod.conf
```

Adicione/modifique as seguintes linhas:
```yaml
security:
  authorization: enabled
```

Reinicie o MongoDB:
```bash
sudo systemctl restart mongod
```

Crie um usuário administrador:
```bash
mongo
use admin
db.createUser({
  user: "adminUser",
  pwd: "senha_segura",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

Atualize a string de conexão no arquivo `.env`:
```
MONGO_URI=mongodb://adminUser:senha_segura@localhost:27017/salao_beleza?authSource=admin
```

## Contato e Suporte

Para suporte técnico ou dúvidas sobre a implantação, entre em contato:

- Email: suporte@salaobelezeapp.com.br
- Telefone: (XX) XXXX-XXXX
- Horário de atendimento: Segunda a Sexta, das 9h às 18h

---

© 2025 Salão de Beleza App - Todos os direitos reservados
