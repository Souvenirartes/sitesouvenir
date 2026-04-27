<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

function app_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $config = app_config();
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? '') === '443');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name($config['session_name']);
    session_start();
}

function auth_user_by_id(int $userId): ?array
{
    $pdo = db();
    if (!$pdo) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    if (!$user || (int) $user['active'] !== 1) {
        return null;
    }

    return $user;
}

function auth_find_user_by_email(string $email): ?array
{
    $pdo = db();
    if (!$pdo) {
        return null;
    }

    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, active FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => mb_strtolower(trim($email))]);
    $user = $stmt->fetch();

    if (!$user || (int) $user['active'] !== 1) {
        return null;
    }

    return $user;
}

function auth_attempt_login(string $email, string $password): ?array
{
    $user = auth_find_user_by_email($email);
    if (!$user) {
        return null;
    }

    if (!password_verify($password, $user['password_hash'])) {
        return null;
    }

    return $user;
}

function auth_login_session(array $user): void
{
    app_session_start();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
}

function auth_logout_session(): void
{
    app_session_start();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
    }

    session_destroy();
}

function auth_session_user(): ?array
{
    app_session_start();
    $userId = (int) ($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        return null;
    }

    return auth_user_by_id($userId);
}

function auth_bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($header, 'Bearer ')) {
        return trim(substr($header, 7));
    }

    return null;
}

function auth_create_token(int $userId, string $name = 'app'): string
{
    $pdo = db();
    if (!$pdo) {
        throw new RuntimeException('database-unavailable');
    }

    $plain = bin2hex(random_bytes(32));
    $hash = hash('sha256', $plain);
    $ttlDays = max(1, app_config()['auth']['token_ttl_days']);

    $stmt = $pdo->prepare('
        INSERT INTO user_tokens (user_id, token_hash, name, expires_at, created_at, updated_at)
        VALUES (:user_id, :token_hash, :name, DATE_ADD(NOW(), INTERVAL :ttl DAY), NOW(), NOW())
    ');
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindValue(':token_hash', $hash, PDO::PARAM_STR);
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':ttl', $ttlDays, PDO::PARAM_INT);
    $stmt->execute();

    return $plain;
}

function auth_token_user(?string $plainToken): ?array
{
    if (!$plainToken) {
        return null;
    }

    $pdo = db();
    if (!$pdo) {
        return null;
    }

    $hash = hash('sha256', trim($plainToken));
    $stmt = $pdo->prepare('
        SELECT t.id AS token_id, u.id, u.name, u.email, u.role, u.active
        FROM user_tokens t
        INNER JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = :token_hash
          AND t.revoked_at IS NULL
          AND (t.expires_at IS NULL OR t.expires_at >= NOW())
        LIMIT 1
    ');
    $stmt->execute(['token_hash' => $hash]);
    $row = $stmt->fetch();

    if (!$row || (int) $row['active'] !== 1) {
        return null;
    }

    $touch = $pdo->prepare('UPDATE user_tokens SET last_used_at = NOW(), updated_at = NOW() WHERE id = :id');
    $touch->execute(['id' => (int) $row['token_id']]);

    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
        'active' => (int) $row['active'],
    ];
}

function auth_current_user(): ?array
{
    $sessionUser = auth_session_user();
    if ($sessionUser) {
        return $sessionUser;
    }

    return auth_token_user(auth_bearer_token());
}

function auth_require_admin(): array
{
    $user = auth_session_user();
    if (!$user || $user['role'] !== 'admin') {
        header('Location: /admin/login.php');
        exit;
    }

    return $user;
}
