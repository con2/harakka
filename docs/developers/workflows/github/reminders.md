# Booking Reminders Workflow

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
  - [Scheduled Execution](#scheduled-execution)
  - [Manual Trigger](#manual-trigger)
- [Workflow Configuration](#workflow-configuration)
- [Required Secrets](#required-secrets)
- [Job Details](#job-details)
  - [Compute Scope Step](#compute-scope-step)
  - [Call Backend Endpoint Step](#call-backend-endpoint-step)
- [Scope Options](#scope-options)
- [Response Handling](#response-handling)
- [Concurrency Control](#concurrency-control)
- [DST Handling](#dst-handling)
- [Setup Instructions](#setup-instructions)
- [Manual Execution](#manual-execution)
- [Monitoring and Debugging](#monitoring-and-debugging)
- [Troubleshooting](#troubleshooting)

## Overview

The Booking Reminders workflow is a scheduled automation that triggers the backend reminders endpoint to send booking-related notifications to users. It runs twice daily to handle timezone changes across Daylight Saving Time (DST) transitions and can also be triggered manually with custom scope options.

**Workflow File:** `.github/workflows/reminders.yml`

**Purpose:**

- Send automated booking reminder emails
- Handle due today and overdue booking notifications
- Support manual reminder triggering for administrative tasks
- Account for DST changes in the Helsinki timezone

## Trigger Conditions

### Scheduled Execution

The workflow runs automatically on a dual cron schedule:

```yaml
on:
  schedule:
    # Run twice daily to approximate 09:00 Helsinki across DST
    # Summer (EEST, UTC+3): 06:00 UTC ≈ 09:00 local
    # Winter (EET, UTC+2): 07:00 UTC ≈ 09:00 local
    - cron: '0 6 * * *'
    - cron: '0 7 * * *'
```

**Schedule Details:**

| Time (UTC) | Helsinki Summer (EEST) | Helsinki Winter (EET) | Active Period |
|------------|------------------------|----------------------|---------------|
| 06:00 UTC  | 09:00 EEST            | 08:00 EET           | ~March-October |
| 07:00 UTC  | 10:00 EEST            | 09:00 EET           | ~October-March |

**Why Two Schedules:**

- GitHub Actions uses UTC timestamps
- Helsinki observes DST (EEST in summer, EET in winter)
- Dual schedule ensures reminders are sent around 09:00 local time year-round
- One schedule runs at the desired time during DST, the other during standard time

### Manual Trigger

The workflow can be manually triggered via GitHub Actions UI:

```yaml
workflow_dispatch:
  inputs:
    scope:
      description: "Reminder scope (all | due_today | overdue)"
      required: false
      default: "all"
```

**Input Parameters:**

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `scope` | Which reminders to send | `all` | `all`, `due_today`, `overdue` |

## Workflow Configuration

**Runner:** `ubuntu-latest`

**Concurrency Control:**

```yaml
concurrency:
  group: booking-reminders
  cancel-in-progress: true
```

**What this means:**

- Only one instance of this workflow can run at a time
- If a new execution starts while another is running, the old one is cancelled
- Prevents duplicate reminder emails
- Ensures clean execution state

## Required Secrets

The workflow requires two repository secrets to be configured:

### CRON_URL

**Purpose:** The backend endpoint URL that handles reminder processing

**Example format:**

```bash
CRON_URL="https://your-backend-domain.com/api/reminders/send"
```

**How to set:**

1. Navigate to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CRON_URL`
4. Value: Your backend reminders endpoint URL

### CRON_SECRET

**Purpose:** Authentication secret to secure the reminders endpoint

**Example format:**

```bash
CRON_SECRET="your-secure-random-secret-here"
```

**Security considerations:**

- Use a strong, randomly generated secret
- Never commit this value to code
- Rotate periodically for security
- Backend should validate this secret in the `X-Cron-Secret` header

**How to set:**

1. Generate a secure random string: `openssl rand -hex 32`
2. Navigate to repository Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `CRON_SECRET`
5. Value: Your generated secret

## Job Details

The workflow consists of a single job named `trigger` with two main steps:

### Compute Scope Step

```yaml
- name: Compute scope
  id: scope
  run: |
    if [ -n "${{ github.event.inputs.scope }}" ]; then
      echo "scope=${{ github.event.inputs.scope }}" >> $GITHUB_OUTPUT
    else
      echo "scope=all" >> $GITHUB_OUTPUT
    fi
```

**What it does:**

1. Checks if the workflow was manually triggered with a scope parameter
2. If scope is provided, uses that value
3. If not provided (scheduled run), defaults to `all`
4. Sets the scope as a step output for use in subsequent steps

**Output:** `scope` - The determined scope value

### Call Backend Endpoint Step

```yaml
- name: Call backend reminders endpoint
  env:
    CRON_URL: ${{ secrets.CRON_URL }}
    CRON_SECRET: ${{ secrets.CRON_SECRET }}
    SCOPE: ${{ steps.scope.outputs.scope }}
  run: |
    if [ -z "$CRON_URL" ] || [ -z "$CRON_SECRET" ]; then
      echo "CRON_URL and/or CRON_SECRET are not set as repo secrets" >&2
      exit 1
    fi

    # Build URL with scope param if needed
    if echo "$CRON_URL" | grep -q '\\?'; then
      URL="$CRON_URL&scope=$SCOPE"
    else
      URL="$CRON_URL?scope=$SCOPE"
    fi

    echo "POST $URL"
    http_code=$(curl -sS -o response.json -w "%{http_code}" \
      -X POST "$URL" \
      -H "X-Cron-Secret: $CRON_SECRET" \
      -H "Content-Type: application/json" \
      --max-time 60)

    echo "Status: $http_code"
    echo "Response:"
    cat response.json || true

    if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
      echo "Request failed with status $http_code" >&2
      exit 1
    fi
```

**What it does:**

1. **Validates Secrets:**
   - Checks that both `CRON_URL` and `CRON_SECRET` are configured
   - Exits with error if either is missing

2. **Builds Request URL:**
   - Checks if base URL already has query parameters (contains `?`)
   - Appends scope parameter appropriately (`?scope=X` or `&scope=X`)

3. **Makes HTTP Request:**
   - Method: POST
   - Headers:
     - `X-Cron-Secret`: Authentication header with secret
     - `Content-Type: application/json`
   - Timeout: 60 seconds
   - Saves response to `response.json`
   - Captures HTTP status code

4. **Logs Response:**
   - Prints the HTTP status code
   - Outputs the response body

5. **Validates Response:**
   - Checks if status code is in 2xx range
   - Fails the workflow if status is not successful

6. **Spam Guard Protection:**
   - Extracts the `sent` count from the response JSON
   - Checks if the count exceeds 500 emails
   - Fails the workflow if threshold is exceeded to prevent potential spam
   - Logs the sent count for monitoring purposes

**Spam Guard Implementation:**

```bash
# Spam guard: fail if sent count is unusually high
echo "Checking sent count..."
sent_count=$(jq -r '.sent // 0' response.json)
echo "Emails sent: $sent_count"

if [ "$sent_count" -gt 500 ]; then
  echo "⚠️  WARNING: Unusually high send count detected ($sent_count emails)" >&2
  echo "Aborting to prevent potential spam" >&2
  exit 1
fi

echo "✅ Send count is within normal range"
```

**Why this protection exists:**

- Prevents accidental mass email sending due to bugs or configuration errors
- Default threshold is set to 500 emails per workflow run
- Can be adjusted by modifying the threshold value in the workflow file
- Provides an early warning system for unusual activity

## Scope Options

The `scope` parameter determines which reminders are processed:

### `all` (Default)

```bash
# All booking reminders
scope=all
```

- Sends all applicable reminders
- Includes both due today and overdue bookings
- Used for scheduled daily runs
- Most comprehensive reminder sweep

### `due_today`

```bash
# Only bookings due today
scope=due_today
```

- Sends reminders only for bookings due today
- Useful for same-day notifications
- Can be used for morning reminder runs

### `overdue`

```bash
# Only overdue bookings
scope=overdue
```

- Sends reminders only for overdue bookings
- Useful for follow-up notifications
- Can be used for escalation workflows

## Response Handling

Expected backend response format:

```json
{
  "success": true,
  "sent": 15,
  "failed": 0,
  "scope": "all",
  "timestamp": "2025-10-07T06:00:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the operation completed successfully |
| `sent` | number | Number of reminder emails sent |
| `failed` | number | Number of emails that failed to send |
| `scope` | string | The scope that was processed |
| `timestamp` | string | ISO timestamp of when processing occurred |

**Success Criteria:**

- HTTP status code in 2xx range
- Backend processes reminders without throwing errors
- Response is logged for monitoring

## Concurrency Control

The workflow uses concurrency control to prevent overlapping executions:

```yaml
concurrency:
  group: booking-reminders
  cancel-in-progress: true
```

**Behavior:**

- If the 06:00 UTC run is still executing when 07:00 UTC triggers, the 06:00 run will be cancelled
- Prevents duplicate reminder emails during slow executions
- Ensures only one reminder job runs at a time
- Latest trigger always takes priority

**Why this matters:**

- Backend processing might take time with large user bases
- Prevents race conditions
- Avoids sending duplicate reminders to users

## DST Handling

The dual cron schedule handles Daylight Saving Time transitions:

### Summer (EEST - Eastern European Summer Time)

- UTC+3
- Approximately March to October
- 06:00 UTC = 09:00 EEST ✓
- 07:00 UTC = 10:00 EEST (runs but off-peak)

### Winter (EET - Eastern European Time)

- UTC+2
- Approximately October to March
- 06:00 UTC = 08:00 EET (runs but early)
- 07:00 UTC = 09:00 EET ✓

**Trade-off:**

- One execution per day runs at the desired 09:00 local time
- The other runs at a less optimal time (08:00 or 10:00)
- Both executions are safe due to concurrency control
- Alternative would be to manually update the workflow twice per year

## Setup Instructions

### 1. Configure Backend Endpoint

Ensure your backend has a reminders endpoint that:

```typescript
// Example endpoint structure
POST /api/reminders/send?scope=all

Headers:
  X-Cron-Secret: <secret>
  Content-Type: application/json

Response:
  Status: 200
  Body: { "success": true, "sent": 10, "failed": 0, ... }
```

### 2. Set GitHub Secrets

```bash
# 1. Generate a secure secret
SECRET=$(openssl rand -hex 32)

# 2. Add secrets to GitHub repository:
# - Go to repository Settings
# - Navigate to Secrets and variables → Actions
# - Add CRON_URL with your backend URL
# - Add CRON_SECRET with your generated secret
```

### 3. Configure Backend Authentication

Ensure your backend validates the `X-Cron-Secret` header:

```typescript
// Example backend middleware
if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 4. Test the Workflow

```bash
# Manual trigger via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Booking Reminders" workflow
# 3. Click "Run workflow"
# 4. Select scope (all/due_today/overdue)
# 5. Click "Run workflow"
# 6. Monitor execution and check logs
```

## Manual Execution

### Via GitHub UI

1. Navigate to your repository on GitHub
2. Click the "Actions" tab
3. Select "Booking Reminders" from the workflows list
4. Click "Run workflow" button (top right)
5. Select branch (usually `main` or `develop`)
6. Choose scope:
   - `all` - Send all reminders
   - `due_today` - Only today's reminders
   - `overdue` - Only overdue reminders
7. Click "Run workflow" to execute

### Via GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or: sudo apt install gh  # Linux

# Authenticate
gh auth login

# Trigger workflow with default scope (all)
gh workflow run reminders.yml

# Trigger with specific scope
gh workflow run reminders.yml -f scope=due_today

# Check status of recent runs
gh run list --workflow=reminders.yml
```

### Via GitHub API

```bash
# Using curl
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/reminders.yml/dispatches \
  -d '{"ref":"main","inputs":{"scope":"all"}}'
```

## Monitoring and Debugging

### View Workflow Runs

1. Go to Actions tab in repository
2. Filter by "Booking Reminders" workflow
3. Click on a specific run to see details
4. Review logs for each step

### Check Response Logs

The workflow logs include:

- Computed scope value
- POST URL being called
- HTTP status code
- Complete response body

Example log output:

```text
Compute scope
scope=all

Call backend reminders endpoint
POST https://backend.example.com/api/reminders/send?scope=all
Status: 200
Response:
{"success":true,"sent":15,"failed":0,"scope":"all"}
```

### Monitoring Best Practices

1. **Set up notifications:**
   - Configure GitHub Actions notifications
   - Get alerts for workflow failures

2. **Review logs regularly:**
   - Check daily execution logs
   - Monitor sent/failed counts
   - Look for patterns in failures

3. **Track metrics:**
   - Number of reminders sent daily
   - Success/failure rates
   - Execution duration

## Troubleshooting

### Workflow Fails: Secrets Not Set

**Error:**

```text
CRON_URL and/or CRON_SECRET are not set as repo secrets
```

**Solution:**

1. Verify secrets are configured in repository settings
2. Check secret names match exactly: `CRON_URL` and `CRON_SECRET`
3. Ensure secrets are not accidentally configured as environment secrets instead of repository secrets

### Workflow Fails: HTTP Error

**Error:**

```text
Request failed with status 401
```

**Common causes:**

- `CRON_SECRET` mismatch between GitHub and backend
- Backend endpoint not accepting the secret header

**Solution:**

```bash
# Verify backend secret matches GitHub secret
# Check backend logs for authentication errors
# Ensure header name matches: X-Cron-Secret
```

**Error:**

```text
Request failed with status 404
```

**Common causes:**

- Incorrect `CRON_URL` path
- Backend endpoint not deployed or accessible
- Wrong environment (staging vs production)

**Solution:**

1. Verify the endpoint URL is correct
2. Test the endpoint manually with curl
3. Check backend deployment status

### Workflow Fails: Timeout

**Error:**

```text
curl: (28) Operation timed out after 60000 milliseconds
```

**Common causes:**

- Backend server is down or unresponsive
- Database query taking too long
- Network connectivity issues

**Solution:**

1. Check backend server status
2. Review backend logs for long-running queries
3. Consider increasing timeout if legitimate processing takes longer
4. Optimize backend reminder processing

### No Reminders Sent

**Issue:** Workflow succeeds but no emails are sent

**Check:**

1. Review backend response - check `sent` count
2. Verify there are actually bookings that need reminders
3. Check email service configuration
4. Review backend reminder logic
5. Verify database contains bookings with correct dates

### Duplicate Reminders

**Issue:** Users receive multiple reminder emails

**Common causes:**

- Concurrency control not working
- Multiple workflow runs triggered simultaneously
- Backend not tracking sent reminders

**Solution:**

1. Verify concurrency settings are in place
2. Check workflow run history for overlapping executions
3. Implement idempotency in backend (track sent reminders)
4. Add deduplication logic in backend

### Wrong Time Execution

**Issue:** Reminders sent at unexpected times

**Check:**

1. Review cron schedule in workflow file
2. Verify understanding of UTC vs local time
3. Check if DST transition occurred recently
4. Consider your specific timezone requirements

**Solution:**

- Adjust cron schedules if needed
- Document expected execution times for your timezone
- Consider using a single schedule with manual DST updates

### Backend Returns Error

**Error:**

```text
Status: 500
Response: {"error": "Internal server error"}
```

**Solution:**

1. Check backend logs for detailed error
2. Verify database connectivity
3. Check email service status
4. Test reminder endpoint manually
5. Review backend code for bugs

### Spam Guard Triggered

**Error:**

```text
⚠️  WARNING: Unusually high send count detected (650 emails)
Aborting to prevent potential spam
```

**Common causes:**

- Database contains unusually large number of bookings requiring reminders
- Bug in backend logic selecting too many bookings
- Incorrect date filtering in backend queries
- Data migration or bulk import created many bookings

**Solution:**

1. **Review backend logs** to understand why so many emails would be sent
2. **Check database** for the actual number of bookings requiring reminders
3. **Verify backend logic** for date filtering and reminder selection
4. **Adjust threshold** if legitimate use case requires more than 500 emails:
   - Edit `.github/workflows/reminders.yml`
   - Change the threshold: `if [ "$sent_count" -gt 500 ]` to a higher value
   - Consider if this is truly necessary or if batching would be better
5. **Implement batching** if you regularly need to send more than 500 reminders
6. **Test with smaller scope** first using manual trigger with `due_today` or `overdue`

**Prevention:**

- Monitor daily sent counts to establish baseline
- Implement database constraints on booking dates
- Add backend validation to catch unusual patterns
- Consider implementing rate limiting in the backend

### High Failure Rate

**Issue:** Many reminders fail to send

**Check backend response:**

```json
{
  "success": true,
  "sent": 5,
  "failed": 45,
  "errors": ["Email service rate limit exceeded"]
}
```

**Common causes:**

- Email service rate limits
- Invalid email addresses
- Email service authentication issues

**Solution:**

1. Review email service quota and limits
2. Implement retry logic with exponential backoff
3. Validate email addresses before sending
4. Consider batching emails if rate limits are an issue

## Additional Resources

### Related Documentation

- [Build Validation Workflow](./build-validation.md)
- [Lint and Type Check Workflow](./lint-and-type-check.md)
- [Contribution Guide](../contribution-guide.md)

### External Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Syntax](https://crontab.guru/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### Backend Implementation Guide

Example NestJS controller for handling reminders:

```typescript
@Controller('api/reminders')
export class RemindersController {
  @Post('send')
  @UseGuards(CronSecretGuard)
  async sendReminders(
    @Query('scope') scope: 'all' | 'due_today' | 'overdue' = 'all'
  ) {
    const result = await this.remindersService.processReminders(scope);
    
    return {
      success: true,
      sent: result.sent,
      failed: result.failed,
      scope: scope,
      timestamp: new Date().toISOString()
    };
  }
}
```

Example authentication guard:

```typescript
@Injectable()
export class CronSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const cronSecret = request.headers['x-cron-secret'];
    
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    
    return true;
  }
}
```

## Getting Help

If you continue to experience issues:

1. Check workflow logs in the Actions tab
2. Review backend logs for detailed error information
3. Test the endpoint manually using curl or Postman
4. Verify all secrets are correctly configured
5. Ensure backend is deployed and accessible
6. Check email service status and configuration
7. Review database for expected booking data
