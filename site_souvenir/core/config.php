<?php

declare(strict_types=1);

function app_config(): array
{
    static $config;

    if (is_array($config)) {
        return $config;
    }

    $config = [
        'app_name' => 'Souvenir Brasil',
        'session_name' => 'souvenir_session',
        'base_url' => getenv('APP_BASE_URL') ?: 'https://www.souvenirbrasil.com.br',
        'db' => [
            'host' => getenv('DB_HOST') ?: 'localhost',
            'port' => (int) (getenv('DB_PORT') ?: 3306),
            'name' => getenv('DB_NAME') ?: 'souvenir_brasil',
            'user' => getenv('DB_USER') ?: 'root',
            'pass' => getenv('DB_PASS') ?: '',
            'charset' => 'utf8mb4',
        ],
        'auth' => [
            'token_ttl_days' => (int) (getenv('AUTH_TOKEN_TTL_DAYS') ?: 30),
        ],
    ];

    return $config;
}
