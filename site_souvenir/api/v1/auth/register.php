<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';
app_session_start();

if (requestMethod() !== 'POST') {
    jsonResponse(['error' => 'method-not-allowed'], 405);
    return;
}

$payload = requestJsonBody();
if (empty($payload)) {
    $payload = $_POST;
}

$name = trim((string) ($payload['name'] ?? ''));
$email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
$password = (string) ($payload['password'] ?? '');

if ($name === '' || $email === '' || $password === '') {
    jsonResponse(['error' => 'name-email-password-required'], 422);
    return;
}

$identity = strtolower($email) . '|' . (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!rate_limit_check('api_register', $identity, 6, 3600)) {
    jsonResponse(['error' => 'too-many-attempts'], 429);
    return;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'invalid-email'], 422);
    return;
}

if (mb_strlen($password) < 6) {
    jsonResponse(['error' => 'password-too-short'], 422);
    return;
}

$pdo = db();
if (!$pdo) {
    jsonResponse(['error' => 'database-unavailable'], 500);
    return;
}

$existsStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$existsStmt->execute(['email' => $email]);
if ($existsStmt->fetch()) {
    rate_limit_hit('api_register', $identity);
    jsonResponse(['error' => 'email-already-registered'], 409);
    return;
}

$insert = $pdo->prepare('
    INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
    VALUES (:name, :email, :password_hash, :role, 1, NOW(), NOW())
');

$insert->execute([
    'name' => $name,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'role' => 'customer',
]);
rate_limit_clear('api_register', $identity);

jsonResponse([
    'ok' => true,
    'message' => 'user-created',
]);
