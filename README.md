# ChatGPT · KDS AI

Eigenständiger KI-Assistent mit Supabase-Backend, anonymen Sitzungen und gespeichertem Chatverlauf. Die Oberfläche orientiert sich am ChatGPT-Chatlayout.

## Architektur

- Frontend: statische HTML/CSS/JavaScript-App
- Zugriff: automatische anonyme Supabase-Auth-Sitzung; kein sichtbarer Login oder Benutzerkonto erforderlich
- Datenbank: `chatgpt_conversations` und `chatgpt_messages`
- KI: Supabase Edge Function `chatgpt`
- Modellanbieter: serverseitige KDS-AI-Konfiguration (`AI_API_KEY`, optional `AI_API_URL`, `AI_MODEL`)

Jeder Browser erhält eine eigene anonyme Benutzer-ID. Chatverläufe bleiben dieser Sitzung zugeordnet und werden nicht zwischen Besuchern geteilt. Werden Browserdaten gelöscht oder wird ein anderes Gerät verwendet, ist die bisherige Sitzung möglicherweise nicht mehr verfügbar.

## Deployment

1. GitHub Actions veröffentlicht die statische App über GitHub Pages.
2. In Supabase Auth muss **Allow anonymous sign-ins** aktiviert sein.
3. In Supabase Auth die Site-URL und Redirect-URL auf `https://lordlolqdh.github.io/chatgpt/` setzen.
4. In Supabase → Edge Functions → Secrets prüfen, dass `AI_API_KEY` gesetzt ist. Optional: `AI_API_URL` und `AI_MODEL`.
5. Die Edge Function `chatgpt` muss mit JWT-Prüfung aktiviert bleiben.

## Sicherheit

- Es gibt keine sichtbare Registrierung oder Anmeldung.
- Die Anwendung erstellt automatisch eine anonyme Supabase-Sitzung.
- Chatverläufe sind per Row Level Security auf die jeweilige anonyme Sitzung beschränkt.
- Provider- und Service-Role-Schlüssel werden nicht an den Browser ausgeliefert.
- Die Anwendung ist ein eigenständiges KDS-AI-Projekt und nicht die offizielle OpenAI-App.
