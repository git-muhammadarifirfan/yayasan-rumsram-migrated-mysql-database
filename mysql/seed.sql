-- Initial seed data

INSERT INTO site_settings (
  id, org_name, tagline, hero_title, hero_subtitle, donation_cta_label, donation_link,
  about_short, about_long, vision, mission_items, values_items, address, phone, email,
  social, logo_url, hero_image_url, created_at, updated_at
) VALUES (
  1,
  'Yayasan Rumsram',
  'Bersama, bantu masyarakat',
  'Gerak bersama, dampak nyata untuk masyarakat.',
  'Yayasan Rumsram membangun program berkelanjutan melalui edukasi, kesehatan, dan penguatan ekonomi komunitas.',
  'Dukung Program',
  'https://example.com/donate',
  'Kami berfokus pada program yang terukur, transparan, dan dapat dikelola bersama komunitas.',
  '# Tentang Yayasan\n\nTulis profil panjang di sini (markdown).',
  'Menjadi yayasan yang berdampak dan berkelanjutan.',
  JSON_ARRAY('Edukasi komunitas', 'Kesehatan & kesejahteraan', 'Penguatan ekonomi', 'Transparansi program'),
  JSON_ARRAY('Transparan', 'Kolaboratif', 'Berkelanjutan'),
  'Indonesia',
  '+62 000 0000 0000',
  'info@rumsram.or.id',
  JSON_OBJECT('instagram','', 'x','', 'linkedin','', 'github',''),
  NULL,
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updated_at=VALUES(updated_at);

-- Default admin:
-- email: admin@rumsram.local
-- password: admin123
INSERT INTO admins (id, name, email, password_hash, role, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Super Admin',
  'admin@rumsram.local',
  '$2b$10$uLqQDvPrTMo8NzOnuXPm2eosymI.Y1dMN1MEffxAAoBAN3j1r0Lkq',
  'admin',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updated_at=VALUES(updated_at);
