CREATE DATABASE IF NOT EXISTS animalia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE animalia;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  city VARCHAR(120) DEFAULT 'Oviedo',
  bio VARCHAR(500) DEFAULT '',
  theme_color VARCHAR(20) DEFAULT '#0f766e',
  avatar_url MEDIUMTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  breed VARCHAR(120) NOT NULL,
  image_url MEDIUMTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  type VARCHAR(60) NOT NULL,
  address VARCHAR(240) DEFAULT '',
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  has_pets BOOLEAN DEFAULT FALSE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pet_id INT NULL,
  content TEXT NOT NULL,
  image_url MEDIUMTEXT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS park_presences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  user_id INT NOT NULL,
  pet_id INT NOT NULL,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_active_presence (location_id, pet_id),
  CONSTRAINT fk_presences_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  CONSTRAINT fk_presences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_presences_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_events_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_attendees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_event_attendee (event_id, user_id),
  CONSTRAINT fk_attendees_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS location_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_location_favorite (user_id, location_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO users (id, name, email, password) VALUES
  (1, 'María G.', 'maria@example.com', '123456'),
  (2, 'Carlos R.', 'carlos@example.com', '123456'),
  (3, 'Ana M.', 'ana@example.com', '123456'),
  (4, 'Luis P.', 'luis@example.com', '123456'),
  (5, 'Elena S.', 'elena@example.com', '123456'),
  (6, 'Sofía L.', 'sofia@example.com', '123456'),
  (7, 'Diego V.', 'diego@example.com', '123456'),
  (8, 'Paula N.', 'paula@example.com', '123456'),
  (9, 'Iván T.', 'ivan@example.com', '123456'),
  (10, 'Nora F.', 'nora@example.com', '123456'),
  (11, 'Hugo C.', 'hugo@example.com', '123456'),
  (12, 'Clara B.', 'clara@example.com', '123456'),
  (13, 'Mateo D.', 'mateo@example.com', '123456'),
  (14, 'Irene A.', 'irene@example.com', '123456'),
  (15, 'Raúl H.', 'raul@example.com', '123456'),
  (16, 'Lucía V.', 'lucia@example.com', '123456'),
  (17, 'Mario Q.', 'mario@example.com', '123456'),
  (18, 'Noelia P.', 'noelia@example.com', '123456'),
  (19, 'Adrián S.', 'adrian@example.com', '123456'),
  (20, 'Vera M.', 'vera@example.com', '123456');

INSERT INTO pets (id, user_id, name, breed) VALUES
  (1, 1, 'Luna', 'Golden Retriever'),
  (2, 2, 'Max', 'Beagle'),
  (3, 3, 'Rocky', 'Pastor Alemán'),
  (4, 4, 'Toby', 'Labrador'),
  (5, 5, 'Coco', 'French Bulldog'),
  (6, 6, 'Nala', 'Border Collie'),
  (7, 7, 'Bruno', 'Mestizo'),
  (8, 8, 'Kira', 'Shiba Inu'),
  (9, 9, 'Thor', 'Husky'),
  (10, 10, 'Mia', 'Caniche'),
  (11, 11, 'Bimba', 'Bichón Maltés'),
  (12, 12, 'Simba', 'Gato Europeo'),
  (13, 13, 'Leo', 'Cocker Spaniel'),
  (14, 14, 'Duna', 'Galgo'),
  (15, 15, 'Otto', 'Schnauzer'),
  (16, 16, 'Mora', 'Mestiza'),
  (17, 17, 'Bowie', 'Teckel'),
  (18, 18, 'Lía', 'Setter'),
  (19, 19, 'Ringo', 'Podenco'),
  (20, 20, 'Trufa', 'Corgi');

UPDATE users SET avatar_url = CASE id
  WHEN 1 THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  WHEN 16 THEN 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  WHEN 18 THEN 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80'
  ELSE avatar_url
END;

UPDATE pets SET image_url = CASE id
  WHEN 1 THEN 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80'
  WHEN 9 THEN 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80'
  WHEN 16 THEN 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&q=80'
  WHEN 18 THEN 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=400&q=80'
  WHEN 20 THEN 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80'
  ELSE image_url
END;

INSERT INTO locations (id, name, type, lat, lng, has_pets) VALUES
  (1, 'Clínica Veterinaria Centro - Oviedo', 'veterinario', 43.362, -5.844, false),
  (2, 'Tienda Mascotas Oviedo - Centro', 'tienda', 43.363, -5.843, false),
  (3, 'Peluquería Canina Asturias - Oviedo', 'peluqueria', 43.361, -5.845, false),
  (4, 'Parque San Francisco', 'parque', 43.360, -5.844, true),
  (5, 'Parque del Oeste', 'parque', 43.365, -5.850, true),
  (6, 'Campo San Francisco', 'parque', 43.358, -5.842, true),
  (7, 'Parque de Invierno - Oviedo', 'parque', 43.3529, -5.8587, true),
  (8, 'Parque Purificación Tomás - Oviedo', 'parque', 43.3746, -5.8672, true),
  (9, 'Monte Naranco - Área recreativa', 'parque', 43.3792, -5.8656, true),
  (10, 'Veterinario 24h La Ería - Oviedo', 'veterinario', 43.3618, -5.8678, false),
  (11, 'Tienda Animalia Colloto', 'tienda', 43.3819, -5.7936, false),
  (12, 'Peluquería Canina La Corredoria', 'peluqueria', 43.3838, -5.8239, false),
  (13, 'Parque Isabel la Católica - Gijón', 'parque', 43.5367, -5.6370, true),
  (14, 'Playa de San Lorenzo - Gijón', 'parque', 43.5415, -5.6547, true),
  (15, 'Parque de Los Pericones - Gijón', 'parque', 43.5260, -5.6588, true),
  (16, 'Clínica Veterinaria El Bibio - Gijón', 'veterinario', 43.5360, -5.6402, false),
  (17, 'Tienda Mascotas Centro - Gijón', 'tienda', 43.5401, -5.6628, false),
  (18, 'Peluquería Canina Cimavilla - Gijón', 'peluqueria', 43.5455, -5.6621, false),
  (19, 'Parque Ferrera - Avilés', 'parque', 43.5565, -5.9254, true),
  (20, 'Ría de Avilés - Paseo pet-friendly', 'parque', 43.5584, -5.9179, true),
  (21, 'Clínica Veterinaria Avilés Centro', 'veterinario', 43.5569, -5.9236, false),
  (22, 'Parque de La Cebera - Lugones', 'parque', 43.4056, -5.8117, true),
  (23, 'Parque Alfonso X - Pola de Siero', 'parque', 43.3929, -5.6633, true),
  (24, 'Clínica Veterinaria Siero', 'veterinario', 43.3917, -5.6606, false),
  (25, 'Parque Dorado - Sama de Langreo', 'parque', 43.3046, -5.6895, true),
  (26, 'Clínica Veterinaria Nalón - Langreo', 'veterinario', 43.3072, -5.6914, false),
  (27, 'Parque Jovellanos - Mieres', 'parque', 43.2509, -5.7762, true),
  (28, 'Veterinaria Caudal - Mieres', 'veterinario', 43.2491, -5.7778, false),
  (29, 'Paseo de San Pedro - Llanes', 'parque', 43.4217, -4.7546, true),
  (30, 'Clínica Veterinaria Llanes', 'veterinario', 43.4202, -4.7542, false),
  (31, 'Paseo de la Grúa - Ribadesella', 'parque', 43.4616, -5.0593, true),
  (32, 'Tienda Mascotas Oriente - Ribadesella', 'tienda', 43.4610, -5.0598, false),
  (33, 'Parque del Frontón - Cangas de Onís', 'parque', 43.3502, -5.1263, true),
  (34, 'Veterinaria Picos - Cangas de Onís', 'veterinario', 43.3510, -5.1284, false),
  (35, 'Parque del Muelle - Luanco', 'parque', 43.6142, -5.7937, true),
  (36, 'Parque de La Barquerina - Villaviciosa', 'parque', 43.4814, -5.4354, true),
  (37, 'Parque de Castropol - Ría del Eo', 'parque', 43.5273, -7.0306, true),
  (38, 'Parque del Retiro - Madrid', 'parque', 40.4153, -3.6844, true),
  (39, 'Madrid Río - Zona pet-friendly', 'parque', 40.4010, -3.7140, true),
  (40, 'Clínica Veterinaria Chamberí - Madrid', 'veterinario', 40.4346, -3.7038, false),
  (41, 'Parc de la Ciutadella - Barcelona', 'parque', 41.3881, 2.1875, true),
  (42, 'Tienda Mascotas Eixample - Barcelona', 'tienda', 41.3972, 2.1602, false),
  (43, 'Jardín del Turia - Valencia', 'parque', 39.4702, -0.3768, true),
  (44, 'Clínica Veterinaria Ruzafa - Valencia', 'veterinario', 39.4629, -0.3733, false),
  (45, 'Parque de María Luisa - Sevilla', 'parque', 37.3748, -5.9878, true),
  (46, 'Parque de Doña Casilda - Bilbao', 'parque', 43.2671, -2.9402, true),
  (47, 'Parque de Santa Margarita - A Coruña', 'parque', 43.3616, -8.4134, true),
  (48, 'Clínica Veterinaria Matogrande - A Coruña', 'veterinario', 43.3388, -8.4096, false);

INSERT INTO locations (id, name, type, lat, lng, has_pets) VALUES
  (49, 'Parque Juan Mata - Oviedo', 'parque', 43.3665, -5.8427, true),
  (50, 'Parque Campillín - Oviedo', 'parque', 43.3582, -5.8472, true),
  (51, 'Plaza de América - Oviedo', 'parque', 43.3619, -5.8581, true),
  (52, 'Parque de Santullano - Oviedo', 'parque', 43.3669, -5.8344, true),
  (53, 'Pista canina La Florida - Oviedo', 'parque', 43.3696, -5.8737, true),
  (54, 'Paseo del Bombé - Oviedo', 'parque', 43.3604, -5.8453, true),
  (55, 'Clínica Veterinaria Buenavista - Oviedo', 'veterinario', 43.3617, -5.8614, false),
  (56, 'Clínica Veterinaria Ciudad Naranco - Oviedo', 'veterinario', 43.3721, -5.8525, false),
  (57, 'Clínica Veterinaria Teatinos - Oviedo', 'veterinario', 43.3742, -5.8268, false),
  (58, 'Clínica Veterinaria Pumarín - Oviedo', 'veterinario', 43.3686, -5.8397, false),
  (59, 'Tienda Mascotas Salesas - Oviedo', 'tienda', 43.3658, -5.8448, false),
  (60, 'Tienda Mascotas Buenavista - Oviedo', 'tienda', 43.3600, -5.8632, false),
  (61, 'Tienda Mascotas La Corredoria - Oviedo', 'tienda', 43.3860, -5.8250, false),
  (62, 'Peluquería Canina Buenavista - Oviedo', 'peluqueria', 43.3607, -5.8611, false),
  (63, 'Peluquería Canina Vallobín - Oviedo', 'peluqueria', 43.3676, -5.8594, false),
  (64, 'Peluquería Canina Teatinos - Oviedo', 'peluqueria', 43.3731, -5.8296, false),
  (65, 'Parque canino Fozaneldi - Oviedo', 'parque', 43.3611, -5.8319, true),
  (66, 'Parque canino Montecerrao - Oviedo', 'parque', 43.3520, -5.8675, true),
  (67, 'Senda Verde Oviedo-Fuso', 'parque', 43.3435, -5.8725, true),
  (68, 'Parque de Vetusta - Oviedo', 'parque', 43.3558, -5.8347, true),
  (69, 'Área canina de La Losa - Oviedo', 'parque', 43.3660, -5.8542, true),
  (70, 'Parque del Truébano - Oviedo', 'parque', 43.3707, -5.8358, true),
  (71, 'Senda del Nora - Lugones', 'parque', 43.4081, -5.8085, true),
  (72, 'Clínica Veterinaria Tenderina - Oviedo', 'veterinario', 43.3643, -5.8276, false),
  (73, 'Tienda Mascotas El Cristo - Oviedo', 'tienda', 43.3534, -5.8638, false),
  (74, 'Peluquería Canina San Lázaro - Oviedo', 'peluqueria', 43.3552, -5.8396, false),
  (75, 'Ruta del Parque de Invierno a Fuso', 'parque', 43.3437, -5.8735, true),
  (76, 'Paseo fluvial de Priañes', 'parque', 43.3757, -5.9508, true),
  (77, 'Clínica Veterinaria Montevil - Gijón', 'veterinario', 43.5236, -5.6747, false),
  (78, 'Parque canino Viesques - Gijón', 'parque', 43.5297, -5.6379, true);

INSERT INTO posts (user_id, pet_id, content, image_url, likes) VALUES
  (1, 1, '¡Día perfecto en el parque!', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80', 24),
  (2, 2, 'Buscamos compañeros de paseo por Oviedo', NULL, 12),
  (3, 3, 'Recomiendo la nueva peluquería en el centro', NULL, 18),
  (4, 4, 'Toby estrena ruta por Parque de Invierno.', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80', 9),
  (5, 5, 'Coco se apunta a planes tranquilos este finde.', NULL, 15),
  (6, 6, 'Nala necesita amigos con energía para correr.', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=80', 21),
  (7, 7, 'Bruno encontró un sitio nuevo por La Florida.', NULL, 7),
  (8, 8, 'Kira recomienda llevar agua a las rutas largas.', NULL, 14),
  (9, 9, 'Thor feliz en Monte Naranco.', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80', 27),
  (10, 10, 'Mia busca paseo corto por el centro.', NULL, 6),
  (11, 11, 'Bimba ya tiene cita de peluquería.', NULL, 8),
  (12, 12, 'Simba observa la vida desde casa, pero saluda.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80', 19),
  (13, 13, 'Leo quiere conocer Parque Purificación Tomás.', NULL, 11),
  (14, 14, 'Duna disfruta de paseos calmados.', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80', 16),
  (15, 15, 'Otto se estrena en Animalia.', NULL, 5),
  (16, 16, 'Mora encontró sombra y agua en La Losa. Muy recomendable.', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80', 13),
  (17, 17, 'Bowie necesita rutas cortas: patas pequeñas, mucha actitud.', NULL, 10),
  (18, 18, 'Lía probó la senda del Nora y volvió feliz.', 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80', 22),
  (19, 19, 'Ringo busca compis para correr por Montecerrao.', NULL, 8),
  (20, 20, 'Trufa aprueba la tienda de El Cristo: premio incluido.', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80', 17);

INSERT INTO park_presences (location_id, user_id, pet_id, last_seen_at) VALUES
  (4, 1, 1, NOW()),
  (4, 2, 2, NOW()),
  (5, 3, 3, NOW()),
  (6, 4, 4, NOW()),
  (6, 5, 5, NOW()),
  (7, 1, 1, NOW()),
  (13, 2, 2, NOW()),
  (19, 3, 3, NOW()),
  (22, 4, 4, NOW()),
  (29, 5, 5, NOW()),
  (38, 1, 1, NOW()),
  (41, 2, 2, NOW()),
  (43, 3, 3, NOW()),
  (69, 16, 16, NOW()),
  (70, 17, 17, NOW()),
  (71, 18, 18, NOW()),
  (75, 19, 19, NOW()),
  (78, 20, 20, NOW());

INSERT INTO comments (post_id, user_id, content) VALUES
  (1, 2, '¡Nos apuntamos al próximo paseo!'),
  (1, 4, 'Luna siempre sale guapísima en el parque.'),
  (2, 1, 'Yo suelo ir por San Francisco por las tardes.'),
  (3, 5, 'Gracias por la recomendación, me viene genial.'),
  (6, 16, 'Nala y Mora podrían correr juntas algún día.'),
  (9, 18, 'Monte Naranco nunca falla.'),
  (16, 1, 'La Losa queda muy bien para una ruta corta.'),
  (18, 20, 'Me la apunto para este fin de semana.'),
  (20, 15, 'Otto también quiere premio.');

INSERT INTO events (id, user_id, location_id, title, description, event_date) VALUES
  (1, 1, 4, 'Paseo tranquilo por San Francisco', 'Quedada para socializar perros pequeños y medianos.', DATE_ADD(NOW(), INTERVAL 2 DAY)),
  (2, 2, 13, 'Tarde perruna en Gijón', 'Paseo por Isabel la Católica y café después.', DATE_ADD(NOW(), INTERVAL 5 DAY)),
  (3, 3, 7, 'Ruta suave por Parque de Invierno', 'Plan para caminar una hora con mascotas sociables.', DATE_ADD(NOW(), INTERVAL 7 DAY)),
  (4, 16, 69, 'Quedada rápida en La Losa', 'Media hora de paseo y socialización cerca del centro.', DATE_ADD(NOW(), INTERVAL 3 DAY)),
  (5, 18, 71, 'Senda del Nora con parada para agua', 'Ruta tranquila para perros acostumbrados a caminar.', DATE_ADD(NOW(), INTERVAL 9 DAY)),
  (6, 20, 78, 'Mañana canina en Viesques', 'Plan relajado para perros pequeños y medianos.', DATE_ADD(NOW(), INTERVAL 11 DAY));

INSERT INTO event_attendees (event_id, user_id) VALUES
  (1, 1),
  (1, 2),
  (1, 4),
  (2, 2),
  (2, 5),
  (3, 1),
  (3, 3),
  (4, 16),
  (4, 1),
  (5, 18),
  (5, 19),
  (6, 20),
  (6, 17);

INSERT INTO location_favorites (user_id, location_id) VALUES
  (1, 4),
  (1, 7),
  (2, 13),
  (3, 19),
  (4, 22),
  (5, 29),
  (16, 69),
  (17, 70),
  (18, 71),
  (19, 75),
  (20, 78);
