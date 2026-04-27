INSERT INTO catalogs (slug, name, description, catalog_url, active, sort_order, created_at, updated_at) VALUES
('catalogo-verao', 'Catalogo Verao', 'Colecao com produtos para temporada de alta rotacao.', 'https://www.souvenirbrasil.com.br/catalogos/catalogo-verao.pdf', 1, 1, NOW(), NOW()),
('catalogo-personalizados', 'Catalogo Personalizados', 'Modelos customizaveis para pedidos especiais.', 'https://www.souvenirbrasil.com.br/catalogos/catalogo-personalizados.pdf', 1, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  catalog_url = VALUES(catalog_url),
  active = VALUES(active),
  sort_order = VALUES(sort_order),
  updated_at = NOW();
