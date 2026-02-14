# Ezhuthidu Backend

Node.js backend for the Ezhuthidu Tamil typing platform.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Language**: TypeScript
- **Auth**: JWT + bcryptjs
- **Real-time**: Socket.io
- **PDF**: PDFKit

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and update values.
   ```bash
   cp .env.example .env
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build & Run Production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (Protected)

### Typing
- `POST /api/typing/save` - Save typing result (Protected)
- `GET /api/typing/history` - Get user history (Protected)
- `GET /api/typing/leaderboard` - Get global leaderboard

### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament (Protected)
- `POST /api/tournaments/:id/join` - Join tournament (Protected)

### PDF
- `POST /api/pdf/generate` - Generate PDF from text (Protected)

## Real-time Events
- `new_score`: Emitted when a user saves a score.
- `tournament:update`: Emitted when a user joins a tournament.
