import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import pool, { waitForDatabase } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/locations", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, type, address, lat, lng, has_pets FROM locations ORDER BY id"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo ubicaciones:", error);
    res.status(500).json({ error: "No se pudieron obtener las ubicaciones" });
  }
});

app.post("/api/locations", async (req, res) => {
  const { name, type, address, lat, lng, has_pets } = req.body;

  if (!name?.trim() || !type || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "name, type, lat y lng son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO locations (name, type, address, lat, lng, has_pets) VALUES (?, ?, ?, ?, ?, ?)",
      [name.trim(), type, address?.trim() || "", Number(lat), Number(lng), Boolean(has_pets)]
    );
    res.status(201).json({ id: result.insertId, name, type, address: address?.trim() || "", lat, lng, has_pets: Boolean(has_pets) });
  } catch (error) {
    console.error("Error creando ubicación:", error);
    res.status(500).json({ error: "No se pudo crear la ubicación" });
  }
});

app.get("/api/posts", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        posts.id,
        posts.user_id,
        posts.content,
        posts.image_url,
        posts.likes,
        posts.created_at,
        users.name AS user_name,
        users.avatar_url AS user_avatar_url,
        pets.name AS pet_name,
        pets.image_url AS pet_image_url,
        COUNT(comments.id) AS comment_count
      FROM posts
      JOIN users ON users.id = posts.user_id
      LEFT JOIN pets ON pets.id = posts.pet_id
      LEFT JOIN comments ON comments.post_id = posts.id
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo posts:", error);
    res.status(500).json({ error: "No se pudieron obtener los posts" });
  }
});

app.get("/api/posts/:id/comments", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT comments.id, comments.content, comments.created_at, users.name AS user_name, users.avatar_url AS user_avatar_url
      FROM comments
      JOIN users ON users.id = comments.user_id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
      `,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    res.status(500).json({ error: "No se pudieron obtener los comentarios" });
  }
});

app.post("/api/posts/:id/comments", async (req, res) => {
  const { user_id, content } = req.body;

  if (!user_id || !content?.trim()) {
    return res.status(400).json({ error: "user_id y content son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [req.params.id, user_id, content.trim()]
    );
    res.status(201).json({ id: result.insertId, post_id: Number(req.params.id), user_id, content });
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "No se pudo crear el comentario" });
  }
});

app.get("/api/events", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        events.id,
        events.title,
        events.description,
        events.event_date,
        events.created_at,
        users.name AS organizer_name,
        locations.name AS location_name,
        locations.address AS location_address,
        locations.lat,
        locations.lng,
        COUNT(event_attendees.id) AS attendee_count
      FROM events
      JOIN users ON users.id = events.user_id
      JOIN locations ON locations.id = events.location_id
      LEFT JOIN event_attendees ON event_attendees.event_id = events.id
      GROUP BY events.id
      ORDER BY events.event_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    res.status(500).json({ error: "No se pudieron obtener los eventos" });
  }
});

app.post("/api/events", async (req, res) => {
  const { user_id, location_id, title, description, event_date } = req.body;

  if (!user_id || !location_id || !title?.trim() || !event_date) {
    return res.status(400).json({ error: "user_id, location_id, title y event_date son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO events (user_id, location_id, title, description, event_date) VALUES (?, ?, ?, ?, ?)",
      [user_id, location_id, title.trim(), description?.trim() || "", event_date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Error creando evento:", error);
    res.status(500).json({ error: "No se pudo crear el evento" });
  }
});

app.post("/api/events/:id/join", async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id es obligatorio" });
  }

  try {
    await pool.query(
      "INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = created_at",
      [req.params.id, user_id]
    );
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error apuntándose al evento:", error);
    res.status(500).json({ error: "No se pudo apuntar al evento" });
  }
});

app.get("/api/users/:id/profile", async (req, res) => {
  try {
    const [[profile]] = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.email,
        users.city,
        users.bio,
        users.theme_color,
        users.avatar_url,
        pets.id AS pet_id,
        pets.name AS pet_name,
        pets.breed,
        pets.image_url AS pet_image_url,
        (SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id) AS post_count,
        (SELECT COUNT(*) FROM comments WHERE comments.user_id = users.id) AS comment_count,
        (SELECT COUNT(*) FROM location_favorites WHERE location_favorites.user_id = users.id) AS favorite_count,
        (SELECT COUNT(*) FROM event_attendees WHERE event_attendees.user_id = users.id) AS event_count
      FROM users
      LEFT JOIN pets ON pets.user_id = users.id
      WHERE users.id = ?
      LIMIT 1
      `,
      [req.params.id]
    );

    if (!profile) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "No se pudo obtener el perfil" });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT users.id, users.name, users.city, users.bio, users.theme_color, users.avatar_url,
        pets.name AS pet_name, pets.breed, pets.image_url AS pet_image_url,
        (SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id) AS post_count
      FROM users
      LEFT JOIN pets ON pets.user_id = users.id
      ORDER BY users.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "No se pudieron obtener los usuarios" });
  }
});

app.put("/api/users/:id/profile", async (req, res) => {
  const { name, city, bio, theme_color, avatar_url, pet_image_url } = req.body;

  try {
    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), city = ?, bio = ?, theme_color = ?, avatar_url = ? WHERE id = ?",
      [name || null, city || "", bio || "", theme_color || "#0f766e", avatar_url || null, req.params.id]
    );
    await pool.query(
      "UPDATE pets SET image_url = ? WHERE user_id = ? ORDER BY id LIMIT 1",
      [pet_image_url || null, req.params.id]
    );
    const [[user]] = await pool.query(
      `
      SELECT users.id, users.name, users.email, users.city, users.bio, users.theme_color, users.avatar_url,
        pets.id AS pet_id, pets.name AS pet_name, pets.breed, pets.image_url AS pet_image_url
      FROM users
      LEFT JOIN pets ON pets.user_id = users.id
      WHERE users.id = ?
      LIMIT 1
      `,
      [req.params.id]
    );
    res.json(user);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "No se pudo actualizar el perfil" });
  }
});

