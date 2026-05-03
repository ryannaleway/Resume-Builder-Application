# ResumeForge Builder

[GitHub Repository](https://github.com/ryannaleway/Resume-Builder-Application.git)

ResumeForge Builder is a local-first resume application built for CSC3100. It helps users store reusable career content in SQLite, request AI wording suggestions with Google Gemini, and assemble print-friendly resumes from selected jobs, education, skills, certifications, and awards.

## Core Features

- Single-page application built with one [public/index.html](C:/Users/Ryan/Desktop/ResumeBuilder/public/index.html) shell and route-based DOM sections
- Account sign up and sign in with first name, last name, email, optional phone, and password
- User-scoped jobs, responsibilities, education, skills, certifications, awards, settings, and saved resume selections
- Resume builder with contact toggle, target role, and professional summary
- Resume preview and browser PDF export
- Google Gemini suggestion workflow for job summaries, responsibilities, skills, and certifications
- Local vendor assets for Bootstrap, SweetAlert2, and jsPDF with no frontend CDNs
- Library attribution modal available inside the interface

## Tech Stack

- Frontend: HTML, CSS, Bootstrap 5, JavaScript
- Backend: Node.js with Express
- Database: SQLite with `sqlite3`
- AI Integration: Google Gemini API
- Configuration: `dotenv`

## Project Structure

```text
/public
  /assets
  /css
  /js
/routes
/controllers
/models
/db
server.js
package.json
.env.example
.gitignore
README.md
AI_USAGE.md
ACCESSIBILITY.md
SUBMISSION_NOTES.md
Agents.md
Example-Resume.pdf
```

## Local Setup

1. Install Node.js 18 or newer.
2. Install dependencies.

```bash
npm install
```

3. Create a `.env` file based on `.env.example`.
4. Fill in the environment values shown below.
5. Start the application.

```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000).
7. Create an account on `/auth` or sign in with an existing account.

## Example `.env`

```env
PORT=3000
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
GEMINI_API_KEY=
APP_SECRET=replace-with-a-long-random-string
```

## Sample Data

The first database initialization seeds sample jobs, responsibilities, skills, certifications, awards, and starter settings so the application can be explored quickly during local testing.

## API Overview

All `GET` routes return JSON arrays.

### Jobs

- `GET /api/jobs`
- `GET /api/jobs?jobId=1&userId=1`
- `POST /api/jobs`
- `PUT /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId?userId=1`

### Responsibilities

- `GET /api/responsibilities`
- `GET /api/responsibilities?jobId=1&userId=1`
- `POST /api/responsibilities`
- `PUT /api/responsibilities/:responsibilityId`
- `DELETE /api/responsibilities/:responsibilityId?userId=1`

### Education

- `GET /api/education`
- `GET /api/education?educationEntryId=1&userId=1`
- `POST /api/education`
- `PUT /api/education/:educationEntryId`
- `DELETE /api/education/:educationEntryId?userId=1`

### Skill Categories

- `GET /api/skill-categories`
- `GET /api/skill-categories?skillCategoryId=1&userId=1`
- `POST /api/skill-categories`
- `PUT /api/skill-categories/:skillCategoryId`
- `DELETE /api/skill-categories/:skillCategoryId?userId=1`

### Skills

- `GET /api/skills`
- `GET /api/skills?skillId=1&userId=1`
- `GET /api/skills?skillCategoryId=1&userId=1`
- `POST /api/skills`
- `PUT /api/skills/:skillId`
- `DELETE /api/skills/:skillId?userId=1`

### Certifications

- `GET /api/certifications`
- `GET /api/certifications?certificationId=1&userId=1`
- `POST /api/certifications`
- `PUT /api/certifications/:certificationId`
- `DELETE /api/certifications/:certificationId?userId=1`

### Awards

- `GET /api/awards`
- `GET /api/awards?awardId=1&userId=1`
- `POST /api/awards`
- `PUT /api/awards/:awardId`
- `DELETE /api/awards/:awardId?userId=1`

### Settings

- `GET /api/settings`
- `GET /api/settings?settingKey=geminiApiKey&userId=1`
- `PUT /api/settings`

### Resume Generation

- `GET /api/resumes`
- `GET /api/resumes?userId=1&jobIds=1,2&educationEntryIds=1&responsibilityIds=3,4&skillIds=2,5&certificationIds=1&awardIds=1`

### AI Suggestions

- `POST /api/ai/suggestions`

### Authentication

- `GET /api/auth/users?userId=1`
- `GET /api/auth/users?phone=123-456-7890`
- `POST /api/auth/signup`
- `POST /api/auth/login`

## Example API Usage

```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "Morgan",
  "lastName": "Lee",
  "email": "morgan.lee@example.com",
  "phone": "123-456-7890",
  "password": "SecurePass123"
}
```

```http
POST /api/ai/suggestions
Content-Type: application/json

{
  "userId": 1,
  "sourceType": "job responsibility",
  "sourceText": "Worked on reports and helped the team.",
  "apiKey": "optional-one-time-key"
}
```

## Environment Variable Notes

- `PORT` controls the Express port.
- `GEMINI_API_URL` allows swapping Gemini model endpoints.
- `GEMINI_API_KEY` is an optional development fallback and should not be relied on for production deployment.
- `APP_SECRET` encrypts stored Gemini API key values inside SQLite.

## Printing and PDF

- The resume builder route assembles the live preview from selected content.
- The preview route provides a print-friendly version of the current resume.
- `@media print` hides non-resume UI.
- Browser PDF export is handled with local `jsPDF`.
- The resume header is populated automatically from the signed-in account plus the selected contact mode.

## Assignment Support Files

- [AI_USAGE.md](C:/Users/Ryan/Desktop/ResumeBuilder/AI_USAGE.md) documents generative AI usage, rules, and MCP-related notes.
- [ACCESSIBILITY.md](C:/Users/Ryan/Desktop/ResumeBuilder/ACCESSIBILITY.md) documents accessibility work and the Lighthouse verification step.
- [SUBMISSION_NOTES.md](C:/Users/Ryan/Desktop/ResumeBuilder/SUBMISSION_NOTES.md) collects submission-specific notes, sharing permission, and author image guidance.
- [Agents.md](C:/Users/Ryan/Desktop/ResumeBuilder/Agents.md) contains the rules file used during development.

## Notes

- External libraries are loaded from the application directory, not a CDN.
- All API writes use validated inputs and prepared SQLite statements.
- The frontend uses SPA navigation while the backend remains a RESTful Express API.
