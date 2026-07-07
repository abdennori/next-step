// استيراد التوابع من Firebase و المكتبات الخارجية
import {
  db,
  auth,
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "./firebase.js";

// استيراد مكتبات EmailJS و SheetJS (سيتم تحميلها عبر CDN)
// نضيفها ديناميكياً في بداية الملف
const scriptXLSX = document.createElement('script');
scriptXLSX.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
document.head.appendChild(scriptXLSX);

const scriptEmailJS = document.createElement('script');
scriptEmailJS.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
document.head.appendChild(scriptEmailJS);

// متغيرات عامة
let allRegistrations = [];
let currentEditId = null;

// ── تهيئة EmailJS ──
// 🔧 ضع معرفاتك هنا
const EMAILJS_SERVICE_ID = 'service_pq04m6l';
const EMAILJS_TEMPLATE_ID = 'template_9z9s2va';
const EMAILJS_PUBLIC_KEY = 'CsdpTVV1bEBM6M1Oc';

// ── عناصر DOM ──
const loginBox = document.getElementById('loginBox');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginMsg = document.getElementById('loginMsg');
const totalCount = document.getElementById('totalCount');
const tableBody = document.getElementById('adminTableBody');
const searchName = document.getElementById('searchName');
const searchPhone = document.getElementById('searchPhone');
const searchSchool = document.getElementById('searchSchool');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const sendEmailBtn = document.getElementById('sendEmailBtn');

// عناصر التعديل
const editOverlay = document.getElementById('editOverlay');
const editForm = document.getElementById('editForm');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editFullName = document.getElementById('editFullName');
const editPhone = document.getElementById('editPhone');
const editEmail = document.getElementById('editEmail');
const editHighSchool = document.getElementById('editHighSchool');
const editBranch = document.getElementById('editBranch');
const editWilaya = document.getElementById('editWilaya');

// ── مراقبة حالة المصادقة ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    // المستخدم مسجل الدخول
    loginBox.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadRegistrations();
  } else {
    loginBox.classList.remove('hidden');
    adminPanel.classList.add('hidden');
  }
});

// ── تسجيل الدخول ──
loginBtn.addEventListener('click', async () => {
  const email = adminEmail.value.trim();
  const password = adminPassword.value.trim();

  if (!email || !password) {
    loginMsg.textContent = '❌ يرجى إدخال البريد وكلمة المرور.';
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = '';
    adminEmail.value = '';
    adminPassword.value = '';
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    loginMsg.textContent = '❌ البريد أو كلمة المرور غير صحيحة.';
  }
});

// ── تسجيل الخروج ──
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

// ── تحميل جميع التسجيلات من Firestore ──
async function loadRegistrations() {
  try {
    const querySnapshot = await getDocs(collection(db, 'registrations'));
    allRegistrations = [];
    querySnapshot.forEach((doc) => {
      allRegistrations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    // ترتيب حسب تاريخ التسجيل (الأحدث أولاً)
    allRegistrations.sort((a, b) => {
      return new Date(b.registeredAt) - new Date(a.registeredAt);
    });
    updateTotalCount();
    renderTable(allRegistrations);
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);">حدث خطأ في تحميل البيانات.</td></tr>`;
  }
}

// ── تحديث الإحصاء ──
function updateTotalCount() {
  totalCount.textContent = allRegistrations.length;
}

// ── عرض الجدول مع إمكانية البحث ──
function renderTable(data) {
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--muted);">لا توجد بيانات.</td></tr>`;
    return;
  }

  let html = '';
  data.forEach((item, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.fullName || '')}</td>
        <td>${escapeHtml(item.phone || '')}</td>
        <td>${escapeHtml(item.email || '')}</td>
        <td>${escapeHtml(item.highSchool || '')}</td>
        <td>${escapeHtml(item.branch || '')}</td>
        <td>${escapeHtml(item.wilaya || '')}</td>
        <td>${item.registeredAt ? new Date(item.registeredAt).toLocaleString('ar') : ''}</td>
        <td style="text-align:center;">
          <div class="admin-actions">
            <button class="edit-btn" data-id="${item.id}" title="تعديل">✏️</button>
            <button class="delete-btn" data-id="${item.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });
  tableBody.innerHTML = html;

  // ربط أحداث الأزرار
  tableBody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditForm(btn.dataset.id));
  });
  tableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteRegistration(btn.dataset.id));
  });
}

// ── دالة مساعدة لـ escape HTML ──
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── البحث (تصفية حسب الاسم، الهاتف، الثانوية) ──
function filterRegistrations() {
  const nameFilter = searchName.value.trim().toLowerCase();
  const phoneFilter = searchPhone.value.trim();
  const schoolFilter = searchSchool.value.trim().toLowerCase();

  let filtered = allRegistrations.filter(item => {
    const matchName = item.fullName && item.fullName.toLowerCase().includes(nameFilter);
    const matchPhone = item.phone && item.phone.includes(phoneFilter);
    const matchSchool = item.highSchool && item.highSchool.toLowerCase().includes(schoolFilter);
    return matchName && matchPhone && matchSchool;
  });
  renderTable(filtered);
}

searchName.addEventListener('input', filterRegistrations);
searchPhone.addEventListener('input', filterRegistrations);
searchSchool.addEventListener('input', filterRegistrations);

