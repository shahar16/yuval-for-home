# Bug #5 Fix: Admin Password Verification

**Date**: 2026-03-25
**Status**: ✅ **FIXED**

---

## Problem

Admin password verification was failing with 500 Internal Server Error. Users could not:
- Create new days
- Manage products
- Export to Excel

Error in server logs: `ADMIN_PASSWORD_HASH not found in environment`

---

## Root Cause

The bcrypt password hash stored in `.env.local` contains `$` characters:
```
$2b$10$B0xHFewfSnQFivXXjeLvMevykHLqR4H4MW2kOqHFeuOOg626DhwMa
```

In `.env` files, `$` is treated as a variable substitution character. Next.js was interpreting `$2b`, `$10`, etc. as environment variables and replacing them with empty strings, resulting in:
```
ADMIN_PASSWORD_HASH=""  (empty string)
```

---

## Solution

### 1. Fix `.env.local`

Escape the `$` characters with backslashes:

**Before (broken):**
```bash
ADMIN_PASSWORD_HASH=$2b$10$B0xHFewfSnQFivXXjeLvMevykHLqR4H4MW2kOqHFeuOOg626DhwMa
```

**After (working):**
```bash
ADMIN_PASSWORD_HASH=\$2b\$10\$B0xHFewfSnQFivXXjeLvMevykHLqR4H4MW2kOqHFeuOOg626DhwMa
```

### 2. Remove Unnecessary Config

The `next.config.js` file had an `env` section that was attempting to embed the environment variable at build time, which wasn't needed for server actions:

```javascript
// Removed this:
const nextConfig = {
  env: {
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  },
}

// Changed to:
const nextConfig = {}
```

---

## Testing

✅ Verified with Playwright:
1. Navigate to Days page
2. Click "יום חדש" (New Day) button
3. Admin password dialog appears
4. Enter "admin123"
5. Password verification succeeds
6. Create day form appears

---

## Important Notes

- `.env.local` is correctly in `.gitignore` and should NEVER be committed
- When setting up a new environment, remember to escape `$` in bcrypt hashes
- This fix applies to any environment variable containing `$` characters
- The password hash corresponds to the password "admin123"

---

## Files Changed

1. `.env.local` - Escaped `$` characters (not committed - in `.gitignore`)
2. `next.config.js` - Already in correct state (no env config needed)

---

## Related Issues

This fix enables all admin-protected features:
- ✅ Create new visit days
- ✅ Manage products
- ✅ Export data to Excel
