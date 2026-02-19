# Guia Detallada de Despliegue (Ubuntu)

Este documento describe como ejecutar y poner en produccion el proyecto `inventario-computo` en Ubuntu con Node.js, MongoDB, systemd y Nginx (HTTPS).

## 1. Requisitos Previos

- Ubuntu con acceso `sudo`.
- Node.js 20.x (recomendado >= 20.19.0).
- MongoDB en ejecucion (local o remoto).
- Nginx (si usaras reverse proxy y HTTPS).
- Dominio publico (si usaras Lets Encrypt) o un certificado local (si es solo LAN).

## 2. Node.js 20 en Ubuntu

### Opcion A: Con nvm (recomendado)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v
```

### Opcion B: NodeSource (sin nvm)

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update
sudo apt install -y nodejs
node -v
```

## 3. Configuracion del Proyecto

### 3.1 Variables de entorno

Crear `.env` a partir de `.env.example` y ajustarlo:

```bash
cp .env.example .env
```

Valores tipicos:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventario
NODE_ENV=development
```

### 3.2 Dependencias

```bash
npm install
```

Si tienes errores de red, intenta:

```bash
npm_config_cache=/tmp/npm-cache npm install
```

## 4. MongoDB

Debes tener MongoDB corriendo. Si usas una instancia local:

```bash
sudo systemctl status mongod
```

Si no esta activo:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 5. Ejecutar la App

### 5.1 Modo desarrollo

```bash
npm run dev
```

### 5.2 Modo produccion (sin systemd)

```bash
npm start
```

### 5.3 Modo rapido (sin MongoDB)

```bash
npm run quick
```

## 6. Administrar Node con systemd

### 6.1 Crear el servicio

Archivo: `/etc/systemd/system/inventario.service`

```ini
[Unit]
Description=Inventario de computo (Node)
After=network.target

[Service]
Type=simple
User=javo
WorkingDirectory=/home/javo/avatar/inventario-computo
EnvironmentFile=/home/javo/avatar/inventario-computo/.env
ExecStart=/usr/bin/node /home/javo/avatar/inventario-computo/server.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 6.2 Activar el servicio

```bash
sudo systemctl daemon-reload
sudo systemctl enable inventario
sudo systemctl start inventario
```

### 6.3 Comandos utiles

```bash
sudo systemctl status inventario
sudo systemctl restart inventario
sudo journalctl -u inventario -f
```

## 7. Nginx como Reverse Proxy (HTTP)

### 7.1 Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 7.2 Configurar sitio

Archivo: `/etc/nginx/sites-available/inventario`

```nginx
server {
    listen 80;
    server_name TU_DOMINIO_O_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar:

```bash
sudo ln -s /etc/nginx/sites-available/inventario /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. HTTPS con Certbot (dominio publico)

### 8.1 Instalar certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtener certificado

```bash
sudo certbot --nginx -d TU_DOMINIO
```

Certbot actualiza Nginx automaticamente y configura la renovacion.

## 9. HTTPS en LAN con mkcert (sin dominio publico)

### 9.1 Instalar mkcert

```bash
sudo apt install -y libnss3-tools
```

Descarga mkcert desde su repositorio y hazlo ejecutable, luego:

```bash
mkcert -install
mkcert 192.168.1.51
```

Usa los archivos generados en Nginx:

```nginx
server {
    listen 443 ssl;
    server_name 192.168.1.51;

    ssl_certificate     /ruta/a/192.168.1.51.pem;
    ssl_certificate_key /ruta/a/192.168.1.51-key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 10. Nota sobre CSP y Kaspersky

Si usas un antivirus que inyecta scripts (ej. Kaspersky), el CSP puede bloquearlo.
Puedes permitirlo en `server.js` ajustando Helmet, pero se recomienda mantener CSP estricto en produccion.

## 11. Verificaciones rapidas

```bash
node -v
npm -v
sudo systemctl status inventario
sudo systemctl status nginx
curl -I http://127.0.0.1:3000/health
```

