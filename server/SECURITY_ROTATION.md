# SECURITY CHECKLIST - Credentials That Must Be Rotated

## Critical Secrets Found in Repository

These values were found in `.env` or code and MUST be rotated immediately if this code was ever shared or deployed:

### MongoDB Credentials
- [ ] MongoDB Atlas password: `n8ntcwoTQgrPy3At` (in `.env`)
- [ ] Local MongoDB (if used in production): verify no default credentials

### JWT Secret
- [ ] JWT secret: `timeora_super_secret_jwt_horology_key_2024` (in `.env`)
- [ ] Regenerate and update all deployed instances

### Email Credentials
- [ ] Email service credentials: check `.env` and update if real values were used

### Admin Credentials
- [ ] Admin email: `timeoraa@gmail.com` (in `.env`)
- [ ] Admin password: `Time@1266` (in `.env`)
- [ ] Verify admin account in database and reset password

### Payment Credentials
- [ ] Razorpay Key ID: check `.env`
- [ ] Razorpay Key Secret: check `.env`
- [ ] Razorpay Webhook Secret: check `.env`

## Action Required

1. Generate new strong secrets using a password manager
2. Update `.env` file with new values
3. Redeploy with new environment variables
4. Update `.env.example` to NOT contain any real values
5. Add `.env` to `.gitignore` if not already
6. Audit git history for leaked secrets: `git log -p -- .env`