// ── حذف تسجيل ──
async function deleteRegistration(id) {
  if (!confirm('هل أنت متأكد من حذف هذا التسجيل؟')) return;

  try {
    await deleteDoc(doc(db, 'registrations', id));
    // إزالة من القائمة المحلية
    allRegistrations = allRegistrations.filter(item => item.id !== id);
    updateTotalCount();
    filterRegistrations(); // إعادة عرض الجدول المفلتر
  } catch (error) {
    console.error('خطأ في الحذف:', error);
    alert('حدث خطأ أثناء الحذف.');
  }
}

// ── فتح نموذج التعديل ──
function openEditForm(id) {
  const item = allRegistrations.find(r => r.id === id);
  if (!item) return;

  currentEditId = id;
  editFullName.value = item.fullName || '';
  editPhone.value = item.phone || '';
  editEmail.value = item.email || '';
  editHighSchool.value = item.highSchool || '';
  editBranch.value = item.branch || '';
  editWilaya.value = item.wilaya || '';

  editOverlay.classList.remove('hidden');
}

// ── إغلاق نموذج التعديل ──
function closeEditForm() {
  editOverlay.classList.add('hidden');
  currentEditId = null;
}

cancelEditBtn.addEventListener('click', closeEditForm);

// ── حفظ التعديلات ──
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentEditId) return;

  const updatedData = {
    fullName: editFullName.value.trim(),
    phone: editPhone.value.trim(),
    email: editEmail.value.trim(),
    highSchool: editHighSchool.value.trim(),
    branch: editBranch.value,
    wilaya: editWilaya.value.trim()
  };

  // التحقق من الحقول المطلوبة
  if (!updatedData.fullName || !updatedData.phone || !updatedData.highSchool || !updatedData.branch) {
    alert('❌ يرجى ملء الحقول المطلوبة.');
    return;
  }

  try {
    await updateDoc(doc(db, 'registrations', currentEditId), updatedData);
    // تحديث في القائمة المحلية
    const index = allRegistrations.findIndex(r => r.id === currentEditId);
    if (index !== -1) {
      allRegistrations[index] = { ...allRegistrations[index], ...updatedData };
    }
    filterRegistrations();
    closeEditForm();
  } catch (error) {
    console.error('خطأ في التعديل:', error);
    alert('حدث خطأ أثناء التعديل.');
  }
});

// ── تصدير Excel باستخدام SheetJS ──
function exportExcel() {
  if (allRegistrations.length === 0) {
    alert('لا توجد بيانات لتصديرها.');
    return;
  }

  // تجهيز البيانات للتصدير
  const exportData = allRegistrations.map((item, index) => ({
    'رقم': index + 1,
    'الاسم الكامل': item.fullName || '',
    'رقم الهاتف': item.phone || '',
    'البريد الإلكتروني': item.email || '',
    'الثانوية': item.highSchool || '',
    'الشعبة': item.branch || '',
    'الولاية': item.wilaya || '',
    'تاريخ التسجيل': item.registeredAt ? new Date(item.registeredAt).toLocaleString('ar') : ''
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, 'التسجيلات');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // إنشاء ملف وتحميله
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `التسجيلات_${new Date().toISOString().slice(0,10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}

exportExcelBtn.addEventListener('click', exportExcel);

// ── إرسال التقرير عبر EmailJS ──
async function sendEmailReport() {
  if (allRegistrations.length === 0) {
    alert('لا توجد بيانات لإرسالها.');
    return;
  }

  // ننتظر تحميل مكتبة EmailJS
  if (typeof emailjs === 'undefined') {
    alert('❌ مكتبة EmailJS لم يتم تحميلها بعد. حاول مرة أخرى.');
    return;
  }

  try {
    // تهيئة EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // تحويل البيانات إلى جدول HTML بسيط للبريد
    let tableRows = '';
    allRegistrations.forEach((item, index) => {
      tableRows += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.fullName || ''}</td>
          <td>${item.phone || ''}</td>
          <td>${item.email || ''}</td>
          <td>${item.highSchool || ''}</td>
          <td>${item.branch || ''}</td>
          <td>${item.wilaya || ''}</td>
          <td>${item.registeredAt ? new Date(item.registeredAt).toLocaleString('ar') : ''}</td>
        </tr>
      `;
    });

    const htmlTable = `
      <h3>📊 تقرير التسجيلات - ${new Date().toLocaleString('ar')}</h3>
      <p>إجمالي المسجلين: ${allRegistrations.length}</p>
      <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;">
        <thead style="background:#1A2B5E;color:white;">
          <tr>
            <th>#</th><th>الاسم</th><th>الهاتف</th><th>البريد</th>
            <th>الثانوية</th><th>الشعبة</th><th>الولاية</th><th>تاريخ التسجيل</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    // إرسال البريد
    const templateParams = {
      to_email: 'organizer@example.com', // 🔧 غيّر إلى بريد المنظم
      subject: `تقرير التسجيلات - ${new Date().toLocaleDateString('ar')}`,
      message: htmlTable
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    alert('✅ تم إرسال التقرير بنجاح إلى البريد الإلكتروني.');
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    alert('❌ فشل إرسال البريد. تأكد من إعدادات EmailJS.');
  }
}

sendEmailBtn.addEventListener('click', sendEmailReport);

// ── إغلاق نموذج التعديل عند الضغط خارج الإطار ──
editOverlay.addEventListener('click', (e) => {
  if (e.target === editOverlay) closeEditForm();
});
