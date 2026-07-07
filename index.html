// استيراد التوابع من Firebase
import {
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "./firebase.js";

/**
 * تسجيل طالب جديد في Firestore
 * - التحقق من الحقول الإجبارية
 * - منع التكرار بناءً على رقم الهاتف
 * - عرض رسائل نجاح / خطأ
 */
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registrationForm');
  const msgBox = document.getElementById('regMsg');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // جلب القيم
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const highSchool = document.getElementById('highSchool').value.trim();
    const branch = document.getElementById('branch').value;
    const wilaya = document.getElementById('wilaya').value.trim();

    // التحقق من الحقول المطلوبة
    if (!fullName || !phone || !highSchool || !branch) {
      showMessage('❌ يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، الثانوية، الشعبة).', 'error');
      return;
    }

    // التحقق من صحة رقم الهاتف (مثال: 10 أرقام على الأقل)
    if (phone.length < 6) {
      showMessage('❌ رقم الهاتف غير صحيح.', 'error');
      return;
    }

    try {
      // 1. التحقق من تكرار رقم الهاتف
      const q = query(collection(db, "registrations"), where("phone", "==", phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        showMessage('⚠️ لقد قمت بالتسجيل مسبقًا.', 'error');
        return;
      }

      // 2. إضافة المستند إلى Firestore
      await addDoc(collection(db, "registrations"), {
        fullName,
        phone,
        email,
        highSchool,
        branch,
        wilaya,
        registeredAt: new Date().toISOString()
      });

      // 3. رسالة نجاح
      showMessage('✅ تم تسجيل حضورك بنجاح.', 'success');

      // 4. تفريغ النموذج
      form.reset();

    } catch (error) {
      console.error("خطأ في التسجيل:", error);
      showMessage('❌ حدث خطأ أثناء التسجيل. حاول مرة أخرى لاحقاً.', 'error');
    }
  });

  // دالة مساعدة لعرض الرسائل
  function showMessage(text, type) {
    msgBox.className = 'msg-box ' + (type || '');
    msgBox.textContent = text;
    // اختفاء الرسالة بعد 6 ثوانٍ
    clearTimeout(window.msgTimeout);
    window.msgTimeout = setTimeout(() => {
      msgBox.className = 'msg-box';
      msgBox.textContent = '';
    }, 6000);
  }
});
