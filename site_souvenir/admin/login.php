<?php

declare(strict_types=1);

require_once __DIR__ . '/../core/auth.php';
require_once __DIR__ . '/../core/security.php';

app_session_start();
security_headers(false);

$user = auth_session_user();
if ($user && $user['role'] === 'admin') {
    header('Location: /admin/index.php');
    exit;
}

$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $csrf = (string) ($_POST['_csrf'] ?? '');
    if (!csrf_validate($csrf)) {
        $error = 'Sessao invalida. Recarregue a pagina e tente novamente.';
    } else {
        $email = trim((string) ($_POST['email'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $identity = strtolower($email) . '|' . (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

        if (!rate_limit_check('admin_login', $identity, 8, 900)) {
            $error = 'Muitas tentativas. Aguarde alguns minutos.';
        } else {
            $authUser = auth_attempt_login($email, $password);
            if ($authUser && $authUser['role'] === 'admin') {
                rate_limit_clear('admin_login', $identity);
                auth_login_session($authUser);
                header('Location: /admin/index.php');
                exit;
            }

            rate_limit_hit('admin_login', $identity);
            $error = 'Credenciais invalidas ou sem permissao de administrador.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Souvenir Brasil</title>
  <style>
    body { font-family: "Manrope", "Segoe UI", sans-serif; margin: 0; background: radial-gradient(circle at 15% 0%, #0e2a3f 0%, #0b1f31 45%, #07141f 100%); color: #0f1f2a; }
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { width: 100%; max-width: 460px; background: rgba(255,255,255,0.96); border-radius: 20px; padding: 26px; box-shadow: 0 28px 70px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.5); }
    h1 { margin: 0 0 10px; font-size: 1.5rem; color: #112838; }
    p { margin: 0 0 10px; color: #415563; }
    label { display: block; margin: 14px 0 6px; font-weight: 700; font-size: 0.92rem; color: #123447; }
    input { width: 100%; box-sizing: border-box; padding: 13px; border-radius: 12px; border: 1px solid #c7d2db; font: inherit; }
    button { margin-top: 16px; width: 100%; min-height: 46px; border: 0; border-radius: 12px; background: linear-gradient(135deg, #0f6f53, #0b5a43); color: #fff; font-weight: 800; letter-spacing: 0.02em; cursor: pointer; }
    .error { margin-top: 12px; color: #9d1e1e; font-size: 0.92rem; font-weight: 600; }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card">
      <h1>Painel da Loja</h1>
      <p>Gestao central de produtos, conteudo e operacao do app/site.</p>
      <form method="post" novalidate>
        <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" required autocomplete="email">

        <label for="password">Senha</label>
        <input id="password" name="password" type="password" required autocomplete="current-password">

        <button type="submit">Entrar</button>
      </form>
      <?php if ($error !== ''): ?>
        <p class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
      <?php endif; ?>
    </section>
  </main>
</body>
</html>
