# Email integration

## with resend

### 1. API integration

first we create an account and get the api key  
that goes to our .env file and then we test it with cURL

```cURL
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_TuZj8hgS_E9WkeS2rb7cvHhCwCBYotbwG' \
  -H 'Content-Type: application/json' \
  -d $'{
    "from": "onboarding@resend.dev",
    "to": "garschtubald@gmail.com",
    "subject": "Hello World",
    "html": "<p>Congrats on sending your <strong>first email</strong>!</p>"
  }'
```
