# AI Usage Documentation

## Summary

I used Generative AI, on Codex. it was used during development of ResumeForge Builder to help scaffold structure, refine frontend behavior, and accelerate layout experimentation for the resume preview and export workflow. Every generated change was reviewed and integrated manually. I tailored it also based on past assignments and strucuture that my professor had used in class. It's used on .md files to explain to users looking for additional information. AI is also used within the application itself, such as in the AI Improved workflows. 

## How AI Is Used In The Application

The shipped application uses the Google Gemini API to review user-entered resume content and suggest stronger wording.

Supported suggestion targets:

- job summaries
- job responsibilities
- skills
- certification descriptions

Application flow:

1. The user enters resume-related text.
2. The frontend sends the text to `POST /api/ai/suggestions`.
3. The backend reads a Gemini API key from the request, the encrypted user setting, or the development `.env` fallback.
4. The backend sends a structured prompt to Gemini.
5. The returned suggestions are displayed in the shared suggestion modal.
6. The user chooses whether to apply a suggestion.

## AI-Related Files

- [controllers/aiController.js](C:/Users/Ryan/Desktop/ResumeBuilder/controllers/aiController.js)
- [routes/aiRoutes.js](C:/Users/Ryan/Desktop/ResumeBuilder/routes/aiRoutes.js)
- [public/js/suggestions.js](C:/Users/Ryan/Desktop/ResumeBuilder/public/js/suggestions.js)
- [models/settingModel.js](C:/Users/Ryan/Desktop/ResumeBuilder/models/settingModel.js)

## Rules File

The primary development rules file used for this project is:

- [Agents.md](C:/Users/Ryan/Desktop/ResumeBuilder/Agents.md)

That file includes expectations for naming, accessibility, validation, local asset usage, and REST design.

## MCP / Agentic Workflow Notes

Development support used the Codex desktop environment with agent-style assistance and local tooling. No custom MCP server is required to run the application itself.

Relevant notes:

- the app runtime does not depend on MCP
- the project can be run locally with `npm install` and `npm start`
- AI assistance was used as a development accelerator, not as a runtime dependency beyond the Gemini API integration described above

