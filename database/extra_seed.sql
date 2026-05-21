USE animalia;

INSERT IGNORE INTO users (id, name, email, password, city, bio, theme_color) VALUES
  (16, 'Lucía V.', 'lucia@example.com', '123456', 'Oviedo', 'Paseos cortos entre semana y rutas largas los domingos.', '#0f766e'),
  (17, 'Mario Q.', 'mario@example.com', '123456', 'Oviedo', 'Bowie saluda a todo el mundo antes que yo.', '#2563eb'),
  (18, 'Noelia P.', 'noelia@example.com', '123456', 'Lugones', 'Buscando rutas tranquilas con agua cerca.', '#9333ea'),
  (19, 'Adrián S.', 'adrian@example.com', '123456', 'Oviedo', 'Ringo necesita gastar energía y conocer nuevos parques.', '#ea580c'),
  (20, 'Vera M.', 'vera@example.com', '123456', 'Gijón', 'Trufa opina que todos los planes deberían acabar con premio.', '#be123c');

UPDATE users SET
  name = CASE id
    WHEN 16 THEN 'Lucía V.'
    WHEN 17 THEN 'Mario Q.'
    WHEN 18 THEN 'Noelia P.'
    WHEN 19 THEN 'Adrián S.'
    WHEN 20 THEN 'Vera M.'
    ELSE name
  END,
  city = CASE id
    WHEN 16 THEN 'Oviedo'
    WHEN 17 THEN 'Oviedo'
    WHEN 18 THEN 'Lugones'
    WHEN 19 THEN 'Oviedo'
    WHEN 20 THEN 'Gijón'
    ELSE city
  END,
  bio = CASE id
    WHEN 16 THEN 'Paseos cortos entre semana y rutas largas los domingos.'
    WHEN 17 THEN 'Bowie saluda a todo el mundo antes que yo.'
    WHEN 18 THEN 'Buscando rutas tranquilas con agua cerca.'
    WHEN 19 THEN 'Ringo necesita gastar energía y conocer nuevos parques.'
    WHEN 20 THEN 'Trufa opina que todos los planes deberían acabar con premio.'
    ELSE bio
  END
WHERE id IN (16, 17, 18, 19, 20);

INSERT IGNORE INTO pets (id, user_id, name, breed) VALUES
  (16, 16, 'Mora', 'Mestiza'),
  (17, 17, 'Bowie', 'Teckel'),
  (18, 18, 'Lía', 'Setter'),
  (19, 19, 'Ringo', 'Podenco'),
  (20, 20, 'Trufa', 'Corgi');

UPDATE pets SET
  name = CASE id
    WHEN 16 THEN 'Mora'
    WHEN 17 THEN 'Bowie'
    WHEN 18 THEN 'Lía'
    WHEN 19 THEN 'Ringo'
    WHEN 20 THEN 'Trufa'
    ELSE name
  END,
  breed = CASE id
    WHEN 16 THEN 'Mestiza'
    WHEN 17 THEN 'Teckel'
    WHEN 18 THEN 'Setter'
    WHEN 19 THEN 'Podenco'
    WHEN 20 THEN 'Corgi'
    ELSE breed
  END
WHERE id IN (16, 17, 18, 19, 20);

UPDATE users SET avatar_url = CASE id
  WHEN 1 THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  WHEN 3 THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80'
  WHEN 4 THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  WHEN 5 THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  WHEN 7 THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  WHEN 8 THEN 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80'
  WHEN 9 THEN 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80'
  WHEN 10 THEN 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80'
  WHEN 11 THEN 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=400&q=80'
  WHEN 12 THEN 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=400&q=80'
  WHEN 13 THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  WHEN 14 THEN 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&q=80'
  WHEN 15 THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  WHEN 16 THEN 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  WHEN 17 THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  WHEN 18 THEN 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80'
  WHEN 19 THEN 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80'
  WHEN 20 THEN 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  ELSE avatar_url
END;

UPDATE pets SET image_url = CASE id
  WHEN 1 THEN 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'
  WHEN 2 THEN 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=400&q=80'
  WHEN 3 THEN 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=400&q=80'
  WHEN 4 THEN 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'
  WHEN 5 THEN 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80'
  WHEN 6 THEN 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80'
  WHEN 7 THEN 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=400&q=80'
  WHEN 8 THEN 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'
  WHEN 9 THEN 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80'
  WHEN 10 THEN 'https://images.unsplash.com/photo-1583511655826-05700442b31b?auto=format&fit=crop&w=400&q=80'
  WHEN 11 THEN 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?auto=format&fit=crop&w=400&q=80'
  WHEN 12 THEN 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
  WHEN 13 THEN 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=400&q=80'
  WHEN 14 THEN 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80'
  WHEN 15 THEN 'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=400&q=80'
  WHEN 16 THEN 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&q=80'
  WHEN 17 THEN 'https://images.unsplash.com/photo-1553882809-a4f57e59501d?auto=format&fit=crop&w=400&q=80'
  WHEN 18 THEN 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=400&q=80'
  WHEN 19 THEN 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=400&q=80'
  WHEN 20 THEN 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80'
  ELSE image_url
END;

INSERT IGNORE INTO locations (id, name, type, lat, lng, has_pets) VALUES
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

