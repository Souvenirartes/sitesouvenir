<?php

declare(strict_types=1);

require_once __DIR__ . '/../core/auth.php';
require_once __DIR__ . '/../core/security.php';

$admin = auth_require_admin();
app_session_start();
security_headers(false);
$pdo = db();

if (!$pdo) {
    http_response_code(500);
    echo 'Banco de dados indisponivel. Verifique as credenciais no servidor.';
    exit;
}

function slugify(string $value): string
{
    $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    $normalized = $normalized !== false ? $normalized : $value;
    $normalized = strtolower($normalized);
    $normalized = preg_replace('/[^a-z0-9]+/', '-', $normalized) ?? '';
    return trim($normalized, '-');
}

function boolFromPost(string $key): int
{
    return isset($_POST[$key]) && $_POST[$key] === '1' ? 1 : 0;
}

function getSettingsMap(PDO $pdo): array
{
    $stmt = $pdo->query('SELECT setting_key, setting_value FROM settings');
    $rows = $stmt->fetchAll();
    $map = [];
    foreach ($rows as $row) {
        $map[(string) $row['setting_key']] = (string) $row['setting_value'];
    }
    return $map;
}

function setting(array $settings, string $key, string $default = ''): string
{
    return array_key_exists($key, $settings) ? (string) $settings[$key] : $default;
}

