<?php

declare(strict_types=1);

require_once __DIR__ . '/../core/db.php';
require_once __DIR__ . '/../core/auth.php';
require_once __DIR__ . '/../core/security.php';

app_session_start();
security_headers(false);

$setupKey = getenv('APP_SETUP_KEY') ?: '';
$providedKey = (string) ($_GET['key'] ?? $_POST['key'] ?? '');

if ($setupKey === '' || $providedKey !== $setupKey) {
    http_response_code(403);
    echo 'Acesso negado.';
    exit;
}

$pdo = db();
if (!$pdo) {
    http_response_code(500);
    echo 'Banco indisponível.';
    exit;
}

$exists = $pdo->query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")->fetch();
if ($exists) {
    http_response_code(409);
    echo 'Ja existe administrador cadastrado. Remova este arquivo.';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    if (!csrf_validate((string) ($_POST['_csrf'] ?? ''))) {
        echo 'Sessao invalida.';
        exit;
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $email = mb_strtolower(trim((string) ($_POST['email'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');

    if ($name === '' || $email === '' || $password === '') {
        echo 'Preencha todos os campos.';
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at) VALUES (:name, :email, :password_hash, :role, 1, NOW(), NOW())');
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'role' => 'admin',
    ]);

    echo 'Admin criado com sucesso. Remova este arquivo após o uso.';
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Criar Admin</title>
</head>
<body>
  <form method="post">
    <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <input type="hidden" name="key" value="<?= htmlspecialchars($providedKey, ENT_QUOTES, 'UTF-8') ?>">
    <label>Nome <input name="name" required></label><br><br>
    <label>Email <input name="email" type="email" required></label><br><br>
    <label>Senha <input name="password" type="password" required></label><br><br>
    <button type="submit">Criar admin</button>
  </form>
</body>
</html>
