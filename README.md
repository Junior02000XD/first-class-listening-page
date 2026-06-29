# First Class Listening — Web

Frontend de la plataforma **First Class Listening**: reproductor web de cursos de
audio y video. Los usuarios acceden con un código de un solo uso o registro propio,
y el contenido se transmite desde Cloudflare R2 a través del Worker de la plataforma.

## Stack

- React 19 + Vite (JSX)
- React Router — navegación SPA
- Axios — cliente HTTP hacia la API

## Vistas principales

- Landing / página de presentación
- Login, registro y recuperación de contraseña
- Catálogo de cursos disponibles
- Reproductor de audio/video
- Perfil de usuario
- Panel de administración

## Cómo correr

Requiere Node.js 20+ y acceso a la
[first-class-listening-api](https://github.com/Junior02000XD/first-class-listening-api).

```bash
git clone https://github.com/Junior02000XD/first-class-listening-page
cd first-class-listening-page
npm install
npm run dev
```
