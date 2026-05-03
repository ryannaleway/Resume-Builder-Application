# Resume Builder

https://github.com/ryannaleway/Resume-Builder-Application.git

A full-stack resume builder web application built with Node.js, Express, SQLite, Bootstrap 5, and Google Gemini.

## Features

- Store and manage jobs, responsibilities, skills, skill categories, certifications, and awards in SQLite.
- Sign up or sign in with first name, last name, business email, password, and an optional phone number.
- Allow users to sign in with either email or phone.
- Allow users to choose in the resume builder whether the header shows email, phone, or both.
- Save a target role and professional summary at the top of the resume.
- Keep jobs, skills, certifications, awards, settings, and resume selections scoped to the signed-in account.
- Select exactly which resume content to include for a tailored resume.
- Generate a live web preview and a print-friendly resume layout.
- Export the generated resume to PDF in the browser with `jsPDF`.
- Request Gemini suggestions for job summaries, responsibilities, skills, and certifications.
- Accept or reject AI suggestions directly in the user interface.
- Save a Gemini API key securely in the database using application-level encryption.

## Tech Stack

- Frontend: HTML, CSS, Bootstrap 5, JavaScript
- Frontend UI assets: Bootstrap CDN and SweetAlert2 CDN
- Backend: Node.js with Express
- Database: SQLite with `sqlite3`
- AI Integration: Google Gemini API
- Configuration: `dotenv`

## Project Structure

```text
/public
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
```

## Local Setup

1. Install Node.js 18 or newer.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example`.
4. Update the values in `.env`.
5. Start the application:

```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000).
7. Create an account on `/auth`.
8. Use the contact toggle on `/builder` to choose whether the resume header shows email, phone, or both.

## Example `.env`

```env
PORT=3000
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
GEMINI_API_KEY=
APP_SECRET=replace-with-a-long-random-string
```

## Sample Data

The application automatically seeds sample jobs, responsibilities, skills, certifications, awards, and a default resume profile the first time the SQLite database is created.

## How Generative AI Is Used

The application uses Google Gemini to improve resume-related text entered by the user.

- Job summaries can be rewritten to sound clearer and more professional.
- Job responsibilities can be strengthened to emphasize impact and outcomes.
- Skills can be refined to fit resume wording more naturally.
- Certification descriptions can be improved for clarity and credibility.

The AI flow is:

1. The user enters text in the interface.
2. The frontend sends the text to `POST /api/ai/suggestions`.
3. The server retrieves the Gemini API key from the request, encrypted settings, or `.env`.
4. The server sends a prompt to Gemini asking for structured JSON suggestions.
5. The frontend displays the returned suggestions in a modal.
6. The user chooses whether to apply a suggestion.

## API Overview

All `GET` routes return JSON arrays to match the repository rules.

### Jobs

- `GET /api/jobs`
- `GET /api/jobs?jobId=1`
- `POST /api/jobs`
- `PUT /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

Example create request:

```http
POST /api/jobs
Content-Type: application/json

{
  "title": "Senior Developer",
  "company": "Example Corp",
  "startDate": "2024-01",
  "endDate": "Present",
  "location": "Remote",
  "summary": "Delivered accessible business applications."
}
```

### Responsibilities

- `GET /api/responsibilities`
- `GET /api/responsibilities?jobId=1`
- `POST /api/responsibilities`
- `PUT /api/responsibilities/:responsibilityId`
- `DELETE /api/responsibilities/:responsibilityId`

### Skill Categories

- `GET /api/skill-categories`
- `GET /api/skill-categories?skillCategoryId=1`
- `POST /api/skill-categories`
- `PUT /api/skill-categories/:skillCategoryId`
- `DELETE /api/skill-categories/:skillCategoryId`

### Skills

- `GET /api/skills`
- `GET /api/skills?skillId=1`
- `GET /api/skills?skillCategoryId=1`
- `POST /api/skills`
- `PUT /api/skills/:skillId`
- `DELETE /api/skills/:skillId`

### Certifications

- `GET /api/certifications`
- `GET /api/certifications?certificationId=1`
- `POST /api/certifications`
- `PUT /api/certifications/:certificationId`
- `DELETE /api/certifications/:certificationId`

### Awards

- `GET /api/awards`
- `GET /api/awards?awardId=1`
- `POST /api/awards`
- `PUT /api/awards/:awardId`
- `DELETE /api/awards/:awardId`

### Settings

- `GET /api/settings`
- `GET /api/settings?settingKey=geminiApiKey`
- `PUT /api/settings`

Example settings request:

```http
PUT /api/settings
Content-Type: application/json

{
  "settingKey": "geminiApiKey",
  "settingValue": "your-user-provided-key"
}
```

### Resume Generation

- `GET /api/resumes`
- `GET /api/resumes?userId=1&jobIds=1,2&responsibilityIds=3,4&skillIds=2,5&certificationIds=1&awardIds=1`

### AI Suggestions

- `POST /api/ai/suggestions`

### Authentication

- `GET /api/auth/users?userId=1`
- `GET /api/auth/users?phone=123-456-7890`
- `POST /api/auth/signup`
- `POST /api/auth/login`

Example sign up request:

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

Example sign in with phone:

```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "123-456-7890",
  "password": "SecurePass123"
}
```

Example AI request:

```http
POST /api/ai/suggestions
Content-Type: application/json

{
  "sourceType": "job responsibility",
  "sourceText": "Worked on reports and helped the team.",
  "apiKey": "optional-one-time-key"
}
```

## Notes About Environment Variables

- `PORT` controls the Express server port.
- `GEMINI_API_URL` allows you to swap to a different Gemini model endpoint if needed.
- `GEMINI_API_KEY` is an optional development fallback.
- `APP_SECRET` is required to encrypt the stored Gemini API key value.

## Printing and PDF

- The `/builder` page provides live resume assembly.
- The `/preview` page provides print-friendly output.
- Print styling hides navigation and UI controls with `@media print`.
- PDF export uses `jsPDF` in the browser and saves the generated resume as `resume.pdf`.
- The resume header is automatically populated from the currently signed-in user.
- The `/builder` page includes a contact toggle that lets the user show email, phone, or both in the resume header.
- Resume content is user-scoped, so one account does not see another account's jobs, skills, awards, certifications, settings, or saved builder selections.

## Notes

- Bootstrap and SweetAlert2 are loaded from CDNs because the frontend now uses the hosted browser assets directly.
- The application uses prepared statements through `sqlite3`.
- Validation is applied to all user-facing create and update routes.
