# House Visit Management System - Design Specification

**Date:** 2026-03-24
**Project:** YuvalForHome
**Status:** Approved

## Overview

A production-ready web application for managing house visit orders. Workers receive orders by phone and schedule visits to customer locations. The system manages visit days by area, tracks products delivered, handles payments, and exports visit data to Excel for route planning.

## Goals

- Enable workers to quickly add house visits from phone orders
- Organize visits by date and geographic area
- Track customer details, products, and payment status
- Calculate pricing based on product quantity
- Export visit data to Excel for daily route planning
- Simple authentication suitable for internal use (1-5 workers)

## Non-Goals (Future Enhancements)

- Geocoding addresses to coordinates
- Automatic route optimization
- Customer portal or self-service booking
- Payment processing integration
- Multi-language support

## Technology Stack

### Core Technologies
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **UI Components:** Shadcn/ui + Tailwind CSS
- **State Management:** React Context for user session
- **Forms:** React Hook Form + Zod validation
- **Excel Export:** SheetJS (xlsx)
- **Password Hashing:** bcryptjs
- **Deployment:** Railway or Render (free tier)

### Rationale
- **Next.js + Supabase:** Single codebase with server actions eliminates separate API layer, reducing boilerplate and maintenance burden
- **Shadcn/ui:** Components live in codebase (not node_modules), making them easy to understand and customize
- **Mobile-first:** Workers primarily use phones in field, admin uses desktop for exports
- **Free tier:** Small scale (1-5 workers, 20-50 visits/day) fits comfortably in free hosting limits

## Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Worker accounts for login and tracking who created each visit.

#### `visit_days`
```sql
CREATE TABLE visit_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, area)
);
```

**Purpose:** Represents a scheduled visit day in a specific area. Each day gets a dedicated page for managing visits.

**Constraint:** `UNIQUE(date, area)` prevents duplicate visit days for the same date and area, ensuring only one scheduled day per area per date.

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Catalog of gift items available for delivery. Products have no individual price—pricing is quantity-based.

**Examples:** "Gift Basket A", "Flowers", "Wine", "Chocolate Box"

#### `visits`
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_day_id UUID NOT NULL REFERENCES visit_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  floor TEXT NOT NULL,
  apartment TEXT NOT NULL,
  building_code TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bit')),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  total_price INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Individual customer visits with delivery details and payment tracking.

**All fields required:** Workers must collect complete information for successful delivery.

**Price calculation:** Stored as calculated value—base 500 + (product_count - 2) * 100 if product_count > 2.

#### `visit_products` (junction table)
```sql
CREATE TABLE visit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(visit_id, product_id)
);
```

**Purpose:** Many-to-many relationship between visits and products. Each visit can have multiple products, and changing product names in the products table reflects in all historical visits.

**Constraint:** `ON DELETE RESTRICT` on product_id prevents deletion of products that are referenced in any visit, preserving historical data integrity.

### Indexes

```sql
CREATE INDEX idx_visits_visit_day ON visits(visit_day_id);
CREATE INDEX idx_visits_created_at ON visits(created_at);
CREATE INDEX idx_visit_days_date ON visit_days(date);
CREATE INDEX idx_visit_products_visit ON visit_products(visit_id);
```

**Rationale:** Optimize common queries (visits for a day, date filtering, product lookups).

## Authentication & Authorization

### Authentication Model: Name-Based Login

**Worker login flow:**
1. Navigate to `/login`
2. Select name from dropdown (populated from `users` table)
3. Session stored in httpOnly cookie with user ID + name
4. Redirect to `/days`

**No password required for workers:** Internal use only, minimal security requirements.

### Authorization Model: Admin Password

**Admin actions** (create visit day, manage products, export Excel) require password verification:

1. User clicks admin action button
2. Modal prompts for admin password
3. Server action verifies password against `ADMIN_PASSWORD` environment variable
4. If valid, execute action; if invalid, show error
5. No persistent admin session—password required each time

**Rationale:** Simple two-tier access without role management complexity. Suitable for 1-5 users with trust-based environment.

### Session Management

