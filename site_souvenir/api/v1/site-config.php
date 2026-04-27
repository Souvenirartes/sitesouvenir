<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$config = readJsonFile(__DIR__ . '/site-config.json');

if (empty($config)) {
    jsonResponse([
        'version' => 'v1',
        'error' => 'site-config-not-found',
    ], 500);
    return;
}

function settingValue(array $settings, string $key, string $default = ''): string
{
    return array_key_exists($key, $settings) ? (string) $settings[$key] : $default;
}

$pdo = db();
if ($pdo) {
    $stmt = $pdo->query('SELECT setting_key, setting_value FROM settings');
    $settingsRows = $stmt->fetchAll();
    $settings = [];
    foreach ($settingsRows as $row) {
        $settings[(string) $row['setting_key']] = (string) $row['setting_value'];
    }

    $carouselRaw = settingValue($settings, 'home_carousel_images', '');
    $carouselImages = array_values(array_filter(array_map('trim', explode(',', $carouselRaw))));

    $config['brand'] = settingValue($settings, 'brand_name', (string) ($config['brand'] ?? 'Souvenir Brasil'));
    $config['whatsappNumber'] = settingValue($settings, 'whatsapp_number', (string) ($config['whatsappNumber'] ?? ''));
    $config['supportEmail'] = settingValue($settings, 'support_email', 'contato@souvenirbrasil.com.br');
    $config['supportPhone'] = settingValue($settings, 'support_phone', '(11) 4000-0000');
    $config['instagramUrl'] = settingValue($settings, 'instagram_url', 'https://www.instagram.com/souvenirbrasil/');
    $config['heroEyebrow'] = settingValue($settings, 'hero_eyebrow', '');
    $config['heroTitle'] = settingValue($settings, 'hero_title', '');
    $config['heroDescription'] = settingValue($settings, 'hero_description', '');
    $config['ctaTitle'] = settingValue($settings, 'cta_title', '');
    $config['ctaDescription'] = settingValue($settings, 'cta_description', '');
    $config['homeCarouselImages'] = $carouselImages;
}

jsonResponse($config);
