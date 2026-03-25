# Bug Report - House Visits Management App
**Date**: 2026-03-25
**Testing Method**: End-to-end testing with Playwright MCP

## Summary
Found **7 critical bugs** during comprehensive testing of all user flows. The most severe issues are admin password verification (completely broken) and visit form validation (all fields fail validation).

---

## 🔴 CRITICAL BUGS (Must Fix Immediately)

### Bug #5: Admin Password Verification Completely Broken
**Severity**: CRITICAL
**Status**: Blocks all admin operations
**Location**: `actions/auth.ts` - `verifyAdminPassword()`

**Description**:
Admin password verification fails with 500 Internal Server Error for all admin-protected operations, even with correct password ("admin123").

**Affected Features**:
- Creating new visit days
- Managing products (add/delete)
- Exporting to Excel

**Steps to Reproduce**:
1. Login successfully
2. Click "יום חדש" (New Day)
3. Enter admin password "admin123"
4. Click "אישור"
5. Error: "שגיאה בבדיקת סיסמה" + 500 Internal Server Error

**Expected**: Password should verify successfully
**Actual**: Server returns 500 error, verification fails

**Error Message**:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

**Impact**:
- Cannot create new visit days
- Cannot manage products
- Cannot export to Excel
- **All admin features are completely unusable**

**Likely Cause**:
- Environment variable `ADMIN_PASSWORD_HASH` may be incorrect format
- bcrypt comparison may be failing
- The hash in `.env.local` might not match the "admin123" password

**Recommendation**:
1. Verify the bcrypt hash in `.env.local` matches "admin123"
2. Add server-side logging to `verifyAdminPassword()` to see actual error
3. Test bcrypt.compare() with the stored hash

---

### Bug #7: Visit Form Validation Completely Broken
**Severity**: CRITICAL
**Status**: Blocks adding/editing visits
**Location**: `components/add-edit-visit-dialog.tsx` - form validation

**Description**:
When submitting the visit form, all fields show validation error "Invalid input: expected string, received undefined" even when all fields are correctly filled.

**Steps to Reproduce**:
1. Login successfully
2. Navigate to a day detail page
3. Click "הוסף ביקור" (Add Visit)
4. Fill all required fields:
   - שם: "משה כהן"
   - טלפון: "0501234567"
   - כתובת: "רחוב הרצל 10"
   - קומה: "3"
   - דירה: "12"
   - קוד בניין: "1234"
   - Select 3 products
   - Check "שולם"
5. Click "שמור" (Save)
6. All fields show error: "Invalid input: expected string, received undefined"

**Expected**: Form should validate and save the visit
**Actual**: All fields show validation errors despite being filled

**Impact**:
- **Cannot add any visits to the system**
- **Cannot edit existing visits**
- Core functionality is completely broken

**Likely Cause**:
- React Hook Form `watch()` or `getValues()` not returning field values
- Form field `name` attributes may not match schema keys
- Zod schema validation may be checking wrong field names

**Recommendation**:
1. Check that all form fields have correct `name` attributes
2. Verify React Hook Form registration is working
3. Add console.log to see what data is being submitted
4. Check if field names match the Zod schema keys

---

## 🟡 HIGH PRIORITY BUGS

### Bug #4: Navbar Doesn't Appear Immediately After Login
**Severity**: HIGH
**Status**: Poor UX, authentication state issue
**Location**: `components/navbar.tsx` + `lib/auth.tsx`

**Description**:
After successful login, the navbar doesn't appear immediately. It only shows up after navigating to another page or after several seconds delay.

**Steps to Reproduce**:
1. Clear cookies and navigate to app
2. Login with any user
3. Redirected to `/days` page
4. **Navbar is missing** - no user greeting, no navigation links, no logout button
5. Navigate to `/admin/products`
6. Navbar suddenly appears

**Expected**: Navbar should appear immediately after login
**Actual**: Navbar is missing on first page load after login

**Root Cause**:
The `Navbar` component checks `if (isLoading || !user) return null`, but the AuthProvider's `checkSession()` runs async. During this time, `isLoading` is true, so navbar doesn't render.

**Impact**:
- Users see incomplete UI after login
- No way to navigate or logout until navbar appears
- Confusing user experience

**Recommendation**:
1. Show a loading skeleton for navbar while `isLoading` is true
2. Or ensure session check completes before redirecting from login
3. Or add a small delay before navbar checks auth state

---

### Bug #3: Login Form Shows User ID Instead of Name
**Severity**: HIGH
**Status**: Confusing UX
**Location**: `components/login-form.tsx`