- **Storage:** httpOnly cookies (more secure than localStorage)
- **Session lifetime:** 7 days of inactivity. Workers must re-login after expiration.
- **Cookie configuration:** httpOnly, secure (HTTPS only), sameSite=strict, maxAge: 7 days
- **Middleware:** Next.js middleware checks session before rendering protected routes
- **Public routes:** Only `/login`
- **Protected routes:** All others redirect to `/login` if no session

### Initial User Setup

Manually insert worker names into `users` table via Supabase dashboard:

```sql
INSERT INTO users (name) VALUES
  ('Yuval'),
  ('Sarah'),
  ('David');
```

Optional future enhancement: Admin page to manage users.

## Application Architecture

### Project Structure

```
/middleware.ts             # Next.js middleware for session validation (root level)
/app
  layout.tsx                 # Root layout with auth middleware
  /login
    page.tsx                 # Name selection login page
  /days
    page.tsx                 # List of visit days (today + future)
    /[id]
      page.tsx               # Single day: visits table + add/edit
  /admin
    /products
      page.tsx               # Manage products (admin password required)

/components
  /ui                        # Shadcn/ui components (installed via CLI)
    button.tsx
    dialog.tsx
    table.tsx
    select.tsx
    input.tsx
    checkbox.tsx
    toast.tsx
    ...
  LoginForm.tsx              # User name selection dropdown
  Navbar.tsx                 # Top navigation with user name + logout
  DaysList.tsx               # Table of visit days
  CreateDayDialog.tsx        # Modal for creating new visit day
  VisitsTable.tsx            # Table of visits for a specific day
  AddEditVisitDialog.tsx     # Modal form for adding/editing visit
  ProductsManager.tsx        # Products CRUD interface
  AdminPasswordPrompt.tsx    # Reusable admin password verification modal
  DeleteConfirmDialog.tsx    # Confirmation modal for destructive actions

/lib
  supabase.ts                # Supabase client setup
  auth.ts                    # Auth context + session helpers
  utils.ts                   # Price calculation, formatting helpers

/actions
  auth.ts                    # Server actions: login, logout, verifyAdmin
  days.ts                    # Server actions: createDay, getDays, getDay
  visits.ts                  # Server actions: createVisit, updateVisit, deleteVisit
  products.ts                # Server actions: getProducts, createProduct, deleteProduct
  export.ts                  # Server action: exportVisitsToExcel
```

### Server Actions Pattern

All data mutations and queries happen via Next.js server actions—no API routes needed.

**Example pattern:**

```typescript
// actions/visits.ts
'use server'

export async function createVisit(data: CreateVisitInput) {
  // 1. Validate session
  // 2. Validate data with Zod
  // 3. Calculate total_price
  // 4. Insert visit record
  // 5. Insert visit_products records
  // 6. Return success/error
}
```

**Benefits:**
- Type-safe from client to database
- No REST endpoint boilerplate
- Automatic error handling
- Easy to test and maintain

## Pages & Features

### `/login` - Login Page

**Purpose:** Select worker name to start session.

**UI:**
- App logo/title
- Dropdown with all user names
- "Login" button
- Mobile-optimized: large touch targets

**Flow:**
1. Fetch user names on page load
2. User selects name
3. Call `loginAction` server action
4. Set session cookie
5. Redirect to `/days`

---

### `/days` - Visit Days List

**Purpose:** View scheduled visit days and create new ones.

**Data displayed:**
- Table columns: Date, Area, # of Visits, Actions
- **Filter:** Show only today and future dates (exclude past)
- Sort: Date ascending (earliest first)
- Empty state: "No upcoming visit days. Create one to get started."

**Actions:**
- **View button:** Navigate to `/days/[id]`
- **Export button:** Trigger admin password prompt → download Excel
- **Create New Day button:** Trigger admin password prompt → open modal
- **Delete Day button** (admin only, optional): Trigger admin password prompt → show warning
  - If day has 0 visits: Show confirmation "Delete {area} - {date}?"
  - If day has visits: Show destructive confirmation "Delete {area} - {date}? This will permanently delete {count} visit(s). This cannot be undone."
  - On confirm → cascade delete day and all visits (enforced by ON DELETE CASCADE)

