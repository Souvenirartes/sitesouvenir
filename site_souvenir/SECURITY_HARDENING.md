# Security Hardening (Resumo)

## Backend/Admin
- Cookies de sessao com `HttpOnly`, `SameSite=Lax` e `Secure` quando HTTPS.
- Protecao CSRF em formularios do admin (`/admin/login.php`, `/admin/index.php`, `/admin/create-admin.php`).
- Rate limit em login/cadastro:
  - Admin login: max 8 tentativas por 15 min.
  - API login: max 10 tentativas por 15 min.
  - API register: max 6 tentativas por 60 min.
- `create-admin.php` bloqueia nova criacao quando ja existe admin.

## Headers de seguranca
- `.htaccess` raiz adiciona:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restritiva
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-site`

## API
- Headers de seguranca enviados via `api/v1/bootstrap.php`.
- CORS limitado ao dominio configurado (`APP_BASE_URL`).

## Checklist de producao
1. Forcar HTTPS no dominio.
2. Remover `admin/create-admin.php` apos criar admin inicial.
3. Usar senha forte para admins.
4. Fazer backup diario do banco.
5. Revisar logs de tentativa de login periodicamente.
