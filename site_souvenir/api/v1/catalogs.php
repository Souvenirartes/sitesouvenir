<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$activeOnly = isset($_GET['activeOnly']) && $_GET['activeOnly'] === '1';
$search = trim((string) ($_GET['search'] ?? ''));

$pdo = db();
if ($pdo) {
    $sql = '
        SELECT id, slug, name, description, catalog_url AS catalogUrl, active, sort_order AS sortOrder, updated_at AS updatedAt
        FROM catalogs
        WHERE 1 = 1
    ';
    $params = [];

    if ($activeOnly) {
        $sql .= ' AND active = 1 ';
    }

    if ($search !== '') {
        $sql .= ' AND (name LIKE :search OR description LIKE :search) ';
        $params['search'] = '%' . $search . '%';
    }

    $sql .= ' ORDER BY sort_order ASC, name ASC ';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $items = $stmt->fetchAll();

    jsonResponse([
        'version' => 'v1',
        'updatedAt' => gmdate('c'),
        'items' => array_map(static function (array $item): array {
            return [
                'id' => (int) $item['id'],
                'slug' => $item['slug'],
                'name' => $item['name'],
                'description' => $item['description'] ?? '',
                'catalogUrl' => $item['catalogUrl'],
                'active' => (bool) $item['active'],
                'sortOrder' => (int) $item['sortOrder'],
                'updatedAt' => $item['updatedAt'],
            ];
        }, $items),
    ]);
    return;
}

$fallback = readJsonFile(__DIR__ . '/catalogs.json');
if (empty($fallback)) {
    jsonResponse([
        'version' => 'v1',
        'items' => [],
    ]);
    return;
}

jsonResponse($fallback);
