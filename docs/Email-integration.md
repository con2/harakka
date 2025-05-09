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
- booking details successfully updated, new items pending
- confirmation of email change (not sure if necessary)

- booking cancelled by you mail

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

Now you can generate the refresh_token with this setup in the OAuth Playground, as described in the next step.

### Step-by-step: Sending Gmail with OAuth2 (for nodemailers)

1st OAuth consent screen (you are almost done)

- App type: External
- App name: e.g. BookingApp Mailer
- Support email & developer contact: your Gmail address
- Add scope: https://www.googleapis.com/auth/gmail.send for sending or https://mail.google.com/ for all Gmail functions
- Test user: add your Gmail address
- Save

2. create OAuth client
3. go to: APIs & Services → Credentials
4. click: Create credentials → OAuth client ID
5. type: desktop app
6. name: e.g. NodemailerClient
7. create
   → You will receive:
   o CLIENT_ID
   o CLIENT_SECRET
   Keep these safe - you will need them in a moment.

8. generate refresh token (one-time)
9. go to the OAuth Playground
10. click on the ⚙️ gear icon in the top right corner
    o Activate: Use your own OAuth credentials
    o Enter:
     Client ID → your client
     Client Secret → your secret
11. enter scope:
    In the input field on the left:

    https://www.googleapis.com/auth/gmail.send

12. → Then Authorise APIs
13. log in with your Gmail account and authorise access
14. click: Exchange authorisation code for tokens
15. you get:
    o access_token (temporary)
    o refresh_token (💡 important → permanently usable)

### Copy the refresh_token to your .env file

Put also the client_id and client_secret in the .env file

```env
EMAIL_FROM=illusia.email@gmail.com
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
```

### Set up Nodemailer with NestJS

1. install dependencies in the backend:

```Bash
cd backend
npm install nodemailer googleapis
```

2. NestJS Service erstellen (MailService)

```bash
nest g service mail

CREATE src/mail/mail.service.spec.ts (446 bytes)
CREATE src/mail/mail.service.ts (88 bytes)
UPDATE src/app.module.ts (1580 bytes)
```

### Links

This is the setup page for oAuth playground:
https://developers.google.com/oauthplayground/?code=4/0Ab_5qllgXapuxIEsUQnqhQjwMt4XUpzy7E9GUrHnVQnxgc6uKMBfa4TXbEQqn3JVItGGMQ&scope=https://mail.google.com/

There is the client stored:
https://console.cloud.google.com/auth/clients?authuser=2&inv=1&invt=AbwmXQ&project=bookingappmailing

you should be logged in with the email to see the details
