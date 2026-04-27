<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

$user = auth_current_user();
if (!$user) {
    jsonResponse(['error' => 'unauthenticated'], 401);
    return;
}

jsonResponse([
    'ok' => true,
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
]);