INSERT IGNORE INTO posts (id, user_id, pet_id, content, image_url, likes) VALUES
  (16, 16, 16, 'Mora encontró sombra y agua en La Losa. Muy recomendable.', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80', 13),
  (17, 17, 17, 'Bowie necesita rutas cortas: patas pequeñas, mucha actitud.', NULL, 10),
  (18, 18, 18, 'Lía probó la senda del Nora y volvió feliz.', 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80', 22),
  (19, 19, 19, 'Ringo busca compis para correr por Montecerrao.', NULL, 8),
  (20, 20, 20, 'Trufa aprueba la tienda de El Cristo: premio incluido.', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80', 17);

UPDATE posts SET content = CASE id
  WHEN 16 THEN 'Mora encontró sombra y agua en La Losa. Muy recomendable.'
  WHEN 17 THEN 'Bowie necesita rutas cortas: patas pequeñas, mucha actitud.'
  WHEN 18 THEN 'Lía probó la senda del Nora y volvió feliz.'
  WHEN 19 THEN 'Ringo busca compis para correr por Montecerrao.'
  WHEN 20 THEN 'Trufa aprueba la tienda de El Cristo: premio incluido.'
  ELSE content
END
WHERE id IN (16, 17, 18, 19, 20);

UPDATE locations SET address = CASE id
  WHEN 1 THEN 'Calle Marqués de Pidal, 9, 33004 Oviedo'
  WHEN 2 THEN 'Calle Uría, 20, 33003 Oviedo'
  WHEN 3 THEN 'Calle Rosal, 42, 33009 Oviedo'
  WHEN 4 THEN 'Calle Uría, s/n, 33003 Oviedo'
  WHEN 5 THEN 'Avenida de Galicia, s/n, 33005 Oviedo'
  WHEN 6 THEN 'Campo San Francisco, 33003 Oviedo'
  WHEN 7 THEN 'Calle Pedro Masaveu, s/n, 33007 Oviedo'
  WHEN 8 THEN 'Avenida de los Monumentos, s/n, 33012 Oviedo'
  WHEN 9 THEN 'Área recreativa del Naranco, 33012 Oviedo'
  WHEN 13 THEN 'Avenida de Castilla, s/n, 33203 Gijón'
  WHEN 19 THEN 'Calle Galiana, s/n, 33402 Avilés'
  WHEN 22 THEN 'Parque de La Cebera, 33420 Lugones'
  WHEN 29 THEN 'Paseo de San Pedro, 33500 Llanes'
  WHEN 38 THEN 'Plaza de la Independencia, 7, 28001 Madrid'
  WHEN 41 THEN 'Passeig de Picasso, 21, 08003 Barcelona'
  WHEN 43 THEN 'Jardín del Turia, 46010 Valencia'
  WHEN 69 THEN 'Calle de La Losa, s/n, 33012 Oviedo'
  WHEN 70 THEN 'Calle Río Caudal, s/n, 33010 Oviedo'
  WHEN 71 THEN 'Senda del Nora, 33420 Lugones'
  WHEN 75 THEN 'Acceso Senda Verde Oviedo-Fuso, 33007 Oviedo'
  WHEN 78 THEN 'Parque Fluvial de Viesques, 33204 Gijón'
  ELSE address
END
WHERE id IN (1,2,3,4,5,6,7,8,9,13,19,22,29,38,41,43,69,70,71,75,78);

UPDATE locations SET name = CASE id
  WHEN 69 THEN 'Área canina de La Losa - Oviedo'
  WHEN 70 THEN 'Parque del Truébano - Oviedo'
  WHEN 72 THEN 'Clínica Veterinaria Tenderina - Oviedo'
  WHEN 74 THEN 'Peluquería Canina San Lázaro - Oviedo'
  WHEN 76 THEN 'Paseo fluvial de Priañes'
  WHEN 77 THEN 'Clínica Veterinaria Montevil - Gijón'
  WHEN 78 THEN 'Parque canino Viesques - Gijón'
  ELSE name
END
WHERE id IN (69, 70, 72, 74, 76, 77, 78);

INSERT IGNORE INTO comments (id, post_id, user_id, content) VALUES
  (5, 6, 16, 'Nala y Mora podrían correr juntas algún día.'),
  (6, 9, 18, 'Monte Naranco nunca falla.'),
  (7, 16, 1, 'La Losa queda muy bien para una ruta corta.'),
  (8, 18, 20, 'Me la apunto para este fin de semana.'),
  (9, 20, 15, 'Otto también quiere premio.');

INSERT IGNORE INTO events (id, user_id, location_id, title, description, event_date) VALUES
  (4, 16, 69, 'Quedada rápida en La Losa', 'Media hora de paseo y socialización cerca del centro.', DATE_ADD(NOW(), INTERVAL 3 DAY)),
  (5, 18, 71, 'Senda del Nora con parada para agua', 'Ruta tranquila para perros acostumbrados a caminar.', DATE_ADD(NOW(), INTERVAL 9 DAY)),
  (6, 20, 78, 'Mañana canina en Viesques', 'Plan relajado para perros pequeños y medianos.', DATE_ADD(NOW(), INTERVAL 11 DAY));

UPDATE events SET
  title = CASE id
    WHEN 4 THEN 'Quedada rápida en La Losa'
    WHEN 6 THEN 'Mañana canina en Viesques'
    ELSE title
  END,
  description = CASE id
    WHEN 4 THEN 'Media hora de paseo y socialización cerca del centro.'
    WHEN 6 THEN 'Plan relajado para perros pequeños y medianos.'
    ELSE description
  END
WHERE id IN (4, 6);

INSERT IGNORE INTO event_attendees (event_id, user_id) VALUES
  (4, 16),
  (4, 1),
  (5, 18),
  (5, 19),
  (6, 20),
  (6, 17);

INSERT IGNORE INTO park_presences (location_id, user_id, pet_id, last_seen_at) VALUES
  (69, 16, 16, NOW()),
  (70, 17, 17, NOW()),
  (71, 18, 18, NOW()),
  (75, 19, 19, NOW()),
  (78, 20, 20, NOW());

INSERT IGNORE INTO location_favorites (user_id, location_id) VALUES
  (16, 69),
  (17, 70),
  (18, 71),
  (19, 75),
  (20, 78);
