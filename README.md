# Mind Check

A mental wellbeing tracker. Users check in on their mood, energy and stress, see how they are trending over time, read short articles matched to how they feel, and get support options when they need them. When recent check-ins show a low mood, an AI companion offers a supportive conversation.

Built as my final project in full-stack and AI software development training.

## Features

- **Accounts:** sign up and log in with email and password. Passwords are hashed with bcrypt; sessions use JSON Web Tokens.
- **Daily check-in:** mood (great, good, okay, low), energy and stress on a 1 to 10 scale, and optional notes.
- **Results and progress:** a score per check-in, feedback and suggestions, and a mood trend across past check-ins.
- **Articles:** a small library of wellbeing articles, suggested according to the latest check-in.
- **Support:** a support alert and a page of support options for when things are hard.
- **AI support chat:** appears on the home screen when the latest check-in is low (low mood, stress of 7 or more, or a low overall score). It is prompted to be warm and brief, never to diagnose or give medical advice, and to point to emergency services or crisis lines if someone mentions self-harm.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | bcrypt, JSON Web Tokens |
| AI | OpenRouter (OpenAI-compatible API) |
| Hosting | Render (API and frontend), UptimeRobot (keep-alive) |

## Project structure

```
client/                React app
  src/pages/           Splash, Login, Home, CheckIn, Results, Progress, Articles, Support
  src/components/      ChatbotPanel, BottomNav, ArticleCard, FindSupport
  src/lib/api.js       fetch wrapper that adds the auth token
server/                Express API
  src/routes/          auth, checkins, articles, resources, chat
  src/models/          User, CheckIn (Mongoose)
  src/services/        chatbotService.js: prompt and OpenRouter call
  src/middleware/      requireAuth: verifies the JWT
```

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | no | API and database status (used by UptimeRobot) |
| POST | `/api/auth/register` | no | Create an account |
| POST | `/api/auth/login` | no | Log in, returns a token |
| GET | `/api/auth/me` | yes | Current user |
| GET / POST | `/api/checkins` | yes | List or create check-ins |
| GET | `/api/articles` | no | Article library |
| GET | `/api/resources/support` | yes | Support options |
| GET | `/api/chat/status` | yes | Whether the support chat should appear |
| POST | `/api/chat` | yes | Send a message to the support chat |

## Running locally

You need Node.js 20 or newer and a MongoDB connection string (a free MongoDB Atlas cluster works).

```bash
# 1. API
cd server
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET and, for the chat, OPENAI_API_KEY
npm install
npm run dev               # http://localhost:5000

# 2. Frontend, in a second terminal
cd client
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

### Environment variables

**server/.env**

| Variable | Purpose |
|---|---|
| `PORT` | API port, default 5000 |
| `MONGO_URI` | MongoDB connection string, including the database name |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend URL(s) allowed by CORS, comma-separated |
| `ENABLE_CHATBOT` | `true` to switch the AI chat on |
| `OPENAI_API_KEY` | OpenRouter API key (the chat calls OpenRouter's OpenAI-compatible endpoint) |

**client/.env**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base URL, ending in `/api` |

## Deployment on Render

**API (web service):** root directory `server`, build command `npm install`, start command `npm start`, with the server variables above.

**Frontend (static site):** root directory `client`, build command `npm install && npm run build`, publish directory `dist`, with `VITE_API_BASE_URL` set to the API URL plus `/api`. Vite bakes this value in at build time, so redeploy the frontend after changing it. Add a rewrite rule from `/*` to `/index.html` so React Router routes work on refresh.

**Keep-alive:** an UptimeRobot monitor calls `/api/health` every 5 minutes. That keeps the free Render instance awake, and because the endpoint pings MongoDB, it also keeps a free Atlas cluster from being paused for inactivity.

## Disclaimer

Mind Check is a learning project, not a medical device. It does not diagnose or treat any condition. Anyone in crisis should contact local emergency services or a crisis line.
