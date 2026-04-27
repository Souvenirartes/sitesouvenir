# Deploy no HostGator (site + app com login unico)

## 1) Banco MySQL no cPanel
1. Criar banco MySQL.
2. Criar usuario MySQL e vincular com permissao total no banco.
3. Importar:
   - `database/schema.sql`
   - `database/seed_products.sql`
   - `database/seed_settings.sql`
   - `database/seed_catalogs.sql`

## 2) Configurar variaveis de ambiente
Defina no ambiente PHP (ou ajuste no `core/config.php`):
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `APP_BASE_URL`
- `APP_SETUP_KEY` (usado uma unica vez para criar admin)

## 3) Publicar arquivos
- Subir o projeto para `public_html/`.
- Confirmar que `mod_rewrite` esta ativo (para `/api/v1/.htaccess`).
- Confirmar que `mod_headers` esta ativo (para headers de seguranca em `/.htaccess`).

## 4) Criar administrador inicial
1. Acesse `/admin/create-admin.php?key=SUA_CHAVE`.
2. Cadastre o primeiro usuario admin.
3. Delete o arquivo `admin/create-admin.php` depois de concluir.

## 5) Testes rapidos
- `GET /api/v1/index.php`
- `GET /api/v1/products.php?channel=app&activeOnly=1`
- `GET /api/v1/catalogs.php?activeOnly=1`
- `POST /api/v1/auth/register.php`
- `POST /api/v1/auth/login.php`
- `GET /admin/login.php`

## 6) Fluxo operacional
- O time publica e edita produtos no painel `/admin/index.php`.
- O time cadastra catalogos no mesmo painel e o cliente acessa em `/catalogos.html`.
- O mesmo painel tambem permite editar textos da home, WhatsApp, contatos, Instagram e imagens do carrossel.
- Site consome canal `site`.
- App consome canal `app`.
- Assim o app recebe apenas produtos publicados no site e liberados para app.

## 7) Seguranca minima em producao
- Forcar HTTPS no dominio.
- Trocar senhas padrao e usar senha forte no admin.
- Revisar `SECURITY_HARDENING.md`.