**Note:** Delete functionality is optional for MVP. Can be added later if needed.

**Create Day Modal:**
- Date picker (default: tomorrow)
- Area text input
- Submit/Cancel buttons
- Validation: Date cannot be in the past

---

### `/days/[id]` - Single Visit Day

**Purpose:** Manage visits for a specific day.

**Page header:**
- Title: "{Area} - {Date formatted}"
- Export Excel button (admin password prompt)
- Back to Days link

**Visits Table:**

Columns:
1. Name (customer)
2. Phone
3. Address
4. Floor
5. Apartment
6. Building Code
7. Products (comma-separated names)
8. Payment (Cash/Bit)
9. Paid (✓ or ✗)
10. Total (₪ amount)
11. Actions (Edit, Delete icons)

**Mobile view:** Horizontal scroll for table, or card layout for narrow screens (<640px).

**Mobile card layout specification (< 640px):**
Each visit displayed as a stacked card:
- **Line 1:** Name (bold, large text)
- **Line 2:** Address, Floor, Apartment (secondary text)
- **Line 3:** Products (comma-separated, italic)
- **Line 4:** Payment method icon + Paid status (✓/✗ with color)
- **Bottom right:** Total price (₪ amount, bold)
- **Top right:** Edit/Delete action icons

**Sort order:** Created timestamp ascending (order visits were added). Future: sort by address/route.

**Actions:**
- **Add Visit button:** Open add visit modal
- **Edit visit (row click or icon):** Open edit visit modal with pre-filled data
- **Delete visit (icon):** Show confirmation dialog → delete visit + visit_products

**Empty state:** "No visits yet. Add the first visit for this day."

---

### Add/Edit Visit Modal

**Modal title:** "Add Visit" or "Edit Visit"

**Form fields (all required):**

1. **Name** (text input)
2. **Phone** (text input)
3. **Address** (text input)
4. **Floor** (text input)
5. **Apartment** (text input)
6. **Building Code** (text input)
7. **Products** (multi-select dropdown or checkbox list)
   - Fetches all products from database
   - Can select multiple
   - Shows count: "3 products selected"
8. **Payment Method** (select dropdown)
   - Options: "Cash", "Bit"
9. **Is Paid** (checkbox)
   - Label: "Payment received"

**Total Price Display:**
- Below products field
- Real-time calculation as products change
- Format: "Total: ₪500" or "Total: ₪700"
- Read-only, calculated automatically

**Buttons:**
- Submit (disabled until all fields valid)
- Cancel

**Validation:**
- All fields required
- At least one product must be selected
- Phone format validation: Israeli phone numbers (validated with Zod custom regex)
  - Mobile: 10 digits starting with 05 (e.g., 0501234567, 050-123-4567)
  - Landline: 7-9 digits with area codes 02/03/04/08/09 (e.g., 02-1234567)
  - Also accept international format: +972-50-123-4567
  - Strip dashes/spaces before validation
  - Regex pattern: `^(\+972|0)[-\s]?([23489]|5[0-9])[-\s]?\d{3}[-\s]?\d{4}$` (after stripping spaces/dashes)

**Submit flow:**
1. Validate form
2. Calculate total_price: `500 + Math.max(0, productCount - 2) * 100`
3. Call `createVisit` or `updateVisit` server action
4. Close modal
5. Refresh visits table
6. Show success toast

---

### `/admin/products` - Products Management

**Purpose:** Admin creates and manages product catalog.

**Security:** Prompt for admin password when page loads. If incorrect, redirect to `/days`.

**UI:**
- Table with columns: Product Name, Actions
- "Add Product" button → inline form or modal
- Delete icon per product → confirmation dialog

**Add Product:**
- Single text input for name
- Submit → validate uniqueness → insert → refresh table

**Delete Product:**
- Check if product is used in any visits before allowing deletion
- If product has associated visits: Show error "Cannot delete '{product name}'. This product is used in {count} visit(s). Products with existing visits cannot be deleted."
- If product has no visits: Show confirmation "Delete {product name}?" → on confirm, delete product record
- **Database constraint:** `ON DELETE RESTRICT` on visit_products.product_id ensures referential integrity

