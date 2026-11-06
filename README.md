# ChatGPT · KDS AI

Eigenständiger KI-Assistent mit Supabase-Authentifizierung, gespeichertem Chatverlauf und einer serverseitigen KI-Edge-Function.

## Architektur

- Frontend: statische HTML/CSS/JavaScript-App
- Authentifizierung: Supabase Auth (E-Mail + Passwort)
- Datenbank: `chatgpt_conversations` und `chatgpt_messages`
- KI: Supabase Edge Function `chatgpt`
- Modellanbieter: serverseitige KDS-AI-Konfiguration (`AI_API_KEY`, optional `AI_API_URL`, `AI_MODEL`)

Der Provider-API-Key wird ausschließlich serverseitig in Supabase Edge Function Secrets verwendet. Der Browser enthält nur den öffentlichen Publishable Key.

## Deployment

1. GitHub Actions veröffentlicht die statische App über GitHub Pages.
2. In Supabase Auth die Site-URL und Redirect-URL auf die GitHub-Pages-Adresse dieses Repositorys setzen: `https://lordlolqdh.github.io/chatgpt/`.
3. E-Mail-Bestätigung/SMTP in Supabase Auth konfigurieren, falls Registrierungen eine Bestätigung verlangen.
4. In Supabase → Edge Functions → Secrets prüfen, dass `AI_API_KEY` gesetzt ist. Optional: `AI_API_URL` und `AI_MODEL`.
5. Die Edge Function `chatgpt` muss mit JWT-Prüfung aktiviert bleiben.

## Sicherheit

- Chatverläufe sind pro Nutzer durch Row Level Security getrennt.
- Anonyme Auth-Sitzungen sind für die Chat-Tabellen ausgeschlossen.
- Die KI-Funktion verlangt eine gültige Supabase-Session.
- Provider- und Service-Role-Schlüssel werden nicht an den Browser ausgeliefert.
- Die Anwendung ist ein eigenständiges KDS-AI-Projekt und nicht die offizielle OpenAI-App.
