# הוראות התקנה - ניהול ביקורי בית

מדריך מפורט להתקנה והגדרה של מערכת ניהול ביקורי בית.

---

## דרישות מקדימות

### תוכנות נדרשות
- **Node.js** 18.0 ומעלה ([הורד כאן](https://nodejs.org))
- **npm** (מותקן אוטומטית עם Node.js)
- **Git** (אופציונלי, למפתחים)

### חשבונות נדרשים
- **Supabase Account** - [הרשם בחינם](https://supabase.com)
  - פרויקט חדש עם PostgreSQL database
  - ללא צורך בכרטיס אשראי לתכנית החינמית

---

## שלבי ההתקנה

### שלב 1: התקנת תלויות

1. **פתח Terminal/Command Prompt**

2. **נווט לתיקיית הפרויקט:**
```bash
cd path/to/yuval-for-home
```

3. **התקן את כל החבילות הנדרשות:**
```bash
npm install
```

**זמן משוער:** 2-3 דקות (תלוי במהירות האינטרנט)

**תוצאה צפויה:** התקנה של ~580 חבילות ללא שגיאות.

---

### שלב 2: הקמת Supabase Database

#### 2.1 יצירת פרויקט

1. **היכנס ל-[Supabase Dashboard](https://app.supabase.com)**

2. **לחץ על "New Project"**

3. **מלא את הפרטים:**
   - **Name:** בחר שם (למשל: "house-visits")
   - **Database Password:** צור סיסמה חזקה (שמור אותה!)
   - **Region:** בחר אזור קרוב (Europe West - London מומלץ)
   - **Pricing Plan:** Free

4. **לחץ "Create new project"**

**זמן משוער:** 1-2 דקות להקמת הפרויקט

#### 2.2 העתקת Credentials

1. **בדף הפרויקט, לחץ על "Settings" > "API"**

2. **העתק את הערכים הבאים:**
   - **Project URL** (מתחת ל-"Project URL")
   - **anon/public key** (מתחת ל-"Project API keys")
   - **service_role key** (⚠️ גם מתחת ל-"Project API keys", סמן "Reveal")

**⚠️ שים לב:** `service_role` מעניק גישה מלאה לDB - שמור אותו בסוד!

#### 2.3 הרצת Migration

1. **בדף הפרויקט, לחץ על "SQL Editor"**

2. **לחץ "New query"**

3. **פתח את הקובץ:**
```bash
cat supabase/migrations/001_initial_schema.sql
```

4. **העתק את כל התוכן והדבק ב-SQL Editor**

5. **לחץ "Run"**

**תוצאה צפויה:**
```
Success. No rows returned
```

6. **בדוק שהטבלאות נוצרו - הרץ:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

**צריך להופיע:**
- users
- visit_days
- products
- visits
- visit_products

---

### שלב 3: הגדרת משתני סביבה

#### 3.1 יצירת קובץ .env.local

1. **צור קובץ חדש בשם `.env.local` בתיקיית הבסיס:**
```bash
touch .env.local
```

2. **פתח את הקובץ בעורך טקסט**

3. **הדבק את התוכן הבא:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_PASSWORD_HASH=$2b$10$...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **החלף את הערכים:**
   - `NEXT_PUBLIC_SUPABASE_URL` - ה-Project URL שהעתקת
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ה-anon key שהעתקת
   - `SUPABASE_SERVICE_ROLE_KEY` - ה-service_role key שהעתקת
   - `ADMIN_PASSWORD_HASH` - ראה שלב 3.2

#### 3.2 יצירת Hash לסיסמת מנהל

1. **בחר סיסמה חזקה למנהל** (למשל: `MySecurePass123!`)

2. **הרץ בטרמינל:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD_HERE', 10, (err, hash) => console.log(hash));"
```

**החלף `YOUR_PASSWORD_HERE` בסיסמה שבחרת!**

3. **העתק את ה-hash שהודפס** (מתחיל ב-`$2b$10$...`)

4. **הדבק ב-`.env.local` במקום `$2b$10$...`**

**דוגמה:**
```env
ADMIN_PASSWORD_HASH=$2b$10$rXKZ8xGxJxGxJxGxJxGxJOm5YvGzQa1234567890abcdefghij
```

#### 3.3 בדיקת משתני סביבה

**ודא ש-`.env.local` לא יעלה ל-Git:**
```bash
cat .gitignore | grep .env.local
```

**צריך להופיע:** `.env.local`

---

### שלב 4: הרצת שרת פיתוח

1. **הרץ את שרת הפיתוח:**
```bash
npm run dev
```

2. **פתח דפדפן וגלוש ל:**
```
http://localhost:3000
```

**תוצאה צפויה:**
- עמוד התחברות בעברית
- רשימת משתמשים: יובל, שרה, דוד
- כפתור "התחבר"

3. **התחבר עם אחד השמות**

4. **אתה אמור להגיע לדף "ימי ביקור"**

---

## בדיקת ההתקנה

### בדיקה בסיסית

- [ ] שרת עובד על http://localhost:3000
- [ ] עמוד התחברות מוצג בעברית (RTL)
- [ ] ניתן לבחור משתמש ולהתחבר
- [ ] לאחר התחברות מגיעים לדף "ימי ביקור"
- [ ] ה-navbar מוצג עם שם המשתמש

### בדיקת סיסמת מנהל

1. **לחץ "יום חדש"**
2. **הזן את סיסמת המנהל שיצרת**
3. **אמור להיפתח דיאלוג יצירת יום**

אם זה עובד - ההתקנה הצליחה! ✅

---

## פתרון בעיות נפוצות

### שגיאה: "Cannot find module"

**פתרון:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### שגיאה: "Failed to connect to Supabase"

**בדוק:**
1. ה-URL ב-`.env.local` נכון (כולל `https://`)
2. המפתחות נכונים (ללא רווחים בתחילה/סוף)
3. הפרויקט ב-Supabase פעיל

**פתרון:**
```bash
# בדוק את המשתנים
echo $NEXT_PUBLIC_SUPABASE_URL
```

אם לא מודפס כלום - הקובץ `.env.local` לא נטען.

### שגיאה: "relation does not exist"

המייגרציה לא רצה בהצלחה.

**פתרון:**
1. היכנס ל-Supabase SQL Editor
2. הרץ `DROP TABLE IF EXISTS...` לכל הטבלאות
3. הרץ שוב את `001_initial_schema.sql`

### סיסמת מנהל לא עובדת

**בדוק:**
1. ה-hash ב-`.env.local` נכון (מתחיל ב-`$2b$10$`)
2. השתמשת באותה סיסמה שיצרת את ה-hash ממנה
3. השרת אתחל מחדש אחרי שינוי `.env.local`

**פתרון:**
```bash
# צור hash חדש
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NewPassword123', 10, (err, hash) => console.log(hash));"

# עדכן ב-.env.local
# אתחל שרת
npm run dev
```

### פורט 3000 תפוס

**שגיאה:** `Error: listen EADDRINUSE: address already in use :::3000`

**פתרון 1 - הרוג תהליך:**
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**פתרון 2 - שנה פורט:**
```bash
PORT=3001 npm run dev
```

---

## שדרוג מגרסה קודמת

אם יש לך גרסה ישנה של האפליקציה:

1. **גבה את `.env.local`**
```bash
cp .env.local .env.local.backup
```

2. **משוך עדכונים:**
```bash
git pull origin main
```

3. **התקן תלויות חדשות:**
```bash
npm install
```

4. **בדוק מייגרציות חדשות:**
```bash
ls supabase/migrations/
```

5. **הרץ מייגרציות חדשות ב-Supabase SQL Editor**

6. **אתחל שרת:**
```bash
npm run dev
```

---

## פריסה לייצור (Production)

### אפשרות 1: Vercel (מומלץ)

1. **התקן Vercel CLI:**
```bash
npm install -g vercel
```

2. **התחבר:**
```bash
vercel login
```

3. **פרוס:**
```bash
vercel
```

4. **הוסף משתני סביבה ב-Vercel Dashboard:**
   - Project Settings > Environment Variables
   - הוסף את כל המשתנים מ-`.env.local`
   - **שנה** `NEXT_PUBLIC_APP_URL` לכתובת הייצור

5. **פרוס שוב:**
```bash
vercel --prod
```

### אפשרות 2: Railway

1. **היכנס ל-[Railway](https://railway.app)**

2. **New Project > Deploy from GitHub repo**

3. **בחר את הריפו**

4. **הוסף משתני סביבה:**
   - Variables > Add Variable
   - הוסף את כל המשתנים מ-`.env.local`

5. **Deploy אוטומטית**

### אפשרות 3: Render

1. **היכנס ל-[Render](https://render.com)**

2. **New > Web Service**

3. **חבר GitHub repo**

4. **הגדרות:**
   - Build Command: `npm run build`
   - Start Command: `npm run start`

5. **הוסף Environment Variables**

---

## הוספת נתונים ראשוניים

### הוספת משתמשים

```sql
-- בSupabase SQL Editor
INSERT INTO users (name) VALUES
  ('משה'),
  ('רחל'),
  ('אברהם');
```

### הוספת מוצרים

```sql
INSERT INTO products (name) VALUES
  ('סל מתנה ב'),
  ('קפה'),
  ('עוגיות'),
  ('נרות');
```

### הוספת יום ביקור לדוגמה

```sql
INSERT INTO visit_days (date, area) VALUES
  ('2026-04-01', 'תל אביב'),
  ('2026-04-05', 'ירושלים');
```

---

## תחזוקה שוטפת

### גיבוי Database

**מומלץ מאוד!**

1. **Supabase Dashboard > Database > Backups**
2. **הפעל "Point in Time Recovery" (בתכנית Pro)**
3. **או: Export ידני מדי שבוע**

### עדכוני תלויות

```bash
# בדוק עדכונים
npm outdated

# עדכן
npm update

# עדכון major versions (זהירות!)
npm install <package>@latest
```

### ניטור

- **Supabase Dashboard > Reports** - צפייה בשימוש
- **Vercel Dashboard > Analytics** - ביצועים
- **Browser Console** - שגיאות client-side

---

## אבטחה

### חובה לייצור:

- [ ] סיסמת מנהל חזקה (8+ תווים, מספרים, סימנים)
- [ ] `service_role_key` לא נחשף (רק ב-`.env.local`)
- [ ] HTTPS מופעל (אוטומטי ב-Vercel/Railway)
- [ ] Row Level Security ב-Supabase (מתקדם)
- [ ] גיבויים קבועים

### מומלץ:

- [ ] Monitoring (Sentry, LogRocket)
- [ ] Rate limiting
- [ ] CORS מוגדר נכון
- [ ] CSP headers

---

## קבלת עזרה

### בעיות?

1. **בדוק את [TESTING_REPORT.md](./TESTING_REPORT.md)**
2. **חפש ב-Issues של הפרויקט**
3. **פתח Issue חדש עם:**
   - תיאור הבעיה
   - צילום מסך
   - שגיאות מהקונסול
   - מערכת ההפעלה

### משאבים

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS RTL](https://tailwindcss.com/docs/text-align)

---

**בהצלחה! 🎉**