---

## Business Logic

### Price Calculation Rule

**Formula:**
```
base_price = 500
extra_gifts = Math.max(0, product_count - 2)
total_price = base_price + (extra_gifts * 100)
```

**Examples:**
- 1 product → ₪500
- 2 products → ₪500
- 3 products → ₪600
- 5 products → ₪800

**Implementation location:** `lib/utils.ts` as pure function, used in:
1. Client-side: Real-time display in add/edit modal
2. Server-side: Validation and storage in database

**Why store calculated value?** Faster queries and Excel export without recalculating joins.

### Payment Methods

Two options: **Cash** or **Bit** (Israeli digital payment app, similar to Venmo).

**Payment Status (`is_paid`):**
- Checkbox in form
- Defaults to `false` (unpaid)
- Worker marks as paid when payment confirmed
- Visual indicator in table: ✓ (green) or ✗ (red/gray)

### Visit Days Filtering

**Rule:** `/days` page shows only **today and future visit days**. Past dates hidden.

**Implementation:**
```sql
SELECT * FROM visit_days
WHERE date >= CURRENT_DATE
ORDER BY date ASC;
```

**Rationale:** Workers focus on upcoming work; past days irrelevant for daily operations. Future enhancement: Archive view for historical data.

## Excel Export

### Trigger
Admin clicks "Export Excel" button on `/days/[id]` page → admin password prompt → generate and download file.

### File Structure

**Filename:** `visits-{area}-{YYYY-MM-DD}.xlsx`
**Example:** `visits-TelAviv-2026-03-25.xlsx`

**Sheet name:** "Visits"

**Columns:**
1. **Index** - Row number (1, 2, 3...)
2. **Name** - Customer name
3. **Phone** - Customer phone
4. **Address** - Full address
5. **Floor** - Floor number
6. **Apartment** - Apartment number
7. **Code** - Building code
8. **Products** - Comma-separated product names
9. **Payment** - "Cash" or "Bit"
10. **Paid** - "Yes" or "No"
11. **Total** - Price with ₪ symbol (e.g., "₪500")

### Data Query

```sql
SELECT
  v.id,
  v.name,
  v.phone,
  v.address,
  v.floor,
  v.apartment,
  v.building_code,
  v.payment_method,
  v.is_paid,
  v.total_price,
  v.created_at,
  STRING_AGG(p.name, ', ') as products
FROM visits v
LEFT JOIN visit_products vp ON v.id = vp.visit_id
LEFT JOIN products p ON vp.product_id = p.id
WHERE v.visit_day_id = $1
GROUP BY v.id
ORDER BY v.created_at ASC;
```

### Implementation

Use **SheetJS (xlsx)** library:

1. Server action fetches visits with products (aggregated)
2. Map to array of arrays (Excel rows)
3. Create workbook with styled headers
4. Return file buffer
5. Client downloads as blob

**Error handling:**
- **Empty day (0 visits):** Generate Excel with headers only and show message "Exported empty visit day (0 visits)"
- **Query timeout/failure:** Show error toast "Failed to export Excel. Please try again."
- **Large datasets:** Process in batches of 1000 rows if visit count exceeds 1000 (unlikely at current scale but future-proof)

**Sort order:** Creation time (for now). Future: optimized route order.

## UI/UX Design

### Design Principles

1. **Mobile-first:** Workers use phones in field—large touch targets, scrollable tables
2. **Desktop-optimized admin:** Excel export and products management easier on desktop
3. **Minimal clutter:** Focus on essential data, hide optional complexity
4. **Fast interactions:** Modal forms, inline editing, toast notifications
5. **Clear status indicators:** Visual cues for paid/unpaid, required fields

### Component Library: Shadcn/ui

**Why Shadcn/ui:**
- Components copy-pasted into `/components/ui`—easy to read and customize
- Built on Radix UI (unstyled primitives) + Tailwind CSS
- No black-box dependencies
- Excellent mobile responsiveness out of the box

**Key components used:**
- Dialog (modals)
- Table (data display)
- Button (actions)
- Input, Select, Checkbox (forms)
- Toast (notifications)

