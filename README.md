# منصة فنيي المنازل الذكية · عمان

نسخة تجريبية تعمل على GitHub Pages (استضافة مجانية) وقاعدة بيانات Firebase (مجانية) — بدون أي دفع.

## 1. تجهيز مشروع Firebase

1. روح إلى https://console.firebase.google.com
2. أنشئ مشروع جديد (عطّل Google Analytics لتبسيط الأمور)
3. من القائمة الجانبية: **Build → Firestore Database → Create database**
4. اختر **Start in test mode** ثم اختر أقرب موقع سيرفر لك
5. من صفحة المشروع الرئيسية اضغط على أيقونة **</>** لإضافة تطبيق ويب، وسجّله
6. انسخ كود الإعداد (firebaseConfig) الذي يظهر لك

## 2. ملف الإعداد (تم تجهيزه مسبقًا ✅)

ملف `src/firebase.js` فيه بالفعل بيانات مشروعك (`technical-oman-e7b37`) — ما تحتاج تعدّل شي، إلا إذا سويت مشروع Firebase جديد لاحقًا.

## 3. رفع الكود على GitHub

```bash
git init
git add .
git commit -m "أول نسخة من المنصة"
git branch -M main
git remote add origin https://github.com/USERNAME/Technical-Oman.git
git push -u origin main
```
(بدّل `USERNAME` باسم المستخدم عندك في GitHub)

## 4. تفعيل GitHub Pages

1. روح لمستودعك على GitHub → **Settings → Pages**
2. تحت **Build and deployment** اختر **Source: GitHub Actions**
3. بعد أول Push، سيشتغل الـ workflow الموجود في `.github/workflows/deploy.yml` تلقائيًا ويبني وينشر الموقع
4. بعد دقيقة أو دقيقتين، رابط موقعك بيصير:
   `https://USERNAME.github.io/Technical-Oman/`

## 5. تشغيل المشروع محليًا (اختياري، للتجربة قبل الرفع)

```bash
npm install
npm run dev
```

## بيانات الدخول الافتراضية للإدارة

- اسم المستخدم: `admin`
- الرقم السري: `admin123`

⚠️ **تنبيه أمان مهم:** هذا النظام مناسب للتجربة فقط. كلمات مرور العملاء والفنيين غير مشفّرة، والتحقق يصير من المتصفح مباشرة (لا يوجد سيرفر خلفي). لا تستخدمه لبيانات حساسة حقيقية أو تطلقه للجمهور العام قبل الانتقال لنظام مصادقة حقيقي مثل Firebase Authentication.

## ملاحظة حول قواعد Firestore

وضع "Test mode" يسمح بالقراءة/الكتابة لمدة 30 يوم فقط، بعدها يوقف الوصول تلقائيًا. لتمديد ذلك أو تجهيزه للاستخدام الحقيقي، عدّل القواعد من **Firestore Database → Rules**.
