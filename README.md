# MeetScribe — AI Meeting Minutes Generator

MeetScribe turns meeting transcripts into structured minutes, including a summary, discussion points, decisions, action items, owners, deadlines, and open questions.

## Features

- Register and sign in with JWT authentication
- Paste a transcript or upload a `.txt`, `.md`, or `.csv` text file
- Generate meeting minutes using Gemini when an API key is configured
- Use a basic local fallback when no AI key is configured
- Review and edit generated notes before saving
- Browse meeting history and search meeting titles/summaries
- Track action items, completion status, owners, deadlines, and priorities
- Export meeting notes to PDF using the browser print dialog
- Responsive light UI

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection
- a Gemini API key for LLM-generated minutes




Open `http://localhost:5173`, create an account, and start a meeting. If you don't configure `GEMINI_API_KEY`, the fallback generator will still create a basic draft from the transcript. It is rule-based and less accurate than an LLM.



## Project structure

```text
MeetScribe/
├── client/
│   ├── src/
│   │   ├── lib/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── server/
│   ├── middleware/auth.js
│   ├── models/Meeting.js
│   ├── models/User.js
│   ├── routes/auth.js
│   ├── routes/meetings.js
│   ├── utils/minutes.js
│   ├── .env.example
│   └── src.js
└── README.md
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/meetings` | List the signed-in user's meetings |
| POST | `/api/meetings/generate` | Generate draft minutes from a transcript |
| POST | `/api/meetings` | Save meeting minutes |
| PATCH | `/api/meetings/:id` | Update minutes or action items |
| DELETE | `/api/meetings/:id` | Delete a meeting |

## Notes

- The fallback generator is intentionally simple and may not correctly interpret complex conversations. Review AI-generated minutes before sharing.
- Audio transcription, calendar integrations, and automatic email delivery are not included in this MVP.
- The PDF export uses the browser print dialog; choose “Save as PDF”.
