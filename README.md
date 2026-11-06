# ChatGPT | AI-Powered Software Development

**Software Development · AI Application Engineering · JavaScript · Supabase · Backend APIs**

This repository contains an independently built, browser-based AI chat application powered by KDS AI. The project is focused on **software development and application engineering**: building a complete AI-powered web application, connecting a frontend to backend services, managing anonymous user sessions, and securely storing conversations.

> This is an independent software project. It is not the official OpenAI ChatGPT application.

## Software development focus

The project demonstrates practical work across a modern web application stack:

- **Frontend Development:** responsive chat interface built with HTML, CSS and JavaScript
- **Application Development:** interactive chat workflow, conversation history and session handling
- **Backend Development:** Supabase Edge Function for server-side AI requests
- **API Integration:** communication between the browser, Supabase and the configured AI provider
- **Database Engineering:** persistent conversations and messages with session-based access
- **Authentication:** anonymous Supabase Auth sessions without a visible registration flow
- **Security:** Row Level Security (RLS), server-side provider secrets and isolated user data
- **Deployment:** automated GitHub Pages deployment with GitHub Actions

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Supabase Edge Functions |
| Authentication | Supabase Auth (anonymous sessions) |
| Database | Supabase |
| AI integration | Configurable server-side AI provider |
| CI/CD and hosting | GitHub Actions, GitHub Pages |

## Architecture

1. The browser loads the static web application from GitHub Pages.
2. The app creates or restores an anonymous Supabase session.
3. Chat requests are sent to the Supabase Edge Function named `chatgpt`.
4. The Edge Function communicates with the configured AI provider using server-side secrets.
5. Conversations and messages are stored in Supabase and protected by Row Level Security.

### Database

- `chatgpt_conversations`
- `chatgpt_messages`

Each browser session receives its own anonymous user identity. Conversation data is scoped to that identity and is not shared between visitors. Clearing browser data or switching devices may make the previous anonymous session unavailable.

## Local development and deployment

The application is a static frontend and can be hosted using GitHub Pages.

1. GitHub Actions publishes the repository to GitHub Pages.
2. Enable **Allow anonymous sign-ins** in Supabase Auth.
3. Set the Supabase Site URL and redirect URL to `https://lordlolqdh.github.io/chatgpt/`.
4. Configure the Supabase Edge Function secrets:
   - `AI_API_KEY` (required)
   - `AI_API_URL` (optional)
   - `AI_MODEL` (optional)
5. Deploy the `chatgpt` Edge Function with JWT verification enabled.

## Security principles

- No provider API key or service-role key is shipped to the browser.
- AI provider credentials remain in server-side Supabase secrets.
- Anonymous sessions are used instead of a public account-registration flow.
- Row Level Security restricts conversation access to the owning session.
- The Edge Function remains protected by Supabase authentication.

## Project purpose

This repository is both a working AI chat application and a hands-on software development project. It brings together frontend engineering, backend development, API integration, database design, authentication, security and deployment in one application.

## Live application

**[Open ChatGPT · KDS AI](https://lordlolqdh.github.io/chatgpt/)**

More software projects: **[github.com/LordLOLQDH](https://github.com/LordLOLQDH)**