app.get("/api/users/:id/favorites", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT locations.*
      FROM location_favorites
      JOIN locations ON locations.id = location_favorites.location_id
      WHERE location_favorites.user_id = ?
      ORDER BY location_favorites.created_at DESC
      `,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    res.status(500).json({ error: "No se pudieron obtener los favoritos" });
  }
});

app.post("/api/favorites", async (req, res) => {
  const { user_id, location_id } = req.body;

  if (!user_id || !location_id) {
    return res.status(400).json({ error: "user_id y location_id son obligatorios" });
  }

  try {
    await pool.query(
      "INSERT INTO location_favorites (user_id, location_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = created_at",
      [user_id, location_id]
    );
    res.status(201).json({ status: "ok" });
  } catch (error) {
    console.error("Error guardando favorito:", error);
    res.status(500).json({ error: "No se pudo guardar el lugar" });
  }
});

app.post("/api/posts", async (req, res) => {
  const { user_id, content, image_url } = req.body;

  if (!user_id || !content?.trim()) {
    return res.status(400).json({ error: "user_id y content son obligatorios" });
  }

  try {
    const [[pet]] = await pool.query(
      "SELECT id FROM pets WHERE user_id = ? ORDER BY id LIMIT 1",
      [user_id]
    );
    const [result] = await pool.query(
      "INSERT INTO posts (user_id, pet_id, content, image_url) VALUES (?, ?, ?, ?)",
      [user_id, pet?.id || null, content.trim(), image_url || null]
    );
    res.status(201).json({ id: result.insertId, user_id, pet_id: pet?.id || null, content, image_url });
  } catch (error) {
    console.error("Error creando post:", error);
    res.status(500).json({ error: "No se pudo crear el post" });
  }
});

app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error incrementando likes:", error);
    res.status(500).json({ error: "No se pudo actualizar el like" });
  }
});

app.get("/api/parks/:id/presences", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        park_presences.id,
        park_presences.location_id,
        park_presences.last_seen_at,
        users.name AS owner_name,
        users.avatar_url AS owner_avatar_url,
        pets.name AS pet_name,
        pets.breed,
        pets.image_url AS pet_image_url
      FROM park_presences
      JOIN users ON users.id = park_presences.user_id
      JOIN pets ON pets.id = park_presences.pet_id
      WHERE park_presences.location_id = ?
      ORDER BY park_presences.last_seen_at DESC
      `,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo presencias:", error);
    res.status(500).json({ error: "No se pudieron obtener las presencias" });
  }
});

app.post("/api/presences", async (req, res) => {
  const { user_id, pet_id, location_id } = req.body;

  if (!user_id || !pet_id || !location_id) {
    return res.status(400).json({ error: "user_id, pet_id y location_id son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO park_presences (location_id, user_id, pet_id, last_seen_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE last_seen_at = NOW()
      `,
      [location_id, user_id, pet_id]
    );
    res.status(201).json({ id: result.insertId || null, location_id, user_id, pet_id });
  } catch (error) {
    console.error("Error registrando presencia:", error);
    res.status(500).json({ error: "No se pudo registrar la presencia" });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password, pet_name, breed, city, bio, theme_color, avatar_url, pet_image_url } = req.body;

  if (!name || !email || !password || !pet_name || !breed) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    // TODO: En producción, guardar contraseñas con bcrypt en lugar de texto plano.
    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password, city, bio, theme_color, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, password, city || "Oviedo", bio || "", theme_color || "#0f766e", avatar_url || null]
    );
    const [petResult] = await connection.query(
      "INSERT INTO pets (user_id, name, breed, image_url) VALUES (?, ?, ?, ?)",
      [userResult.insertId, pet_name, breed, pet_image_url || null]
    );
    await connection.commit();

    res.status(201).json({
      id: userResult.insertId,
      name,
      email,
      city: city || "Oviedo",
      bio: bio || "",
      theme_color: theme_color || "#0f766e",
      avatar_url: avatar_url || null,
      pet_id: petResult.insertId,
      pet_name,
      breed,
      pet_image_url: pet_image_url || null,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error registrando usuario:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ya existe un usuario con ese email" });
    }

    res.status(500).json({ error: "No se pudo crear el usuario" });
  } finally {
    connection.release();
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  try {
    const [[user]] = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.email,
        users.city,
        users.bio,
        users.theme_color,
        users.avatar_url,
        pets.id AS pet_id,
        pets.name AS pet_name,
        pets.breed,
        pets.image_url AS pet_image_url
      FROM users
      LEFT JOIN pets ON pets.user_id = users.id
      WHERE users.email = ? AND users.password = ?
      ORDER BY pets.id
      LIMIT 1
      `,
      [email, password]
    );

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

async function addColumnIfMissing(tableName, columnName, definition) {
  const [[column]] = await pool.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  if (!column) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureSchema() {
  await addColumnIfMissing("locations", "address", "VARCHAR(240) DEFAULT '' AFTER type");
  await addColumnIfMissing("users", "avatar_url", "MEDIUMTEXT NULL AFTER theme_color");
  await addColumnIfMissing("pets", "image_url", "MEDIUMTEXT NULL AFTER breed");
  await pool.query("ALTER TABLE posts MODIFY image_url MEDIUMTEXT NULL");
}

waitForDatabase()
  .then(ensureSchema)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Animalia API escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo conectar con MySQL:", error);
    process.exit(1);
  });
