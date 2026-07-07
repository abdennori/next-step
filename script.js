// script.js - نسخة مع لوحة تحكم مسؤول بكلمة مرور

// تعريف toggle في النطاق العام
window.toggle = function(header) {
  const card = header.closest('.card');
  if (!card) return;
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.card.open').forEach(c => {
    if (c !== card) c.classList.remove('open');
  });
  if (!isOpen) card.classList.add('open');
  else card.classList.remove('open');
};

// انتظار تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
  // فتح البطاقة الأولى
  const firstCard = document.querySelector('.card');
  if (firstCard) firstCard.classList.add('open');

  // تأثير الظهور
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

      if (!fullName || !phone || !highSchool || !branch) {
        showMessage('❌ يرجى ملء جميع الحقول المطلوبة (*)', 'error');
        return;
      }
      if (phone.length < 6) {
        showMessage('❌ رقم الهاتف غير صحيح (أقل من 6 أرقام)', 'error');
        return;
      }

      const registrations = getRegistrations();
      if (registrations.some(r => r.phone === phone)) {
        showMessage('⚠️ لقد قمت بالتسجيل مسبقًا.', 'warning');
        return;
      }

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
      updateAdminPanel(); // تحديث لوحة المسؤول إذا كانت مفتوحة
    });
  }

  // ── لوحة تحكم المسؤول ──
  const adminToggleBtn = document.getElementById('adminToggleBtn');
  const adminPanel = document.getElementById('adminPanel');
  const adminTableBody = document.getElementById('adminTableBody');
  const adminSearch = document.getElementById('adminSearch');
  const adminCount = document.getElementById('adminCount');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  let adminPassword = 'admin123'; // كلمة المرور (يمكن تغييرها)

  // إظهار/إخفاء اللوحة مع طلب كلمة المرور
  adminToggleBtn.addEventListener('click', function() {
    if (adminPanel.style.display === 'block') {
      adminPanel.style.display = 'none';
      return;
    }
    // طلب كلمة المرور
    const pwd = prompt('🔑 أدخل كلمة المرور للمسؤول:');
    if (pwd === adminPassword) {
      adminPanel.style.display = 'block';
      updateAdminPanel();
    } else if (pwd !== null) {
      alert('❌ كلمة المرور غير صحيحة.');
    }
  });

  // تحديث الجدول
  function updateAdminPanel() {
    const list = getRegistrations();
    adminCount.textContent = list.length;

    // تطبيق البحث
    const searchTerm = adminSearch.value.trim().toLowerCase();
    let filtered = list;
    if (searchTerm) {
      filtered = list.filter(r =>
        (r.fullName && r.fullName.toLowerCase().includes(searchTerm)) ||
        (r.phone && r.phone.toLowerCase().includes(searchTerm))
      );
    }

    if (filtered.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--muted);">لا يوجد مسجلون</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach((item, index) => {
      html += `
        <tr>
          <td style="padding:6px 8px;">${index + 1}</td>
          <td style="padding:6px 8px;">${escapeHtml(item.fullName)}</td>
          <td style="padding:6px 8px;">${escapeHtml(item.phone)}</td>
          <td style="padding:6px 8px;">${escapeHtml(item.email) || '-'}</td>
          <td style="padding:6px 8px;">${escapeHtml(item.highSchool)}</td>
          <td style="padding:6px 8px;">${escapeHtml(item.branch)}</td>
          <td style="padding:6px 8px;">${escapeHtml(item.wilaya) || '-'}</td>
          <td style="text-align:center;padding:6px 8px;">
            <button class="delete-one-btn" data-phone="${item.phone}" style="background:#ef4444;color:white;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;">✕</button>
          </td>
        </tr>
      `;
    });
    adminTableBody.innerHTML = html;

    // أحداث الحذف الفردي
    adminTableBody.querySelectorAll('.delete-one-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const phone = this.dataset.phone;
        if (confirm(`هل تريد حذف تسجيل رقم الهاتف ${phone}؟`)) {
          let list = getRegistrations();
          list = list.filter(r => r.phone !== phone);
          saveRegistrations(list);
          updateAdminPanel();
          // تحديث أي إحصائيات أخرى إذا وجدت
        }
      });
    });
  }

  // دالة مساعدة لتفادي حقن HTML
  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // البحث
  adminSearch.addEventListener('input', updateAdminPanel);

  // تصدير CSV
  exportCsvBtn.addEventListener('click', function() {
    const list = getRegistrations();
    if (list.length === 0) {
      alert('لا يوجد بيانات لتصديرها.');
      return;
    }
    const headers = ['الاسم', 'الهاتف', 'البريد', 'الثانوية', 'الشعبة', 'الولاية', 'تاريخ التسجيل'];
    const rows = list.map(r => [
      r.fullName || '',
      r.phone || '',
      r.email || '',
      r.highSchool || '',
      r.branch || '',
      r.wilaya || '',
      r.registrationDate ? new Date(r.registrationDate).toLocaleString('ar') : ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `المسجلون_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // مسح الكل
  clearAllBtn.addEventListener('click', function() {
    if (confirm('⚠️ هل أنت متأكد من حذف جميع المسجلين نهائياً؟')) {
      saveRegistrations([]);
      updateAdminPanel();
    }
  });
});
