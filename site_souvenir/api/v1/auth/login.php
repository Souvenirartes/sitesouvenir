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

$email = trim((string) ($payload['email'] ?? ''));
$password = (string) ($payload['password'] ?? '');
$mode = (string) ($payload['mode'] ?? 'token'); // token | session
$deviceName = trim((string) ($payload['deviceName'] ?? 'app'));

if ($email === '' || $password === '') {
    jsonResponse(['error' => 'email-and-password-required'], 422);
    return;
}

$identity = strtolower($email) . '|' . (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!rate_limit_check('api_login', $identity, 10, 900)) {
    jsonResponse(['error' => 'too-many-attempts'], 429);
    return;
}

$user = auth_attempt_login($email, $password);
if (!$user) {
    rate_limit_hit('api_login', $identity);
    jsonResponse(['error' => 'invalid-credentials'], 401);
    return;
}
rate_limit_clear('api_login', $identity);

if ($mode === 'session') {
    auth_login_session($user);
    jsonResponse([
        'ok' => true,
        'mode' => 'session',
        'user' => [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ],
    ]);
    return;
}

$token = auth_create_token((int) $user['id'], $deviceName !== '' ? $deviceName : 'app');
jsonResponse([
    'ok' => true,
    'mode' => 'token',
    'token' => $token,
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
]);
