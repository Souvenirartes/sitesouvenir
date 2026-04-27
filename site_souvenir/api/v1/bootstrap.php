<?php

declare(strict_types=1);

require_once __DIR__ . '/../../core/config.php';
require_once __DIR__ . '/../../core/db.php';
require_once __DIR__ . '/../../core/auth.php';
require_once __DIR__ . '/../../core/security.php';

security_headers(true);

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=120');
    $baseUrl = app_config()['base_url'] ?? '';
    $baseOrigin = '';
    if (is_string($baseUrl) && $baseUrl !== '') {
        $parts = parse_url($baseUrl);
        if (isset($parts['scheme'], $parts['host'])) {
            $baseOrigin = $parts['scheme'] . '://' . $parts['host'];
        }
    }
    $requestOrigin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($requestOrigin !== '' && $baseOrigin !== '' && strcasecmp($requestOrigin, $baseOrigin) === 0) {
        header('Access-Control-Allow-Origin: ' . $requestOrigin);
        header('Vary: Origin');
    } elseif ($baseOrigin !== '') {
        header('Access-Control-Allow-Origin: ' . $baseOrigin);
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function readJsonFile(string $filePath): array
{
    if (!is_file($filePath)) {
        return [];
    }

    $content = file_get_contents($filePath);
    if ($content === false) {
        return [];
    }

    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function requestMethod(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function requestJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
