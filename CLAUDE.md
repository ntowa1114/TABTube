# CLAUDE.md


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Client** (from `client/`):
```bash
npm run dev    # Start Next.js dev server on port 3000
npm run build  # Production build
npm run lint   # ESLint
```

**Server** (from `server/`):
```bash
nodemon index.js   # Start Express dev server on port 5000
node index.js      # Without hot reload
```

Both client and server must run simultaneously. The client fetches from `http://localhost:5000/api/videos`.

## Architecture

Full-stack YouTube TAB video library (guitar/bass tablature).

**Client** — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4  
- Single main component: `client/app/page.tsx` (all UI logic including search, filter, sort, pagination, registration form)
- All filtering and sorting is done **client-side** after fetching all videos from the API

**Server** — Express 5 (`server/index.js`, single file)  
- `GET /api/videos` — supports `?search=`, `?type=title|artist`, `?instrument=` query params (SQL ILIKE)
- `POST /api/videos` — creates a new video record, returns 201

**Database** — PostgreSQL `tabtube_db` on localhost:5432  
Table `videos`: `id`, `youtube_id`, `title`, `artist_name`, `instrument`, `created_at`  
DB credentials are hardcoded in `server/index.js` (user: postgres, password: 1114) — no `.env` file exists yet.

## Video Title Convention

Videos follow the format: `【TAB譜】曲名/アーティスト名【楽器】`  
Instrument values stored in DB: `"ギター"` or `"ベース"` (when both apply, two separate rows are inserted with the same `youtube_id`).

## Language
- ユーザーへの回答、コードの解説、修正内容の説明はすべて日本語で行うこと。
- 日本語で親しみやすく、かつプロフェッショナルなトーンで回答すること。