# Auth email templates

Branded versions of the Supabase emails. Supabase only lets you edit templates
once a custom SMTP sender is configured (Authentication > Emails > SMTP Settings).

After SMTP is set up:

1. Authentication > Emails > Templates > **Confirm sign up**
   - Subject: `Confirm your email for Ivory Studios`
   - Body: paste `confirm-signup.html`
2. **Reset password**
   - Subject: `Reset your Ivory Studios password`
   - Body: paste `reset-password.html`

Both use Supabase's `{{ .ConfirmationURL }}`, which already carries the right
return address: `/login?confirmed=1` for sign-up (set by the site when the
account is created) and `/reset-password` for resets. Don't hard-code URLs.
