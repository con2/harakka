# Implementing Email Service

## Planning:

we need mails for:

- new user registration: welcome and so on. maybe with 10% off on the first order
  (we don't need an email confirmation, supabase handles this automatically)
- after the booking. booking has been received, waiting for confirmation
- now the booking is confirmed by an admin you can pick up the items then and then
- invoice
- return of the items reminder mail
- invoice payment reminder mail
- payment received mail
- items successfully returned
- Booking cancelled by admin mail
- booking cancelled by you mail
- booking details successfully updated, new items pending
- confirmation of email change (not sure if necessary)

Setup with:

- gmail
- nodemailer
- react.mails

### Gmail OAuth

1. go to APIs & Services → OAuth consent screen
2. select target group
   o Select: External
   o → this is correct for tests with your Gmail address
3. app information
   o App name: e.g. BookingApp Mailer
   o Support email: your Gmail address
   o App logo (optional)
4. developer contact details
   o Enter your Gmail address
5. configure scopes
   o Click on Add scopes
   o Search for:

```bash
.../auth/gmail.send
```

1.  o Select: https://www.googleapis.com/auth/gmail.send (NOT mail.google.com → that would be full access)
    o Save and continue
2.  define test user
    o Add your own Gmail address (this may then go through the OAuth flow)
3.  confirm
    o Click Done - you do not need to submit anything for verification yet, as you remain in test mode

✅ Danach: Anmeldedaten anlegen

1. Gehe zu Anmeldedaten
2. Klicke auf + Anmeldedaten erstellen → OAuth-Client-ID
3. Wähle Anwendungstyp: Desktop-App
4. Name: z. B. Nodemailer Local
5. Nach dem Erstellen erhältst du:
   o Client-ID
   o Client-Secret

🔐 Jetzt kannst du mit diesem Setup im OAuth Playground den refresh_token generieren, wie im nächsten Schritt beschrieben.

Schritt-für-Schritt: Gmail-Versand mit OAuth2 (für Nodemailer)

1. ✅ OAuth-Zustimmungsbildschirm (hast du schon fast fertig)
   • App-Typ: Extern
   • App-Name: z. B. BookingApp Mailer
   • Support-E-Mail & Entwicklerkontakt: deine Gmail-Adresse
   • Scope hinzufügen: https://www.googleapis.com/auth/gmail.send
   • Testnutzer: deine Gmail-Adresse hinzufügen
   • Speichern

2. ✅ OAuth-Client erstellen
3. Gehe zu: APIs & Dienste → Anmeldedaten
4. Klicke: Anmeldedaten erstellen → OAuth-Client-ID
5. Typ: Desktop-App
6. Name: z. B. NodemailerClient
7. Erstellen
   → Du erhältst:
   o CLIENT_ID
   o CLIENT_SECRET
   📁 Bewahre diese sicher auf – du brauchst sie gleich.

8. ✅ Refresh Token generieren (einmalig)
9. Gehe zum OAuth Playground
10. Klicke oben rechts auf das ⚙️ Zahnrad-Symbol:
    o Aktiviere: ✅ Use your own OAuth credentials
    o Trage ein:
     Client ID → dein Client
     Client Secret → dein Secret
11. Scope eingeben:
    In das Eingabefeld links:
    Bash:
    https://www.googleapis.com/auth/gmail.send

12. → Dann Authorize APIs
13. Melde dich mit deinem Gmail-Account an und erlaube den Zugriff
14. Klicke: Exchange authorization code for tokens
15. Du bekommst:
    o access_token (temporär)
    o refresh_token (💡 wichtig → dauerhaft verwendbar)

🔑 Der richtige Scope für Gmail-Versand lautet:
Arduino:
https://www.googleapis.com/auth/gmail.send

Kopiere den refresh_token

💡 Wichtig: Der refresh_token ist das, was du im Nodemailer später dauerhaft verwenden wirst, um Tokens zu erneuern – damit dein Server auch nach dem ersten Start E-Mails senden kann.

1. Gehe zu OAuth Playground
2. Klicke oben rechts auf ⚙️ (Zahnrad)
   Aktiviere:
   • ✅ "Use your own OAuth credentials"
   Fülle ein:
   • Client ID: dein Client aus Google Cloud Console
   • Client Secret: dein Secret aus Google Cloud Console

3. Token tauschen
   Klicke auf:
   ➡️ Exchange authorization code for tokens
   Du erhältst zwei Dinge:
   • access_token → kurzfristig
   • refresh_token → 💡 dauerhaft wichtig

4. Werte sichern
   Speichere dir diese 4 Infos:
   Schlüssel Wert
   CLIENT_ID Aus Google Cloud
   CLIENT_SECRET Aus Google Cloud
   REFRESH_TOKEN Aus OAuth Playground
   EMAIL_FROM Deine Gmail-Adresse

✅ Schritt 4: Nodemailer mit NestJS einrichten
📁 1. Installiere Dependencies im Backend:

Bash
cd backend
npm install nodemailer googleapis

🧩 2. NestJS Service erstellen (MailService)

```bash
nest g service mail

CREATE src/mail/mail.service.spec.ts (446 bytes)
CREATE src/mail/mail.service.ts (88 bytes)
UPDATE src/app.module.ts (1580 bytes)
```

bla