$message = '';
$error = '';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $csrf = (string) ($_POST['_csrf'] ?? '');
    if (!csrf_validate($csrf)) {
        $error = 'Sessao invalida. Atualize a pagina e tente novamente.';
    } else {
    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'save_product') {
            $id = (int) ($_POST['id'] ?? 0);
            $name = trim((string) ($_POST['name'] ?? ''));
            $slug = trim((string) ($_POST['slug'] ?? ''));
            $category = trim((string) ($_POST['category'] ?? ''));
            $priceLabel = trim((string) ($_POST['price_label'] ?? ''));
            $priceValue = (float) ($_POST['price_value'] ?? 0);
            $accent = trim((string) ($_POST['accent'] ?? '#1d4f9c'));
            $hasVariants = boolFromPost('has_variants');
            $active = boolFromPost('active');
            $publishedOnSite = boolFromPost('published_on_site');
            $showInApp = boolFromPost('show_in_app');
            $sortOrder = (int) ($_POST['sort_order'] ?? 0);

            if ($name === '' || $category === '' || $priceLabel === '') {
                throw new RuntimeException('Preencha nome, categoria e preco de exibicao.');
            }

            if ($slug === '') {
                $slug = slugify($name);
            }

            if ($slug === '') {
                throw new RuntimeException('Nao foi possivel gerar slug valido para o produto.');
            }

            if ($id > 0) {
                $stmt = $pdo->prepare('
                    UPDATE products
                    SET slug = :slug, name = :name, category = :category, price_label = :price_label, price_value = :price_value,
                        accent = :accent, has_variants = :has_variants, active = :active,
                        published_on_site = :published_on_site, show_in_app = :show_in_app, sort_order = :sort_order, updated_at = NOW()
                    WHERE id = :id
                ');
                $stmt->execute([
                    'id' => $id,
                    'slug' => $slug,
                    'name' => $name,
                    'category' => $category,
                    'price_label' => $priceLabel,
                    'price_value' => $priceValue,
                    'accent' => $accent,
                    'has_variants' => $hasVariants,
                    'active' => $active,
                    'published_on_site' => $publishedOnSite,
                    'show_in_app' => $showInApp,
                    'sort_order' => $sortOrder,
                ]);
                $message = 'Produto atualizado com sucesso.';
            } else {
                $stmt = $pdo->prepare('
                    INSERT INTO products
                        (slug, name, category, price_label, price_value, accent, has_variants, active, published_on_site, show_in_app, sort_order, created_at, updated_at)
                    VALUES
                        (:slug, :name, :category, :price_label, :price_value, :accent, :has_variants, :active, :published_on_site, :show_in_app, :sort_order, NOW(), NOW())
                ');
                $stmt->execute([
                    'slug' => $slug,
                    'name' => $name,
                    'category' => $category,
                    'price_label' => $priceLabel,
                    'price_value' => $priceValue,
                    'accent' => $accent,
                    'has_variants' => $hasVariants,
                    'active' => $active,
                    'published_on_site' => $publishedOnSite,
                    'show_in_app' => $showInApp,
                    'sort_order' => $sortOrder,
                ]);
                $message = 'Produto criado com sucesso.';
            }
        }

        if ($action === 'delete_product') {
            $id = (int) ($_POST['id'] ?? 0);
            if ($id > 0) {
                $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
                $stmt->execute(['id' => $id]);
                $message = 'Produto removido.';
            }
        }

        if ($action === 'save_settings') {
            $allowed = [
                'brand_name',
                'whatsapp_number',
                'support_email',
                'support_phone',
                'instagram_url',
                'hero_eyebrow',
                'hero_title',
                'hero_description',
                'cta_title',
                'cta_description',
                'home_carousel_images',
            ];

            $stmt = $pdo->prepare('
                INSERT INTO settings (setting_key, setting_value, updated_at)
                VALUES (:setting_key, :setting_value, NOW())
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
            ');

            foreach ($allowed as $key) {
                $value = trim((string) ($_POST[$key] ?? ''));
                $stmt->execute([
                    'setting_key' => $key,
                    'setting_value' => $value,
                ]);
            }

            $message = 'Configuracoes atualizadas com sucesso.';
        }

        if ($action === 'save_catalog') {
            $id = (int) ($_POST['id'] ?? 0);
            $name = trim((string) ($_POST['name'] ?? ''));
            $slug = trim((string) ($_POST['slug'] ?? ''));
            $description = trim((string) ($_POST['description'] ?? ''));
            $catalogUrl = trim((string) ($_POST['catalog_url'] ?? ''));
            $active = boolFromPost('catalog_active');
            $sortOrder = (int) ($_POST['sort_order'] ?? 0);

            if ($name === '' || $catalogUrl === '') {
                throw new RuntimeException('Preencha nome e URL do catalogo.');
            }

            if (!filter_var($catalogUrl, FILTER_VALIDATE_URL)) {
                throw new RuntimeException('URL do catalogo invalida.');
            }

            if ($slug === '') {
                $slug = slugify($name);
            }

            if ($slug === '') {
                throw new RuntimeException('Nao foi possivel gerar slug valido para o catalogo.');
            }

            if ($id > 0) {
                $stmt = $pdo->prepare('
                    UPDATE catalogs
                    SET slug = :slug, name = :name, description = :description, catalog_url = :catalog_url,
                        active = :active, sort_order = :sort_order, updated_at = NOW()
                    WHERE id = :id
                ');
                $stmt->execute([
                    'id' => $id,
                    'slug' => $slug,
                    'name' => $name,
                    'description' => $description,
                    'catalog_url' => $catalogUrl,
                    'active' => $active,
                    'sort_order' => $sortOrder,
                ]);
                $message = 'Catalogo atualizado com sucesso.';
            } else {
                $stmt = $pdo->prepare('
                    INSERT INTO catalogs (slug, name, description, catalog_url, active, sort_order, created_at, updated_at)
                    VALUES (:slug, :name, :description, :catalog_url, :active, :sort_order, NOW(), NOW())
                ');
                $stmt->execute([
                    'slug' => $slug,
                    'name' => $name,
                    'description' => $description,
                    'catalog_url' => $catalogUrl,
                    'active' => $active,
                    'sort_order' => $sortOrder,
                ]);
                $message = 'Catalogo criado com sucesso.';
            }
        }

        if ($action === 'delete_catalog') {
            $id = (int) ($_POST['id'] ?? 0);
            if ($id > 0) {
                $stmt = $pdo->prepare('DELETE FROM catalogs WHERE id = :id');
                $stmt->execute(['id' => $id]);
                $message = 'Catalogo removido.';
            }
        }
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
    }
}

$productsStmt = $pdo->query('SELECT * FROM products ORDER BY sort_order ASC, name ASC');
$products = $productsStmt->fetchAll();
$catalogsStmt = $pdo->query('SELECT * FROM catalogs ORDER BY sort_order ASC, name ASC');
$catalogs = $catalogsStmt->fetchAll();
$settings = getSettingsMap($pdo);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel Admin - Souvenir Brasil</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f1f4f7; color: #1f2a33; }
    header { background: #122f24; color: #fff; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
    header a { color: #fff; text-decoration: none; font-weight: 700; }
    main { padding: 16px; max-width: 1200px; margin: 0 auto; display: grid; gap: 16px; }
    .card { background: #fff; border-radius: 14px; box-shadow: 0 10px 24px rgba(0,0,0,0.08); padding: 16px; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    input, select, textarea { width: 100%; box-sizing: border-box; min-height: 40px; border-radius: 10px; border: 1px solid #c8d1d8; padding: 8px 10px; }
    textarea { min-height: 76px; resize: vertical; }
    .checks { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
    .checks label { display: inline-flex; align-items: center; gap: 6px; font-size: 0.9rem; }
    .actions { display: flex; gap: 8px; margin-top: 8px; }
    button { min-height: 40px; border: 0; border-radius: 10px; padding: 0 12px; cursor: pointer; font-weight: 700; }
    .save { background: #1d6b51; color: #fff; }
    .danger { background: #b53a3a; color: #fff; }
    .line { border-bottom: 1px solid #e6ebef; margin: 8px 0 12px; }
    .msg { color: #155d3f; }
    .err { color: #b12c2c; }
    .small { color: #5e6871; font-size: 0.92rem; }
  </style>
</head>
<body>
  <header>
    <div>
      <strong>Painel da Loja</strong><br>
      <small>Logado como <?= htmlspecialchars($admin['name'], ENT_QUOTES, 'UTF-8') ?></small>
    </div>
    <a href="/admin/logout.php">Sair</a>
  </header>
  <main>
    <section class="card">
      <h2>Configuracoes gerais (site + app)</h2>
      <form method="post">
        <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="action" value="save_settings">
        <div class="grid">
          <input name="brand_name" placeholder="Nome da marca" value="<?= htmlspecialchars(setting($settings, 'brand_name', 'Souvenir Brasil'), ENT_QUOTES, 'UTF-8') ?>">
          <input name="whatsapp_number" placeholder="WhatsApp (somente numeros, ex.: 5584999999999)" value="<?= htmlspecialchars(setting($settings, 'whatsapp_number', '558487678591'), ENT_QUOTES, 'UTF-8') ?>">
          <input name="support_email" placeholder="Email de suporte" value="<?= htmlspecialchars(setting($settings, 'support_email', 'contato@souvenirbrasil.com.br'), ENT_QUOTES, 'UTF-8') ?>">
          <input name="support_phone" placeholder="Telefone de suporte" value="<?= htmlspecialchars(setting($settings, 'support_phone', '(11) 4000-0000'), ENT_QUOTES, 'UTF-8') ?>">
          <input name="instagram_url" placeholder="URL do Instagram" value="<?= htmlspecialchars(setting($settings, 'instagram_url', 'https://www.instagram.com/souvenirbrasil/'), ENT_QUOTES, 'UTF-8') ?>">
          <input name="hero_eyebrow" placeholder="Texto pequeno da home (hero)" value="<?= htmlspecialchars(setting($settings, 'hero_eyebrow', ''), ENT_QUOTES, 'UTF-8') ?>">
          <input name="hero_title" placeholder="Titulo principal da home" value="<?= htmlspecialchars(setting($settings, 'hero_title', ''), ENT_QUOTES, 'UTF-8') ?>">
          <textarea name="hero_description" placeholder="Descricao principal da home"><?= htmlspecialchars(setting($settings, 'hero_description', ''), ENT_QUOTES, 'UTF-8') ?></textarea>
          <input name="cta_title" placeholder="Titulo da faixa CTA" value="<?= htmlspecialchars(setting($settings, 'cta_title', ''), ENT_QUOTES, 'UTF-8') ?>">
          <textarea name="cta_description" placeholder="Descricao da faixa CTA"><?= htmlspecialchars(setting($settings, 'cta_description', ''), ENT_QUOTES, 'UTF-8') ?></textarea>
          <textarea name="home_carousel_images" placeholder="Imagens do carrossel separadas por virgula (ex.: carousel1.png,carousel2.png)"><?= htmlspecialchars(setting($settings, 'home_carousel_images', ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="actions">
          <button class="save" type="submit">Salvar configuracoes</button>
        </div>
      </form>
      <p class="small">Essas configuracoes alimentam os endpoints da API e o frontend sem alterar o layout.</p>
      <?php if ($message !== ''): ?><p class="msg"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
      <?php if ($error !== ''): ?><p class="err"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    </section>

    <section class="card">
      <h2>Novo catalogo</h2>
      <form method="post">
        <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="action" value="save_catalog">
        <input type="hidden" name="id" value="0">
        <div class="grid">
          <input name="name" placeholder="Nome do catalogo" required>
          <input name="slug" placeholder="Slug (opcional)">
          <input name="catalog_url" placeholder="URL publica do PDF/catalogo" required>
          <input name="sort_order" type="number" step="1" value="0" placeholder="Ordem">
          <textarea name="description" placeholder="Descricao breve"></textarea>
        </div>
        <div class="checks">
          <label><input type="checkbox" name="catalog_active" value="1" checked> Ativo</label>
        </div>
        <div class="actions">
          <button class="save" type="submit">Salvar catalogo</button>
        </div>
      </form>
      <p class="small">Dica: a URL pode ser de um PDF hospedado no proprio dominio ou em storage externo.</p>
    </section>

    <section class="card">
      <h2>Catalogos cadastrados</h2>
      <?php foreach ($catalogs as $catalog): ?>
        <form method="post">
          <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <input type="hidden" name="action" value="save_catalog">
          <input type="hidden" name="id" value="<?= (int) $catalog['id'] ?>">
          <div class="grid">
            <input name="name" value="<?= htmlspecialchars($catalog['name'], ENT_QUOTES, 'UTF-8') ?>" required>
            <input name="slug" value="<?= htmlspecialchars($catalog['slug'], ENT_QUOTES, 'UTF-8') ?>">
            <input name="catalog_url" value="<?= htmlspecialchars($catalog['catalog_url'], ENT_QUOTES, 'UTF-8') ?>" required>
            <input name="sort_order" type="number" step="1" value="<?= (int) $catalog['sort_order'] ?>">
            <textarea name="description" placeholder="Descricao breve"><?= htmlspecialchars((string) $catalog['description'], ENT_QUOTES, 'UTF-8') ?></textarea>
          </div>
          <div class="checks">
            <label><input type="checkbox" name="catalog_active" value="1" <?= (int) $catalog['active'] === 1 ? 'checked' : '' ?>> Ativo</label>
          </div>
          <div class="actions">
            <button class="save" type="submit">Atualizar catalogo</button>
          </div>
        </form>
        <form method="post" onsubmit="return confirm('Deseja remover este catalogo?');">
          <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <input type="hidden" name="action" value="delete_catalog">
          <input type="hidden" name="id" value="<?= (int) $catalog['id'] ?>">
          <button class="danger" type="submit">Remover catalogo</button>
        </form>
        <div class="line"></div>
      <?php endforeach; ?>
    </section>

    <section class="card">
      <h2>Novo produto</h2>
      <form method="post">
        <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="action" value="save_product">
        <input type="hidden" name="id" value="0">
        <div class="grid">
          <input name="name" placeholder="Nome" required>
          <input name="slug" placeholder="Slug (opcional)">
          <input name="category" placeholder="Categoria" required>
          <input name="price_label" placeholder="Preco exibido (R$ 29,90)" required>
          <input name="price_value" type="number" step="0.01" placeholder="Preco numerico (29.90)">
          <input name="accent" placeholder="Cor destaque (#1d4f9c)" value="#1d4f9c">
          <input name="sort_order" type="number" step="1" value="0" placeholder="Ordem">
        </div>
        <div class="checks">
          <label><input type="checkbox" name="has_variants" value="1"> Tem variacoes</label>
          <label><input type="checkbox" name="active" value="1" checked> Ativo</label>
          <label><input type="checkbox" name="published_on_site" value="1" checked> Publicado no site</label>
          <label><input type="checkbox" name="show_in_app" value="1" checked> Mostrar no app</label>
        </div>
        <div class="actions">
          <button class="save" type="submit">Salvar produto</button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>Produtos cadastrados</h2>
      <?php foreach ($products as $product): ?>
        <form method="post">
          <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <input type="hidden" name="action" value="save_product">
          <input type="hidden" name="id" value="<?= (int) $product['id'] ?>">
          <div class="grid">
            <input name="name" value="<?= htmlspecialchars($product['name'], ENT_QUOTES, 'UTF-8') ?>" required>
            <input name="slug" value="<?= htmlspecialchars($product['slug'], ENT_QUOTES, 'UTF-8') ?>">
            <input name="category" value="<?= htmlspecialchars($product['category'], ENT_QUOTES, 'UTF-8') ?>" required>
            <input name="price_label" value="<?= htmlspecialchars($product['price_label'], ENT_QUOTES, 'UTF-8') ?>" required>
            <input name="price_value" type="number" step="0.01" value="<?= htmlspecialchars((string) $product['price_value'], ENT_QUOTES, 'UTF-8') ?>">
            <input name="accent" value="<?= htmlspecialchars($product['accent'], ENT_QUOTES, 'UTF-8') ?>">
            <input name="sort_order" type="number" step="1" value="<?= (int) $product['sort_order'] ?>">
          </div>
          <div class="checks">
            <label><input type="checkbox" name="has_variants" value="1" <?= (int) $product['has_variants'] === 1 ? 'checked' : '' ?>> Tem variacoes</label>
            <label><input type="checkbox" name="active" value="1" <?= (int) $product['active'] === 1 ? 'checked' : '' ?>> Ativo</label>
            <label><input type="checkbox" name="published_on_site" value="1" <?= (int) $product['published_on_site'] === 1 ? 'checked' : '' ?>> Publicado no site</label>
            <label><input type="checkbox" name="show_in_app" value="1" <?= (int) $product['show_in_app'] === 1 ? 'checked' : '' ?>> Mostrar no app</label>
          </div>
          <div class="actions">
            <button class="save" type="submit">Atualizar</button>
          </div>
        </form>
        <form method="post" onsubmit="return confirm('Deseja remover este produto?');">
          <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
          <input type="hidden" name="action" value="delete_product">
          <input type="hidden" name="id" value="<?= (int) $product['id'] ?>">
          <button class="danger" type="submit">Remover</button>
        </form>
        <div class="line"></div>
      <?php endforeach; ?>
    </section>
  </main>
</body>
</html>
