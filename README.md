# Mind Check Full-Stack App

A full working MVP of the Mind Check project with:
- React + Vite frontend
- Express backend
- JWT auth
- JSON file persistence for demo use
- Check-ins, progress insights, article recommendations, and support options

## Project structure

- `client` = frontend
- `server` = backend API

## 1. Run the backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Edit `.env` and set a long `JWT_SECRET`.

## 2. Run the frontend

```bash
cd client
npm install
npm run dev
```

Create a `.env` file inside `client`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Render deployment

### Backend service
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `JWT_SECRET`
  - `CLIENT_URL` = your frontend URL

### Frontend static site
- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL` = your backend URL + `/api`

## Notes

This version uses a local JSON file as storage so you can deliver a complete working project fast. For a stronger next phase, you can replace it with MongoDB.