**Description**:
When selecting a user from the dropdown, the combobox displays the user's UUID instead of their name.

**Steps to Reproduce**:
1. Open login page
2. Click on user dropdown
3. Select "אופק" from the list
4. Combobox shows: `d1606a2e-d6aa-41d2-a3be-0fe0b44d02f5` (UUID)

**Expected**: Should display "אופק" (the user's name)
**Actual**: Displays the user's UUID

**Impact**:
- Very confusing for users
- Looks unprofessional
- Users can't confirm they selected the right person

**Recommendation**:
- Fix the Select component's value display to show `user.name` instead of `user.id`
- Check Shadcn Select component's `value` vs `displayValue` configuration

---

### Bug #6: Payment Method Shows English Value "cash"
**Severity**: MEDIUM
**Status**: Inconsistent UI
**Location**: `components/add-edit-visit-dialog.tsx`

**Description**:
In the visit form, the payment method combobox displays "cash" (English) instead of "מזומן" (Hebrew).

**Steps to Reproduce**:
1. Open visit creation form
2. Look at "אמצעי תשלום" (Payment Method) field
3. Default value shows "cash" in English

**Expected**: Should display "מזומן" (Hebrew translation)
**Actual**: Shows "cash" in English

**Impact**:
- Inconsistent with Hebrew RTL interface
- Breaks language consistency
- Minor but noticeable UX issue

**Recommendation**:
- Map payment method values to Hebrew labels in the Select component
- Use display value transformation: `cash` → `מזומן`, `bit` → `ביט`

---

## 🟢 LOW PRIORITY / WARNINGS

### Issue #8: React Ref Warning in Dialog Components
**Severity**: LOW
**Status**: Console warning, no functional impact

**Description**:
React warns about function components being given refs in DialogClose components.

**Console Error**:
```
Warning: Function components cannot be given refs.
Attempts to access this ref will fail.
Did you mean to use React.forwardRef()?
Check the render method of `DialogClose`.
```

**Impact**:
- No functional impact
- Console pollution
- May cause issues in React strict mode

**Recommendation**:
- Wrap Button component in Dialog with `React.forwardRef()`
- Or update Shadcn UI components to latest version

---

## ✅ WORKING FEATURES (Tested Successfully)

1. ✅ **Login Flow**: User selection and authentication works
2. ✅ **Logout**: Redirects to login correctly
3. ✅ **Navigation**: Links between pages work
4. ✅ **Days List**: Displays existing days correctly
5. ✅ **Day Detail**: Shows day information and visits placeholder
6. ✅ **Price Calculation**: Correctly calculates ₪500 base + ₪100 per extra product
7. ✅ **Middleware**: Redirects unauthenticated users to login
8. ✅ **Session Persistence**: Login session persists across page refreshes

---

## Testing Coverage

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ PASS | Bug #3 (shows UUID) |
| Logout | ✅ PASS | Works correctly |
| Navbar | ⚠️ PARTIAL | Bug #4 (delayed appearance) |
| Days List | ✅ PASS | Displays correctly |
| Create Day | ❌ FAIL | Bug #5 (admin password broken) |
| Day Detail | ✅ PASS | Loads correctly |
| Add Visit | ❌ FAIL | Bug #7 (validation broken) |
| Products Management | ❌ FAIL | Bug #5 (admin password broken) |
| Excel Export | ❌ FAIL | Bug #5 (admin password broken) |
| Price Calculation | ✅ PASS | Correct logic |
| Mobile Responsive | ⚠️ NOT TESTED | Requires viewport testing |

---

## Recommended Fix Priority

### 🚨 **URGENT (Fix Today)**:
1. **Bug #5** - Admin password verification (blocks all admin features)
2. **Bug #7** - Visit form validation (blocks core functionality)

### ⚡ **HIGH (Fix This Week)**:
3. **Bug #4** - Navbar loading delay
4. **Bug #3** - Login dropdown showing UUID

### 📋 **MEDIUM (Fix When Possible)**:
5. **Bug #6** - Payment method English text
6. **Issue #8** - React ref warnings

---

## Next Steps

1. **Immediate**: Investigate and fix Bug #5 (admin password)
2. **Immediate**: Investigate and fix Bug #7 (visit form)
3. Add server-side error logging to see actual errors
4. Add form state debugging to visit dialog
5. Run full test suite again after fixes
6. Test on mobile devices (responsive layout)

---

## Environment
- **Browser**: Chromium (Playwright)
- **Testing Date**: 2026-03-25
- **App Version**: Latest (after Task 14 completion)
- **Node.js**: 18+
- **Database**: Supabase
