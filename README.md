# Animalia

Animalia es un prototipo de red social para dueños de mascotas. Incluye frontend React con Vite, backend Node.js/Express, base de datos MySQL, mapa interactivo con Leaflet/OpenStreetMap y rutas con OSRM público.

## Requisitos

- Docker
- Docker Compose

No hace falta instalar Node.js ni MySQL en local si se usa Docker.

## Arrancar el proyecto

Desde la raíz del proyecto:

```bash
docker compose up --build
```

La primera vez puede tardar un poco más porque Docker descarga imágenes, instala dependencias y MySQL crea la base de datos con datos iniciales.

## URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/api/health
- phpMyAdmin: http://localhost:8080

## Credenciales de prueba

Puedes iniciar sesión con cualquiera de estos usuarios:

```text
maria@example.com / 123456
carlos@example.com / 123456
ana@example.com / 123456
luis@example.com / 123456
elena@example.com / 123456
sofia@example.com / 123456
diego@example.com / 123456
paula@example.com / 123456
ivan@example.com / 123456
nora@example.com / 123456
hugo@example.com / 123456
clara@example.com / 123456
mateo@example.com / 123456
irene@example.com / 123456
raul@example.com / 123456
```

## MySQL / phpMyAdmin

```text
Host: mysql
Base de datos: animalia
Usuario: animalia
Contraseña: animalia
Root password: root
```

## Reiniciar la base de datos

Si quieres borrar todos los datos y volver a cargar `database/init.sql`:

```bash
docker compose down -v
docker compose up --build
```

## Servicios Docker

- `frontend`: React + Vite en el puerto `5173`.
- `backend`: Express API en el puerto `3000`.
- `mysql`: MySQL 8.0 en el puerto `3306`.
- `phpmyadmin`: panel web para MySQL en el puerto `8080`.

## Funciones incluidas

- Registro e inicio de sesión sencillo.
- Feed con publicaciones, likes y comentarios.
- Perfil con mascota, métricas y lugares guardados.
- Mapa interactivo con ubicaciones de Asturias y España.
- Filtros por tipo de lugar.
- Alta de nuevas ubicaciones desde el panel del mapa.
- Geolocalización del usuario desde el navegador.
- Cálculo de rutas con OSRM público.
- Registro de presencia de mascotas en parques.
- Quedadas/eventos y opción para apuntarse.

## Notas

- La autenticación es solo para prototipo: no usa JWT.
- Las contraseñas se guardan en texto plano para simplificar el proyecto. En producción debería usarse `bcrypt`.
- No se usa ninguna API de pago. El mapa usa OpenStreetMap/Leaflet y las rutas usan OSRM público.
