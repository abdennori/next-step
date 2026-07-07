// script.js - نسخة تعمل بدون أخطاء وتعتمد على localStorage

// تعريف الدالة toggle في النطاق العام حتى تعمل onclick في HTML
window.toggle = function(header) {
  const card = header.closest('.card');
  if (!card) return;
  const isOpen = card.classList.contains('open');
  // إغلاق جميع البطاقات المفتوحة
  document.querySelectorAll('.card.open').forEach(c => {
    if (c !== card) c.classList.remove('open');
  });
  // تبديل حالة البطاقة الحالية
  if (!isOpen) card.classList.add('open');
  else card.classList.remove('open');
};

// انتظار تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
  // فتح البطاقة الأولى افتراضياً
  const firstCard = document.querySelector('.card');
  if (firstCard) firstCard.classList.add('open');

  // تأثير الظهور عند التمرير
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-card]').forEach(card => observer.observe(card));

  // ── دوال التخزين المحلي ──
  const STORAGE_KEY = 'registrations_local';

  function getRegistrations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  function saveRegistrations(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // دالة عرض الرسائل
  function showMessage(text, type = 'success') {
    const box = document.getElementById('msgBox');
    if (!box) return;
    box.className = `msg-box ${type}`;
    box.textContent = text;
    setTimeout(() => {
      box.className = 'msg-box';
      box.textContent = '';
    }, 5000);
  }

  // ── نموذج التسجيل ──
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const highSchool = document.getElementById('highSchool').value.trim();
      const branch = document.getElementById('branch').value;
      const wilaya = document.getElementById('wilaya').value;

      // التحقق من الحقول المطلوبة
      if (!fullName || !phone || !highSchool || !branch) {
        showMessage('❌ يرجى ملء جميع الحقول المطلوبة (*)', 'error');
        return;
      }
      if (phone.length < 6) {
        showMessage('❌ رقم الهاتف غير صحيح (أقل من 6 أرقام)', 'error');
        return;
      }

      // منع التكرار
      const registrations = getRegistrations();
      if (registrations.some(r => r.phone === phone)) {
        showMessage('⚠️ لقد قمت بالتسجيل مسبقًا.', 'warning');
        return;
      }

      // حفظ البيانات
      const newRecord = {
        fullName,
        phone,
        email,
        highSchool,
        branch,
        wilaya,
        registrationDate: new Date().toISOString()
      };
      registrations.push(newRecord);
      saveRegistrations(registrations);

      showMessage('✅ تم تسجيل حضورك بنجاح.', 'success');
      registerForm.reset();
    });
  }
});
