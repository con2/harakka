# Welcome Email Setup

## New Trigger Function

```sql
DECLARE
    response json;
BEGIN
    -- Optional: Wait a moment for Supabase to finish syncing everything
    PERFORM pg_sleep(1);

    -- Make HTTP call to your NestJS app
    SELECT
        http_post(
            url := 'https://your-backend.com/api/users/' || NEW.id || '/send-welcome-mail',
            headers := json_build_object('Content-Type', 'application/json'),
            body := '{}'::json
        ) INTO response;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

neuer trigger:

```sql
CREATE TRIGGER after_insert_send_welcome_email
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION notify_user_created();

```

    Function notify_user_created exists in public schema

        Return type is trigger

        No arguments

        Definition contains HTTP request via http_post(...)

    Trigger after_insert_send_welcome_email is set to user_profiles

        Is executed AFTER INSERT

        Calls notify_user_created()

und am schluss noch aktiviert diese extension in supabase:
Enabled extensions
pg_net

and run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```