### Styling

- **Tailwind CSS** for utility classes
- **CSS variables** for theme colors (Shadcn default)
- **Responsive breakpoints:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

### Color Scheme

- **Neutral base:** White backgrounds, gray borders, dark text
- **Primary accent:** Blue for buttons and links
- **Status colors:**
  - Green: Paid (✓)
  - Red: Unpaid (✗), destructive actions (delete)
  - Yellow: Admin actions (password prompt)

### Mobile Adaptations

**Tables on mobile:**
- Horizontal scroll with sticky first column (customer name)
- OR: Card layout for narrow screens (< 640px)

**Forms:**
- Full-screen modals on mobile for better focus
- Large inputs (min-height: 44px for touch)
- Dropdowns use native select on mobile

**Navigation:**
- Hamburger menu if navigation grows
- Current user name + logout always visible

### Loading States

- **Skeleton loaders** for table data (Shadcn Skeleton component)
- **Button spinners** during form submission
- **Page-level loading** for route transitions (Next.js built-in)

### Toast Notifications

Use **Sonner** (Shadcn's recommended toast library):

**Success messages:**
- "Visit added successfully"
- "Product created"
- "Day exported to Excel"

**Error messages:**
- "Failed to create visit. Please try again."
- "Invalid admin password."

**Toast position:** Bottom-right on desktop, bottom-center on mobile.

## Future Enhancements

### Geocoding & Route Optimization

**Current state:** Visits sorted by creation time.

**Future goal:** Optimize delivery route to minimize driving time.

**Implementation approach:**

1. **Add geocoding:**
   - Add `lat` and `lng` columns to `visits` table
   - On visit create/edit, call geocoding API (Google Maps, Mapbox, or OpenStreetMap)
   - Store coordinates for each address
   - Handle errors (invalid address, API limits)

2. **Route optimization:**
   - Fetch all visits for a day with coordinates
   - Apply Traveling Salesman Problem (TSP) solver:
     - Simple: Nearest neighbor algorithm
     - Better: Use routing API (Google Directions, Mapbox Optimization)
   - Generate optimized order and assign `order_index` to each visit
   - Display visits in optimized order in table and Excel

3. **Manual reordering:**
   - Drag-and-drop table rows to manually adjust route
   - Store `order_index` in database

**Challenges:**
- Geocoding API costs (free tiers limited)
- Address ambiguity (multiple matches)
- Real-time traffic considerations
- Manual adjustments vs. automatic optimization

**Recommendation:** Start with manual sorting or simple nearest-neighbor, upgrade to API-based routing if scale increases.

### Other Potential Enhancements

- **Visit notes field:** Free-text notes per visit (e.g., "Leave at door")
- **Product quantities:** Track multiple units of same product (e.g., 2x Gift Basket A)
- **Visit status:** Pending, In Progress, Completed, Cancelled
- **Photos:** Upload delivery confirmation photos
- **Customer history:** View past orders for returning customers
- **Push notifications:** Alert workers when new visits added
- **Multi-language:** Hebrew interface for Israeli users
- **Analytics dashboard:** Visits per week, revenue, popular products

## Deployment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Admin password (bcrypt hash)
# Generate hash: echo -n "your-password" | npx bcrypt-cli
ADMIN_PASSWORD_HASH=$2b$10$abcdefghijklmnopqrstuv...

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

**Important:** `ADMIN_PASSWORD_HASH` should store a bcrypt hash (cost factor 10) of the admin password, not plain text. During setup:
1. Generate hash using bcrypt CLI: `npx bcrypt-cli "your-secure-password"`
2. Store hash in environment variable
3. In `verifyAdmin` server action, use `bcrypt.compare(inputPassword, ADMIN_PASSWORD_HASH)` to verify

### Deployment Platforms (Free Tier)

**Option 1: Railway**
- Connect GitHub repo
- Auto-deploy on push to main
- Free tier: 500 hours/month, 512MB RAM
- Easy environment variable management

**Option 2: Render**
- Similar to Railway
- Free tier: Spins down after 15 min inactivity (slower cold starts)
- 512MB RAM

**Database: Supabase**
- Free tier: 500MB database, 2GB bandwidth/month
- Plenty for 50 visits/day

### Build Configuration

**Next.js build:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

**Environment:** Node.js 18+

### Monitoring

- **Railway/Render dashboards:** Check logs, memory usage, uptime
- **Supabase dashboard:** Monitor database size, query performance
- **Error tracking:** Add Sentry if needed (optional)

## Security Considerations

### Threat Model

**Low-security internal app:** Trusted users, no sensitive customer data beyond phone numbers and addresses.

**Primary risks:**
1. Unauthorized access to admin functions (mitigated by admin password)
2. Data loss (mitigated by Supabase automatic backups)
3. Session hijacking (mitigated by httpOnly cookies)

### Security Measures

1. **Session cookies:** httpOnly, secure (HTTPS only), sameSite=strict, 7-day expiration
2. **Server-side validation:** All mutations validated with Zod schemas
3. **SQL injection prevention:** Supabase client uses parameterized queries
4. **Admin password:** Bcrypt hashed (cost 10), verified server-side with bcrypt.compare(), never sent to client
5. **HTTPS:** Enforced by Railway/Render in production

### Not Implemented (Acceptable for Use Case)

- Rate limiting (low traffic, trusted users)
- CSRF tokens (Next.js server actions have built-in protection)
- Input sanitization beyond validation (no HTML rendering of user input)
- Audit logs (can add later if needed)

## Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid user name redirects to /days
- [ ] Protected routes redirect to /login when logged out
- [ ] Logout clears session and redirects to /login

**Visit Days:**
- [ ] /days shows only today and future dates
- [ ] Create day with admin password works
- [ ] Create day with wrong password shows error
- [ ] Days sorted by date ascending

**Visits:**
- [ ] Add visit with all fields saves correctly
- [ ] Edit visit updates data
- [ ] Delete visit removes record and products
- [ ] Total price calculates correctly for 1, 2, 3, 5 products
- [ ] Products display as comma-separated list

**Products:**
- [ ] Admin products page requires password
- [ ] Add product with unique name works
- [ ] Duplicate product name shows error
- [ ] Delete product with visits shows error and prevents deletion
- [ ] Delete product without visits works correctly

**Excel Export:**
- [ ] Export requires admin password
- [ ] Excel file downloads with correct filename
- [ ] All columns present and formatted correctly
- [ ] Visits sorted by creation time

**Mobile:**
- [ ] Forms usable on phone screen
- [ ] Tables scrollable or use card layout
- [ ] Touch targets large enough (44px minimum)

### Automated Testing (Optional)

**Unit tests:**
- Price calculation function
- Date filtering logic
- Form validation schemas

**Integration tests:**
- Server actions with mock database
- Authentication flows

**E2E tests:**
- Playwright tests for critical flows (add visit, export)

**Note:** For small internal app, manual testing sufficient initially. Add automated tests if bugs emerge or team grows.

## Success Metrics

**Launch criteria:**
- All manual testing checklist items pass
- Admin can create visit days and products
- Workers can add/edit visits on mobile
- Excel export generates correct file format
- Deployed to production with HTTPS

**Usage goals:**
- 5 workers onboarded and trained
- 20-50 visits added per day
- Zero data loss incidents
- < 5 seconds page load time on 4G mobile

**Future optimization triggers:**
- If workers report difficulty finding addresses → implement geocoding
- If daily visits exceed 100 → optimize route sorting
- If users request features → prioritize based on impact

## Open Questions

None remaining—all clarified during brainstorming.

## Revision History

- **2026-03-24:** Initial design approved
- **2026-03-24:** Spec review fixes applied:
  - Added UNIQUE(date, area) constraint to visit_days table
  - Added ON DELETE RESTRICT to visit_products.product_id
  - Removed 0 products example from pricing (at least 1 product required)
  - Added Israeli phone validation specification
  - Added session expiration (7 days)
  - Added middleware.ts to project structure
  - Updated product deletion to prevent deletion of products with visits
  - Added Excel export error handling
  - Changed admin password to bcrypt hash
  - Added delete day functionality with cascade warning
  - Added mobile card layout specification
