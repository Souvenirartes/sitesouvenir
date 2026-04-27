# Integracao Mobile (Android/iOS)

## Endpoints disponiveis
- `GET /api/v1/index.php`
- `GET /api/v1/site-config.php`
- `GET /api/v1/products.php?channel=site&activeOnly=1`
- `GET /api/v1/products.php?channel=app&activeOnly=1`
- `GET /api/v1/catalogs.php?activeOnly=1`
- `POST /api/v1/auth/register.php`
- `POST /api/v1/auth/login.php`
- `GET /api/v1/auth/me.php`

## Objetivo
Esses endpoints permitem que app Android e iOS consumam o mesmo catalogo da web sem depender de HTML ou scraping.

## Contrato principal (`/api/v1/products.php`)
Cada item possui:
- `id`: identificador estavel para carrinho, favoritos e analytics.
- `slug`: identificador legivel para links e rotas.
- `name`, `category`, `accent`.
- `priceLabel` e `priceValue` (valor numerico para calculo em app).
- `hasVariants`, `active`.
- `publishedOnSite` e `showInApp` controlam visibilidade por canal.

## Regra de visibilidade (site + app)
- No site: produto precisa estar `active=1` e `published_on_site=1`.
- No app: produto precisa estar `active=1`, `published_on_site=1` e `show_in_app=1`.
- Resultado: apenas itens realmente publicados no site conseguem aparecer no app.

## Front unico de operacao
- URL: `/admin/index.php`
- Modulo Produtos: criar, editar, ativar/desativar, publicar no site e liberar no app.
- Modulo Catalogos: criar e organizar catalogos com URL publica.
- Modulo Configuracoes: WhatsApp, contatos, Instagram, textos da home e imagens do carrossel.

## Login unico (site e app)
- Cadastro: `POST /api/v1/auth/register.php` com `name`, `email`, `password`.
- Login app: `POST /api/v1/auth/login.php` com `email`, `password`, `mode=token`.
- Login web/admin: `POST /api/v1/auth/login.php` com `email`, `password`, `mode=session`.
- Usuario autenticado: `GET /api/v1/auth/me.php` com `Authorization: Bearer TOKEN` ou sessao web.

## Versionamento
- Versao atual: `v1`.
- Quando houver mudanca quebrando contrato, criar `v2` sem remover `v1` imediatamente.

## Recomendacoes para app
- Cache local por `version + updatedAt`.
- Fallback offline para ultimo catalogo valido.
- Atualizacao em background ao abrir app.

## Publicacao no HostGator (cPanel)
- Manter esta estrutura dentro de `public_html/`.
- Confirmar PHP 8+ ativo no dominio/subdominio.
- Garantir que `mod_rewrite` esteja habilitado para usar os atalhos via `.htaccess`.
- Testar no navegador:
  - `/api/v1/index.php`
  - `/api/v1/site-config.php`
  - `/api/v1/products.php?channel=app&activeOnly=1`
- Criar tabelas executando:
  - `database/schema.sql`
  - `database/seed_products.sql`
  - `database/seed_settings.sql`
  - `database/seed_catalogs.sql`
- Criar primeiro admin:
  - definir variavel `APP_SETUP_KEY`
  - abrir `/admin/create-admin.php?key=SUA_CHAVE`
  - remover `admin/create-admin.php` depois

## Proximo passo recomendado
Quando o catalogo crescer, evoluir para:
- Controle de estoque e status.
- Logs e metricas de consumo.
- Permissoes por perfil (admin, operador, comercial).
