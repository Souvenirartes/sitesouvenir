INSERT INTO settings (setting_key, setting_value, updated_at) VALUES
('brand_name', 'Souvenir Brasil', NOW()),
('whatsapp_number', '558487678591', NOW()),
('support_email', 'contato@souvenirbrasil.com.br', NOW()),
('support_phone', '(11) 4000-0000', NOW()),
('instagram_url', 'https://www.instagram.com/souvenirbrasil/', NOW()),
('hero_eyebrow', 'Memorias que viajam com voce', NOW()),
('hero_title', 'Sempre boas lembrancas, feitas no Brasil', NOW()),
('hero_description', 'Producao propria em Natal, Florianopolis e Fortaleza, lojas fisicas em destinos turisticos e atendimento nacional para pedidos personalizados.', NOW()),
('cta_title', 'Quer comprar ou personalizar um produto?', NOW()),
('cta_description', 'Fale com a nossa equipe e receba atendimento direto pelo WhatsApp com muito mais agilidade.', NOW()),
('home_carousel_images', 'carousel1.png,carousel2.png,carousel3.png,carousel4.png,carousel5.png,carousel6.png', NOW())
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW();
