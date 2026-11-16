/**
 * Naishvi Event Empire - Admin Dashboard Controller
 * Powers Steps 6, 7, and 9: Booking intake, Quotation generation, and Vendor assignment.
 * Includes Master Password Authentication & Session Protection.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
});

// Authentication System
function initAdminAuth() {
  const isAuth = window.ncStore?.checkAdminAuth();
  const authModal = document.getElementById('adminLoginScreen');
  const dashboardContent = document.getElementById('adminDashboardContent');

  if (!isAuth) {
    if (authModal) authModal.style.display = 'flex';
    if (dashboardContent) dashboardContent.style.display = 'none';
  } else {
    if (authModal) authModal.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
    bootAdminDashboard();
  }

  // Handle Login Form
  document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('adminInputPassword').value;
    const errorEl = document.getElementById('adminAuthError');

    if (window.ncStore.loginAdmin(pass)) {
      if (authModal) authModal.style.display = 'none';
      if (dashboardContent) dashboardContent.style.display = 'block';
      if (errorEl) errorEl.style.display = 'none';
      bootAdminDashboard();
    } else {
      if (errorEl) {
        errorEl.textContent = 'Incorrect admin password. Please try again.';
        errorEl.style.display = 'block';
      }
    }
  });
}

window.toggleAdminPasswordVisibility = function() {
  const input = document.getElementById('adminInputPassword');
  const icon = document.getElementById('togglePasswordIcon');
  const iconInline = document.getElementById('togglePasswordIconInline');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
    if (iconInline) { iconInline.classList.remove('fa-eye'); iconInline.classList.add('fa-eye-slash'); }
  } else {
    input.type = 'password';
    if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
    if (iconInline) { iconInline.classList.remove('fa-eye-slash'); iconInline.classList.add('fa-eye'); }
  }
};

window.quickFillAdmin = function(password) {
  const input = document.getElementById('adminInputPassword');
  if (input) {
    input.value = password;
    const form = document.getElementById('adminLoginForm');
    if (form) {
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  }
};

function adminLogout() {
  window.ncStore.logoutAdmin();
  window.location.reload();
}

function bootAdminDashboard() {
  applyRolePermissions();
  loadGoogleSheetWebhook();
  loadNotificationEmails();
  renderEventsManager();
  renderAdminStats();
  renderBookingsTable();
  renderVendorsList();
  renderAssignmentsTable();
  populateBookingSelectForQuotation();
  populateVendorAssignSelects();
  initQuotationForm();
  initVendorAssignForm();
  renderNotificationsList();
  initGalleryUploadManager();
  initAdminPasswordManager();
}

// Google Sheets & Email Webhook Helpers
function loadGoogleSheetWebhook() {
  const url = localStorage.getItem('nc_google_sheet_webhook') || '';
  const input = document.getElementById('googleSheetUrlInput');
  const note = document.getElementById('gsheetStatusNote');
  if (input) input.value = url;
  if (note) {
    if (url) {
      note.innerHTML = '<span style="color: #25d366;"><i class="fa-solid fa-circle-check"></i> Connected to Google Sheets & Email Dispatcher (' + url.substring(0, 45) + '...)</span>';
    } else {
      note.innerHTML = '<span style="color: #eeddb0;"><i class="fa-solid fa-info-circle"></i> To connect your Google Sheet, follow the 2-minute steps in <code>google-sheets-script.js</code> and paste your Web App URL above.</span>';
    }
  }
}

function saveGoogleSheetWebhook() {
  if (window.ncStore && !window.ncStore.isSuperAdmin()) {
    alert('Access Denied: Only Super Administrator (Iamwurtzite@8445) has authority to change the Google Sheet Webhook URL.');
    return;
  }
  const input = document.getElementById('googleSheetUrlInput');
  if (!input) return;
  const url = input.value.trim();
  localStorage.setItem('nc_google_sheet_webhook', url);
  alert('Google Sheets Webhook URL saved successfully! All customer orders will automatically post to your Google Sheet and send email notifications.');
  loadGoogleSheetWebhook();
}

function loadNotificationEmails() {
  const input = document.getElementById('notificationEmailsInput');
  if (!input || !window.ncStore) return;
  input.value = window.ncStore.getNotificationEmails();
}

function saveNotificationEmails() {
  if (window.ncStore && !window.ncStore.isSuperAdmin()) {
    alert('Access Denied: Only Super Administrator (Iamwurtzite@8445) has authority to update notification email recipients.');
    return;
  }
  const input = document.getElementById('notificationEmailsInput');
  if (!input || !window.ncStore) return;
  const saved = window.ncStore.setNotificationEmails(input.value);
  alert('Notification email recipients saved successfully!\nRecipients: ' + saved);
}

// Render KPI Stats Cards
function renderAdminStats() {
  if (!window.ncStore) return;
  const bookings = window.ncStore.getBookings();
  const quotations = window.ncStore.getQuotations();
  const vendors = window.ncStore.getVendors();

  const totalBookingsEl = document.getElementById('statTotalBookings');
  const pendingLeadsEl = document.getElementById('statPendingLeads');
  const totalRevenueEl = document.getElementById('statTotalRevenue');
  const activeVendorsEl = document.getElementById('statActiveVendors');

  if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
  if (pendingLeadsEl) pendingLeadsEl.textContent = bookings.filter(b => b.status === 'Pending').length;
  if (activeVendorsEl) activeVendorsEl.textContent = vendors.length;

  if (totalRevenueEl) {
    const totalRev = quotations.reduce((sum, q) => sum + (q.advancePaid || 0), 0);
    totalRevenueEl.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
  }
}

// Render Bookings Table (Step 6)
function renderBookingsTable(filterStatus = 'All') {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody || !window.ncStore) return;

  let bookings = window.ncStore.getBookings();
  if (filterStatus !== 'All') {
    bookings = bookings.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase());
  }

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: #a0a5b5;">No bookings found for "${filterStatus}".</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    let statusClass = 'badge-pending';
    if (b.status === 'Confirmed') statusClass = 'badge-confirmed';
    if (b.status === 'Quoted') statusClass = 'badge-quoted';
    if (b.status === 'Completed') statusClass = 'badge-completed';

    const eventsList = Array.isArray(b.events) ? b.events.join(', ') : b.events;
    const servicesList = Array.isArray(b.services) ? b.services.join(', ') : (b.services || 'Standard');
    const waMsg = encodeURIComponent(`Namaste ${b.customerName}! This is Naishvi Event Empire regarding your wedding booking enquiry (${b.id}) in ${b.location}.`);

    return `
      <tr>
        <td>
          <strong style="color: var(--primary-gold-light);">${b.id}</strong>
          <div style="font-size: 0.75rem; color: #717684;">${new Date(b.createdAt).toLocaleDateString()}</div>
        </td>
        <td>
          <strong>${b.customerName}</strong>
          <div style="font-size: 0.8rem; color: #a0a5b5;"><i class="fa-solid fa-phone"></i> ${b.mobile}</div>
        </td>
        <td>
          <div><strong>${eventsList}</strong></div>
          <div style="font-size: 0.8rem; color: #a0a5b5;"><i class="fa-solid fa-location-dot"></i> ${b.location}</div>
          <div style="font-size: 0.8rem; color: #a0a5b5;"><i class="fa-solid fa-calendar-days"></i> ${b.eventDate}</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: #d1d5db; max-width: 260px;">${servicesList}</div>
          <div style="font-size: 0.78rem; color: var(--primary-gold); margin-top: 4px;">👥 ${b.guests} Guests • ${b.packageName || 'Gold'}</div>
        </td>
        <td>
          <span style="font-weight: 600; color: #ffffff;">${b.budget}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${b.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <a href="https://api.whatsapp.com/send?phone=${b.mobile.replace(/[^0-9]/g, '')}&text=${waMsg}" target="_blank" class="btn-action-icon" title="Chat on WhatsApp">
              <i class="fa-brands fa-whatsapp text-success"></i>
            </a>
            <button class="btn-action-icon" onclick="prepareQuoteForBooking('${b.id}')" title="Generate Quotation (Step 7)">
              <i class="fa-solid fa-file-invoice-dollar text-gold"></i>
            </button>
            <button class="btn-action-icon" onclick="openAssignModal('${b.id}')" title="Assign Vendors (Step 9)">
              <i class="fa-solid fa-users-gear"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Prepare Quote Form for a Specific Booking
function prepareQuoteForBooking(bookingId) {
  const booking = window.ncStore.getBookingById(bookingId);
  if (!booking) return;

  const select = document.getElementById('quoteBookingSelect');
  if (select) {
    select.value = booking.id;
    select.dispatchEvent(new Event('change'));
  }

  const quoteSection = document.getElementById('quotationSection');
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Populate Booking Dropdown for Quotation Builder
function populateBookingSelectForQuotation() {
  const select = document.getElementById('quoteBookingSelect');
  if (!select || !window.ncStore) return;

  const bookings = window.ncStore.getBookings();
  select.innerHTML = '<option value="">-- Choose Booking Enquiry --</option>' + 
    bookings.map(b => `<option value="${b.id}">[${b.id}] ${b.customerName} - ${b.events.join(', ')} (${b.eventDate})</option>`).join('');

  select.addEventListener('change', () => {
    const bId = select.value;
    const b = window.ncStore.getBookingById(bId);
    if (!b) return;

    document.getElementById('quoteCustName').value = b.customerName;
    document.getElementById('quoteCustMobile').value = b.mobile;

    // Prepopulate quotation items matching Step 7 image requirements
    const itemsContainer = document.getElementById('quoteItemsRows');
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="Decoration (Theme Mandap & Floral Stage)" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="50000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="Catering (Royal Buffet & Feasts)" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="100000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="Photography & 4K Cinema" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="30000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="quote-item-row">
          <input type="text" class="form-control item-name" value="DJ & Music (Sound & Light Truss)" placeholder="Service Name">
          <input type="number" class="form-control item-amount" value="15000" oninput="calculateQuoteTotals()">
          <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      calculateQuoteTotals();
    }
  });
}

function addQuoteRow() {
  const container = document.getElementById('quoteItemsRows');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'quote-item-row';
  div.innerHTML = `
    <input type="text" class="form-control item-name" placeholder="Service / Item Name (e.g. Bridal Makeup)">
    <input type="number" class="form-control item-amount" placeholder="Amount (₹)" value="15000" oninput="calculateQuoteTotals()">
    <button type="button" class="btn-del-item" onclick="removeQuoteRow(this)"><i class="fa-solid fa-trash"></i></button>
  `;
  container.appendChild(div);
  calculateQuoteTotals();
}

function removeQuoteRow(btn) {
  const row = btn.closest('.quote-item-row');
  if (row) {
    row.remove();
    calculateQuoteTotals();
  }
}

function calculateQuoteTotals() {
  const rows = document.querySelectorAll('.quote-item-row');
  let subtotal = 0;
  rows.forEach(r => {
    const amt = Number(r.querySelector('.item-amount')?.value || 0);
    subtotal += amt;
  });

  const discountInput = document.getElementById('quoteDiscount');
  const discount = Number(discountInput?.value || 0);
  const total = Math.max(0, subtotal - discount);
  const advance = Math.round(total * 0.3); // 30% advance

  document.getElementById('quoteSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('quoteTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
  document.getElementById('quoteAdvance').textContent = `₹${advance.toLocaleString('en-IN')}`;
}

// Submit and Dispatch Quotation (Step 7)
function initQuotationForm() {
  const form = document.getElementById('generateQuoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bookingId = document.getElementById('quoteBookingSelect').value;
    const custName = document.getElementById('quoteCustName').value;
    const custMobile = document.getElementById('quoteCustMobile').value;
    const discount = Number(document.getElementById('quoteDiscount').value || 0);

    if (!bookingId) {
      alert('Please select a booking to create quotation.');
      return;
    }

    const items = [];
    document.querySelectorAll('.quote-item-row').forEach(row => {
      const name = row.querySelector('.item-name').value.trim();
      const amt = Number(row.querySelector('.item-amount').value || 0);
      if (name && amt > 0) {
        items.push({ service: name, amount: amt });
      }
    });

    if (items.length === 0) {
      alert('Please add at least one item to quotation.');
      return;
    }

    const quote = window.ncStore.createQuotation({
      bookingId,
      customerName: custName,
      mobile: custMobile,
      items,
      discount
    });

    // Generate WhatsApp quote link
    let itemsText = items.map(i => `• ${i.service}: ₹${i.amount.toLocaleString('en-IN')}`).join('\n');
    const waText = encodeURIComponent(
      `*NAISHVI EVENT EMPIRE*\n` +
      `*CUSTOM WEDDING QUOTATION*\n` +
      `------------------------------------\n` +
      `Dear ${custName},\n` +
      `Here is the official quotation for your wedding celebration (Ref: ${quote.id}):\n\n` +
      `${itemsText}\n` +
      `------------------------------------\n` +
      `*Total: ₹${quote.totalAmount.toLocaleString('en-IN')}*\n` +
      `Advance for Booking Confirmation (30%): ₹${quote.advanceRequired.toLocaleString('en-IN')}\n\n` +
      `Approve quotation and complete online booking here:\n` +
      `${typeof getAppUrl === 'function' ? getAppUrl('/customer-portal?bookingId=' + bookingId) : (window.location.origin + (window.location.hostname.endsWith('github.io') ? '/' + window.location.pathname.split('/').filter(Boolean)[0] : '') + '/customer-portal?bookingId=' + bookingId)}`
    );

    alert(`Quotation ${quote.id} created successfully! Total: ₹${quote.totalAmount.toLocaleString('en-IN')}`);

    // Reload views
    renderAdminStats();
    renderBookingsTable();

    // Open WhatsApp option
    if (confirm('Open WhatsApp now to send this Quotation directly to customer?')) {
      window.open(`https://api.whatsapp.com/send?phone=${custMobile.replace(/[^0-9]/g, '')}&text=${waText}`, '_blank');
    }
  });
}

// Vendor Management (Step 9)
function renderVendorsList() {
  const container = document.getElementById('vendorsGrid');
  if (!container || !window.ncStore) return;

  const vendors = window.ncStore.getVendors();
  container.innerHTML = vendors.map(v => `
    <div class="vendor-box-card">
      <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px;">
        <img src="${v.avatar}" alt="${v.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-gold);">
        <div>
          <h4 style="color: #fff; font-size: 1rem; margin-bottom: 2px;">${v.name}</h4>
          <span style="font-size: 0.78rem; color: var(--primary-gold);">${v.category}</span>
        </div>
      </div>
      <div style="font-size: 0.82rem; color: #a0a5b5; line-height: 1.6; margin-bottom: 14px;">
        <div><i class="fa-solid fa-user"></i> Contact: ${v.contactPerson}</div>
        <div><i class="fa-solid fa-phone"></i> ${v.phone}</div>
        <div><i class="fa-solid fa-location-dot"></i> ${v.city}</div>
        <div><i class="fa-solid fa-star text-gold"></i> Rating: ${v.rating} / 5.0 (${v.experience})</div>
      </div>
      <button class="btn btn-outline-gold btn-sm" style="width: 100%;" onclick="openAssignModal(null, '${v.id}')">
        <i class="fa-solid fa-paper-plane"></i> Assign To Wedding Event
      </button>
    </div>
  `).join('');
}

function populateVendorAssignSelects() {
  const vSelect = document.getElementById('assignVendorSelect');
  const bSelect = document.getElementById('assignBookingSelect');
  if (!vSelect || !bSelect || !window.ncStore) return;

  const vendors = window.ncStore.getVendors();
  const bookings = window.ncStore.getBookings();

  vSelect.innerHTML = '<option value="">-- Select Vendor --</option>' + 
    vendors.map(v => `<option value="${v.id}">${v.name} (${v.category})</option>`).join('');

  bSelect.innerHTML = '<option value="">-- Select Wedding Booking --</option>' + 
    bookings.map(b => `<option value="${b.id}">[${b.id}] ${b.customerName} - ${b.events.join(', ')} (${b.eventDate})</option>`).join('');
}

function openAssignModal(bookingId = null, vendorId = null) {
  const modal = document.getElementById('assignVendorModal');
  if (!modal) return;

  if (bookingId) {
    const bSelect = document.getElementById('assignBookingSelect');
    if (bSelect) bSelect.value = bookingId;
  }
  if (vendorId) {
    const vSelect = document.getElementById('assignVendorSelect');
    if (vSelect) vSelect.value = vendorId;
  }

  modal.classList.add('open');
  modal.style.display = 'flex';
}

function initVendorAssignForm() {
  const form = document.getElementById('assignVendorForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bId = document.getElementById('assignBookingSelect').value;
    const vId = document.getElementById('assignVendorSelect').value;
    const sName = document.getElementById('assignServiceType').value;
    const notes = document.getElementById('assignNotes').value;

    if (!bId || !vId) {
      alert('Please select both a booking and a vendor.');
      return;
    }

    const asg = window.ncStore.assignVendor(bId, vId, sName, notes);
    if (asg) {
      alert(`Assigned order to vendor successfully!\nVendor: ${asg.vendorName}\nEvent: ${asg.customerName}`);
      closeModal('assignVendorModal');
      renderAssignmentsTable();
    }
  });
}

function renderAssignmentsTable() {
  const tbody = document.getElementById('assignmentsTableBody');
  if (!tbody || !window.ncStore) return;

  const assignments = window.ncStore.getAssignments();
  if (assignments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a0a5b5; padding: 20px;">No vendors assigned yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = assignments.map(a => `
    <tr>
      <td><strong>${a.id}</strong></td>
      <td>
        <strong>${a.vendorName}</strong>
        <div style="font-size: 0.75rem; color: #a0a5b5;">${a.serviceName}</div>
      </td>
      <td>
        <strong>${a.customerName}</strong>
        <div style="font-size: 0.75rem; color: #a0a5b5;">Ref: ${a.bookingId}</div>
      </td>
      <td>
        <div><i class="fa-solid fa-calendar-days text-gold"></i> ${a.eventDate}</div>
        <div style="font-size: 0.75rem; color: #a0a5b5;">${a.location}</div>
      </td>
      <td>
        <span class="status-badge badge-confirmed">${a.status}</span>
      </td>
      <td>
        <a href="https://api.whatsapp.com/send?phone=${a.vendorPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Namaste ${a.vendorName}, you have been assigned ${a.serviceName} for wedding of ${a.customerName} on ${a.eventDate} in ${a.location}.`)}" target="_blank" class="btn btn-outline-gold btn-sm">
          <i class="fa-brands fa-whatsapp text-success"></i> Notify
        </a>
      </td>
    </tr>
  `).join('');
}

// Notifications List
function renderNotificationsList() {
  const container = document.getElementById('adminNotificationsList');
  if (!container || !window.ncStore) return;

  const notifs = window.ncStore.getNotifications ? window.ncStore.getNotifications() : [];
  if (notifs.length === 0) {
    container.innerHTML = '<div style="color: #a0a5b5; font-size: 0.85rem;">No recent notifications.</div>';
    return;
  }
  container.innerHTML = notifs.slice(0, 5).map(n => `
    <div style="padding: 10px 14px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--primary-gold); border-radius: 4px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--primary-gold-light); margin-bottom: 2px;">
        <strong>${n.title}</strong>
        <span>${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="font-size: 0.82rem; color: #d1d5db;">${n.message}</div>
    </div>
  `).join('');
}

function filterBookings(status, el) {
  document.querySelectorAll('.admin-filter-pill').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  renderBookingsTable(status);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
}

// =====================================================================
// Dynamic Website Gallery Upload Manager (Google Sheets & Cloud Drive)
// =====================================================================
let selectedGalleryFiles = []; // Array of { id, file, name, sizeKb, dataUrl }

// Client-side canvas image compressor (scales max dimension to 1600px, JPEG 0.85)
function compressImageToDataUrl(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function initGalleryUploadManager() {
  const form = document.getElementById('galleryUploadForm');
  const fileInput = document.getElementById('galleryFileInput');
  const urlInput = document.getElementById('galleryUrlInput');
  const previewBox = document.getElementById('galleryPreviewBox');
  const multiPreview = document.getElementById('galleryMultiPreview');
  const previewCount = document.getElementById('galleryPreviewCount');
  const clearBtn = document.getElementById('clearGalleryFilesBtn');
  const submitBtn = document.getElementById('gallerySubmitBtn');
  const progressBar = document.getElementById('galleryUploadProgressBar');
  const progressFill = document.getElementById('galleryUploadProgressFill');
  const progressStatus = document.getElementById('galleryUploadProgressStatus');

  renderCustomGalleryList();

  // Also trigger live fetch from Google Sheets on initial load
  if (window.ncStore && window.ncStore.fetchLiveGalleryPhotos) {
    window.ncStore.fetchLiveGalleryPhotos().then(() => {
      renderCustomGalleryList();
    }).catch(e => console.warn('Gallery sync note:', e));
  }

  // Handle Multi-File Selection
  fileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (previewBox) previewBox.style.display = 'block';
    if (previewCount) previewCount.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-gold"></i> Processing & compressing ${files.length} photo(s)...`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedDataUrl = await compressImageToDataUrl(file);
        selectedGalleryFiles.push({
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          file: file,
          name: file.name,
          sizeKb: Math.round((compressedDataUrl.length * 0.75) / 1024),
          dataUrl: compressedDataUrl
        });
      } catch (err) {
        console.error('Compression error on file:', file.name, err);
      }
    }

    renderMultiFilePreview();
    if (urlInput) urlInput.value = '';
    fileInput.value = '';
  });

  // Handle URL input
  urlInput?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      if (previewBox) previewBox.style.display = 'block';
      if (previewCount) previewCount.innerHTML = `<i class="fa-solid fa-link text-gold"></i> Web Image URL Linked`;
      if (multiPreview) {
        multiPreview.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.6); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-gold);">
            <img src="${url}" alt="Preview" style="width: 70px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='assets/images/logo.jpg'">
            <div>
              <strong style="color: #fff; font-size: 0.82rem; display: block;">Web Image URL</strong>
              <small style="color: var(--text-muted); font-size: 0.72rem; word-break: break-all;">${url.substring(0, 50)}...</small>
            </div>
          </div>
        `;
      }
    } else if (selectedGalleryFiles.length === 0) {
      if (previewBox) previewBox.style.display = 'none';
    }
  });

  // Clear all button
  clearBtn?.addEventListener('click', () => {
    selectedGalleryFiles = [];
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    if (previewBox) previewBox.style.display = 'none';
    if (multiPreview) multiPreview.innerHTML = '';
  });

  // Form Submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('galleryCategorySelect').value;
    const baseTitle = document.getElementById('galleryTitleInput').value.trim();
    const location = document.getElementById('galleryLocationInput').value.trim() || 'Agra, UP';
    const webUrl = urlInput?.value.trim();

    const hasFiles = selectedGalleryFiles.length > 0;
    const hasUrl = Boolean(webUrl);

    if (!hasFiles && !hasUrl) {
      alert('Please select at least one photo from your device or enter an image web URL.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing Upload...';
    }
    if (progressBar) progressBar.style.display = 'block';
    if (progressStatus) progressStatus.style.display = 'block';

    const queue = [];
    if (hasFiles) {
      selectedGalleryFiles.forEach((item, idx) => {
        const itemTitle = selectedGalleryFiles.length > 1 ? `${baseTitle} (${idx + 1})` : baseTitle;
        queue.push({
          category,
          title: itemTitle,
          location,
          image: item.dataUrl
        });
      });
    } else if (hasUrl) {
      queue.push({
        category,
        title: baseTitle,
        location,
        image: webUrl
      });
    }

    const total = queue.length;
    let uploadedCount = 0;

    for (let i = 0; i < total; i++) {
      const photoItem = queue[i];
      const percent = Math.round(((i) / total) * 100);
      if (progressFill) progressFill.style.width = percent + '%';
      if (progressStatus) progressStatus.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-gold"></i> Uploading photo ${i + 1} of ${total}: "${photoItem.title}" to Google Sheet & Drive...`;
      if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${i + 1}/${total}...`;

      try {
        await window.ncStore.uploadGalleryPhotoToGoogle(photoItem);
        uploadedCount++;
      } catch (err) {
        console.error('Failed to upload photo:', photoItem.title, err);
      }
    }

    if (progressFill) progressFill.style.width = '100%';
    if (progressStatus) progressStatus.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #25d366;"></i> All ${uploadedCount} photo(s) uploaded and synced to Google Sheets!`;

    setTimeout(() => {
      form.reset();
      selectedGalleryFiles = [];
      if (previewBox) previewBox.style.display = 'none';
      if (progressBar) progressBar.style.display = 'none';
      if (progressStatus) progressStatus.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload & Publish to Gallery';
      }

      alert(`🎉 Success! ${uploadedCount} photo(s) uploaded to Google Sheet & Drive!\n\nAll visitors on gallery.html across all devices and phones will now see these photos.`);
      renderCustomGalleryList();
    }, 800);
  });
}

function renderMultiFilePreview() {
  const multiPreview = document.getElementById('galleryMultiPreview');
  const previewCount = document.getElementById('galleryPreviewCount');
  const previewBox = document.getElementById('galleryPreviewBox');
  if (!multiPreview || !previewCount) return;

  if (selectedGalleryFiles.length === 0) {
    if (previewBox) previewBox.style.display = 'none';
    multiPreview.innerHTML = '';
    return;
  }

  if (previewBox) previewBox.style.display = 'block';
  previewCount.innerHTML = `<i class="fa-solid fa-images text-gold"></i> Selected Photos (${selectedGalleryFiles.length} ready to upload)`;

  multiPreview.innerHTML = selectedGalleryFiles.map((item) => `
    <div style="position: relative; width: 85px; height: 65px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-gold); background: #000; flex-shrink: 0;" title="${item.name} (${item.sizeKb} KB)">
      <img src="${item.dataUrl}" alt="Thumb" style="width: 100%; height: 100%; object-fit: cover;">
      <button type="button" onclick="removeSingleGalleryFile('${item.id}')" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(220,38,38,0.9); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; line-height: 1;" title="Remove this photo">×</button>
      <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: #eeddb0; font-size: 0.62rem; text-align: center; padding: 1px 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${item.sizeKb} KB
      </span>
    </div>
  `).join('');
}

window.removeSingleGalleryFile = function(id) {
  selectedGalleryFiles = selectedGalleryFiles.filter(item => item.id !== id);
  renderMultiFilePreview();
};

window.refreshCustomGalleryList = async function() {
  const btn = document.getElementById('refreshGalleryBtn');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
  if (window.ncStore && window.ncStore.fetchLiveGalleryPhotos) {
    await window.ncStore.fetchLiveGalleryPhotos();
  }
  renderCustomGalleryList();
  if (btn) btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Sync from Google Sheets';
};

function renderCustomGalleryList() {
  const container = document.getElementById('customGalleryList');
  if (!container || !window.ncStore) return;

  const photos = window.ncStore.getCustomGalleryPhotos();
  if (photos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 24px; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-gold); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        <i class="fa-solid fa-images text-gold" style="font-size: 1.8rem; margin-bottom: 8px; display: block;"></i>
        No custom photos uploaded yet. Select single or multiple photos above to upload them to Google Sheet and showcase your celebrations on <code>gallery.html</code>.
      </div>
    `;
    return;
  }

  const catNames = {
    'roka': 'Roka and engagement',
    'haldi': 'Haldi and mehndi',
    'mandap': 'Stage and mandap',
    'music': 'Music & sangeet',
    'reception': 'Grand reception',
    'devotional': 'Devotional'
  };

  container.innerHTML = photos.map(p => `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
      <div style="height: 140px; position: relative; overflow: hidden; background: #000;">
        <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/images/logo.jpg'">
        <span style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.75); color: var(--primary-gold); border: 1px solid var(--border-gold); padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 600;">
          ${catNames[p.category] || p.category}
        </span>
      </div>
      <div style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <strong style="color: #fff; font-size: 0.88rem; display: block; margin-bottom: 2px;">${p.title}</strong>
          <small style="color: var(--text-muted); font-size: 0.76rem;"><i class="fa-solid fa-location-dot text-gold"></i> ${p.location}</small>
        </div>
        <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
          <button type="button" class="btn btn-maroon btn-sm" onclick="deleteCustomPhoto('${p.id}')" style="font-size: 0.75rem; padding: 4px 10px;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteCustomPhoto(id) {
  if (confirm('Are you sure you want to remove this photo from the website gallery and Google Sheet?')) {
    await window.ncStore.deleteCustomGalleryPhoto(id);
    renderCustomGalleryList();
  }
}

// =====================================================================
// Master Admin Password Security Manager
// =====================================================================
function initAdminPasswordManager() {
  const form = document.getElementById('adminPasswordChangeForm');
  const alertEl = document.getElementById('passChangeAlert');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const currPass = document.getElementById('currentAdminPass').value;
    const newPass = document.getElementById('newAdminPass').value;
    const confirmPass = document.getElementById('confirmAdminPass').value;

    if (newPass !== confirmPass) {
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.style.background = 'rgba(239, 68, 68, 0.2)';
        alertEl.style.border = '1px solid #ef4444';
        alertEl.style.color = '#ef4444';
        alertEl.textContent = 'New password and confirm password do not match.';
      }
      return;
    }

    const res = window.ncStore.changeAdminPassword(currPass, newPass);
    if (alertEl) {
      alertEl.style.display = 'block';
      if (res.success) {
        alertEl.style.background = 'rgba(37, 211, 102, 0.2)';
        alertEl.style.border = '1px solid #25d366';
        alertEl.style.color = '#25d366';
        alertEl.textContent = '✅ ' + res.message;
        form.reset();
      } else {
        alertEl.style.background = 'rgba(239, 68, 68, 0.2)';
        alertEl.style.border = '1px solid #ef4444';
        alertEl.style.color = '#ef4444';
        alertEl.textContent = '❌ ' + res.message;
      }
    }
  });
}

// =====================================================================
// Role & Permission Management (Two-Tier Authority)
// =====================================================================
function applyRolePermissions() {
  const isSuper = window.ncStore ? window.ncStore.isSuperAdmin() : false;
  const role = window.ncStore ? window.ncStore.getAdminRole() : 'STAFF_ADMIN';
  const badge = document.getElementById('adminRoleBadge');
  const lockNotice = document.getElementById('superAdminLockNotice');
  const gsheetInput = document.getElementById('googleSheetUrlInput');
  const emailsInput = document.getElementById('notificationEmailsInput');
  const saveGSheetBtn = document.getElementById('saveGSheetBtn');
  const saveEmailsBtn = document.getElementById('saveEmailsBtn');

  if (badge) {
    if (isSuper) {
      badge.className = 'status-badge badge-confirmed';
      badge.innerHTML = '<i class="fa-solid fa-shield-halved text-gold"></i> Master Authority (Super Admin)';
    } else {
      badge.className = 'status-badge';
      badge.style.background = 'rgba(59, 130, 246, 0.2)';
      badge.style.border = '1px solid #3b82f6';
      badge.style.color = '#93c5fd';
      badge.innerHTML = '<i class="fa-solid fa-user-shield" style="color: #60a5fa;"></i> Staff Authority (Restricted)';
    }
  }

  if (isSuper) {
    if (lockNotice) lockNotice.style.display = 'none';
    if (gsheetInput) { gsheetInput.disabled = false; gsheetInput.readOnly = false; }
    if (emailsInput) { emailsInput.disabled = false; emailsInput.readOnly = false; }
    if (saveGSheetBtn) { saveGSheetBtn.disabled = false; saveGSheetBtn.style.display = 'inline-flex'; }
    if (saveEmailsBtn) { saveEmailsBtn.disabled = false; saveEmailsBtn.style.display = 'inline-flex'; }
  } else {
    if (lockNotice) lockNotice.style.display = 'block';
    if (gsheetInput) { gsheetInput.disabled = true; gsheetInput.readOnly = true; }
    if (emailsInput) { emailsInput.disabled = true; emailsInput.readOnly = true; }
    if (saveGSheetBtn) { saveGSheetBtn.disabled = true; saveGSheetBtn.style.display = 'none'; }
    if (saveEmailsBtn) { saveEmailsBtn.disabled = true; saveEmailsBtn.style.display = 'none'; }
  }
}

// Purge Mock Data Tool
function purgeMockDataConfirm() {
  if (confirm('Are you sure you want to delete all sample / mock data?\n\nThis will remove sample test bookings, quotations, and assignments. Any real user inquiries will be preserved.')) {
    window.ncStore.purgeAllMockData();
    alert('All mock bookings, sample quotations, and test assignments have been purged successfully.');
    renderBookingsTable();
    renderAdminStats();
    renderAssignmentsTable();
    populateBookingSelectForQuotation();
    populateVendorAssignSelects();
    renderNotificationsList();
  }
}

// =====================================================================
// Website Events & Pricing Manager (Live Sync)
// =====================================================================
let currentEventImageBase64 = '';

function renderEventsManager() {
  const container = document.getElementById('adminEventsGrid');
  if (!container || !window.ncStore) return;

  const events = window.ncStore.getEvents();
  if (events.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.02); border: 1px dashed var(--border-gold); border-radius: var(--radius-md);">
        <i class="fa-solid fa-calendar-xmark text-gold" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
        No events listed on website. Click "Add New Event" or "Reset Defaults" to restore official wedding ceremonies.
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(evt => {
    const formattedPrice = Number(evt.basePrice || 0).toLocaleString('en-IN');
    const safeImage = evt.image || 'assets/images/logo.jpg';
    return `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease, border-color 0.2s ease;">
        <div style="height: 160px; position: relative; background: #0b0c10; overflow: hidden;">
          <img src="${safeImage}" alt="${evt.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/images/logo.jpg'">
          <span style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.75); color: var(--primary-gold); border: 1px solid var(--border-gold); padding: 3px 10px; border-radius: 4px; font-size: 0.74rem; font-weight: 600;">
            ${evt.category || 'Celebration'}
          </span>
          <span style="position: absolute; bottom: 10px; right: 10px; background: var(--royal-maroon); color: #fff; border: 1px solid var(--primary-gold); padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 700;">
            ₹${formattedPrice}
          </span>
        </div>
        <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h4 style="color: #fff; font-size: 1.05rem; margin-bottom: 4px;">${evt.name}</h4>
            <p style="color: var(--primary-gold-light); font-size: 0.78rem; margin-bottom: 8px; font-style: italic;">${evt.tagline || ''}</p>
            <p style="color: var(--text-muted); font-size: 0.82rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
              ${evt.description || 'Custom wedding & ceremonial execution in Agra.'}
            </p>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="openEditEventModal('${evt.id}')" style="flex: 1; font-size: 0.78rem; padding: 6px 10px;">
              <i class="fa-solid fa-pen-to-square"></i> Edit & Price
            </button>
            <button type="button" class="btn btn-outline-gold btn-sm" onclick="openEditEventModal('${evt.id}', true)" style="font-size: 0.78rem; padding: 6px 10px;" title="Change Cover Photo">
              <i class="fa-solid fa-image"></i>
            </button>
            <button type="button" class="btn btn-maroon btn-sm" onclick="deleteEventConfirm('${evt.id}')" style="font-size: 0.78rem; padding: 6px 10px;" title="Delete Event">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openAddEventModal() {
  currentEventImageBase64 = '';
  document.getElementById('editEventId').value = '';
  document.getElementById('editEventName').value = '';
  document.getElementById('editEventCategory').value = 'Pre-Wedding';
  document.getElementById('editEventPrice').value = '35000';
  document.getElementById('editEventTagline').value = '';
  document.getElementById('editEventDescription').value = '';
  document.getElementById('editEventImageUrl').value = '';
  document.getElementById('editEventImageFile').value = '';
  document.getElementById('eventImagePreviewBox').style.display = 'none';
  document.getElementById('eventModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle text-gold"></i> Add New Website Event';

  const modal = document.getElementById('eventEditModal');
  if (modal) {
    modal.classList.add('open');
    modal.style.display = 'flex';
  }
}

function openEditEventModal(eventId, focusImage = false) {
  const events = window.ncStore ? window.ncStore.getEvents() : [];
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  currentEventImageBase64 = evt.image || '';
  document.getElementById('editEventId').value = evt.id;
  document.getElementById('editEventName').value = evt.name || '';
  document.getElementById('editEventCategory').value = evt.category || 'Pre-Wedding';
  document.getElementById('editEventPrice').value = evt.basePrice || 0;
  document.getElementById('editEventTagline').value = evt.tagline || '';
  document.getElementById('editEventDescription').value = evt.description || '';
  document.getElementById('editEventImageUrl').value = (evt.image && !evt.image.startsWith('data:')) ? evt.image : '';
  document.getElementById('editEventImageFile').value = '';

  const previewBox = document.getElementById('eventImagePreviewBox');
  const previewThumb = document.getElementById('eventImagePreviewThumb');
  if (evt.image) {
    previewThumb.src = evt.image;
    previewBox.style.display = 'flex';
  } else {
    previewBox.style.display = 'none';
  }

  document.getElementById('eventModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square text-gold"></i> Edit ${evt.name}`;

  const modal = document.getElementById('eventEditModal');
  if (modal) {
    modal.classList.add('open');
    modal.style.display = 'flex';
  }

  if (focusImage) {
    setTimeout(() => {
      document.getElementById('editEventImageFile')?.focus();
    }, 150);
  }
}

function handleEventImageFileSelect(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      currentEventImageBase64 = e.target.result;
      const previewBox = document.getElementById('eventImagePreviewBox');
      const previewThumb = document.getElementById('eventImagePreviewThumb');
      if (previewBox && previewThumb) {
        previewThumb.src = currentEventImageBase64;
        previewBox.style.display = 'flex';
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleEventImageUrlInput(url) {
  const trimmed = url.trim();
  if (trimmed) {
    currentEventImageBase64 = trimmed;
    const previewBox = document.getElementById('eventImagePreviewBox');
    const previewThumb = document.getElementById('eventImagePreviewThumb');
    if (previewBox && previewThumb) {
      previewThumb.src = trimmed;
      previewBox.style.display = 'flex';
    }
  }
}

function removeEventImageAttachment() {
  currentEventImageBase64 = '';
  document.getElementById('editEventImageUrl').value = '';
  document.getElementById('editEventImageFile').value = '';
  const previewBox = document.getElementById('eventImagePreviewBox');
  if (previewBox) previewBox.style.display = 'none';
}

function saveEventForm(e) {
  e.preventDefault();
  const id = document.getElementById('editEventId').value.trim();
  const name = document.getElementById('editEventName').value.trim();
  const category = document.getElementById('editEventCategory').value;
  const price = Number(document.getElementById('editEventPrice').value) || 0;
  const tagline = document.getElementById('editEventTagline').value.trim();
  const description = document.getElementById('editEventDescription').value.trim();

  if (!name) {
    alert('Please enter an event name.');
    return;
  }

  const eventPayload = {
    name,
    category,
    basePrice: price,
    tagline,
    description,
    image: currentEventImageBase64 || 'assets/images/logo.jpg'
  };

  if (id) {
    window.ncStore.updateEvent(id, eventPayload);
    alert(`"${name}" updated successfully! Price set to ₹${price.toLocaleString('en-IN')}. Changes are live on the website.`);
  } else {
    window.ncStore.addEvent(eventPayload);
    alert(`"${name}" added successfully! It is now live on the website.`);
  }

  closeModal('eventEditModal');
  renderEventsManager();
}

function deleteEventConfirm(id) {
  const events = window.ncStore ? window.ncStore.getEvents() : [];
  const evt = events.find(e => e.id === id);
  const name = evt ? evt.name : 'this event';

  if (confirm(`Are you sure you want to delete "${name}" from the website?\n\nIt will be removed from all public booking forms and event catalogs.`)) {
    window.ncStore.deleteEvent(id);
    renderEventsManager();
  }
}

function resetEventsDefaultConfirm() {
  if (confirm('Reset all website events and pricing back to default Naishvi Event Empire ceremonies?\n\nAny customized names, prices or images will be restored to original settings.')) {
    window.ncStore.resetEventsToDefault();
    renderEventsManager();
    alert('All website events and pricing have been reset to default settings.');
  }
}
