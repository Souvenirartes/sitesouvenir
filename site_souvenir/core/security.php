<?php

declare(strict_types=1);

function security_headers(bool $forApi = false): void
{
    if (!headers_sent()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
        header('X-XSS-Protection: 0');
        if ($forApi) {
            header('Content-Security-Policy: default-src \'none\'; frame-ancestors \'none\'; base-uri \'none\';');
        }
    }
}

function csrf_token(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return '';
    }

    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['_csrf_token'];
}

function csrf_validate(?string $token): bool
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return false;
    }

    $stored = (string) ($_SESSION['_csrf_token'] ?? '');
    if ($stored === '' || !$token) {
        return false;
    }

    return hash_equals($stored, $token);
}

function rate_limit_key(string $scope, string $identity): string
{
    return '_rate_' . $scope . '_' . hash('sha256', $identity);
}

function rate_limit_check(string $scope, string $identity, int $maxAttempts, int $windowSeconds): bool
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return true;
    }

    $key = rate_limit_key($scope, $identity);
    $now = time();

    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 0, 'start' => $now];
    }

    $bucket = $_SESSION[$key];
    $start = (int) ($bucket['start'] ?? $now);
    $count = (int) ($bucket['count'] ?? 0);

    if (($now - $start) > $windowSeconds) {
        $_SESSION[$key] = ['count' => 0, 'start' => $now];
        return true;
    }

    return $count < $maxAttempts;
}

function rate_limit_hit(string $scope, string $identity): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return;
    }

    $key = rate_limit_key($scope, $identity);
    $now = time();

    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 0, 'start' => $now];
    }

    $_SESSION[$key]['count'] = (int) ($_SESSION[$key]['count'] ?? 0) + 1;
}

function rate_limit_clear(string $scope, string $identity): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return;
    }

    $key = rate_limit_key($scope, $identity);
    unset($_SESSION[$key]);
}
