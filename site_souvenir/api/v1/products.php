<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$channel = $_GET['channel'] ?? 'site';
$allowedChannels = ['site', 'app', 'all'];
if (!in_array($channel, $allowedChannels, true)) {
    $channel = 'site';
}

$activeOnly = isset($_GET['activeOnly']) && $_GET['activeOnly'] === '1';
$pdo = db();

if ($pdo) {
    $sql = '
        SELECT
            id,
            slug,
            name,
            category,
            price_label AS priceLabel,
            price_value AS priceValue,
            accent,
            has_variants AS hasVariants,
            active,
            published_on_site AS publishedOnSite,
            show_in_app AS showInApp,
            sort_order AS sortOrder,
            updated_at AS updatedAt
        FROM products
        WHERE 1 = 1
    ';

    if ($activeOnly) {
        $sql .= ' AND active = 1 ';
    }

    if ($channel === 'site') {
        $sql .= ' AND published_on_site = 1 ';
    } elseif ($channel === 'app') {
        $sql .= ' AND published_on_site = 1 AND show_in_app = 1 ';
    }

    $sql .= ' ORDER BY sort_order ASC, name ASC ';
    $stmt = $pdo->query($sql);
    $items = $stmt->fetchAll();

    jsonResponse([
        'version' => 'v1',
        'updatedAt' => gmdate('c'),
        'currency' => 'BRL',
        'items' => array_map(static function (array $item): array {
            return [
                'id' => $item['id'],
                'slug' => $item['slug'],
                'name' => $item['name'],
                'category' => $item['category'],
                'priceLabel' => $item['priceLabel'],
                'priceValue' => (float) $item['priceValue'],
                'accent' => $item['accent'],
                'hasVariants' => (bool) $item['hasVariants'],
                'active' => (bool) $item['active'],
                'publishedOnSite' => (bool) $item['publishedOnSite'],
                'showInApp' => (bool) $item['showInApp'],
                'sortOrder' => (int) $item['sortOrder'],
                'updatedAt' => $item['updatedAt'],
            ];
        }, $items),
    ]);
    return;
}

$catalog = readJsonFile(__DIR__ . '/products.json');

if (empty($catalog)) {
    jsonResponse([
        'version' => 'v1',
        'error' => 'products-not-found',
    ], 500);
    return;
}

if ($activeOnly && isset($catalog['items']) && is_array($catalog['items'])) {
    $catalog['items'] = array_values(array_filter(
        $catalog['items'],
        static fn(array $item): bool => ($item['active'] ?? false) === true
    ));
}

jsonResponse($catalog);
