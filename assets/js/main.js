/**
 * Naishvi Event Empire - Main Frontend Interaction Script
 */

// GitHub Pages & Repository Path Auto-Fixer
function getAppUrl(path = '') {
  const isGHPages = window.location.hostname.endsWith('github.io');
  const segments = window.location.pathname.split('/').filter(Boolean);
  const repo = isGHPages && segments.length > 0 ? '/' + segments[0] : '';
  const cleanPath = path ? (path.startsWith('/') ? path : '/' + path) : '/';
  return window.location.origin + repo + cleanPath;
}

// Global Click Guard: Prevents links from breaking on GitHub Pages
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;

  if (window.location.hostname.endsWith('github.io')) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const repo = segments.length > 0 ? '/' + segments[0] : '';
    // If link starts with single '/' and doesn't have the repo prefix
    if (href.startsWith('/') && !href.startsWith(repo) && !href.startsWith('//')) {
      e.preventDefault();
      window.location.href = repo + (href === '/' ? '/' : href);
    }
  }
}, true);

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavDropdown();
  initBookingWizard();
  initQuickBookingForm();
  renderEvents();
  renderServices();
  renderPackages();
  renderReviews();
});

// Dropdown Toggle (3-Dots More Options)
function initNavDropdown() {
  const dropdown = document.getElementById('navMoreDropdown');
  const dotsBtn = document.getElementById('navDotsBtn');
  if (dropdown && dotsBtn) {
    dotsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }
}

// Mobile Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const navMenu = document.getElementById('navMenu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when link clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

// Render Events in Section
function renderEvents() {
  const container = document.getElementById('eventsContainer');
  if (!container || !window.ncStore) return;

  const events = window.ncStore.getEvents();
  container.innerHTML = events.map(evt => `
    <div class="event-card" onclick="selectEventAndScroll('${evt.name}')">
      <img src="${evt.image}" alt="${evt.name} - Naishvi Event Empire" loading="lazy">
      <div class="event-card-overlay">
        <span class="event-badge">${evt.hindi}</span>
        <h3 class="event-title">${evt.name}</h3>
        <p class="event-tagline">${evt.tagline}</p>
        <p class="event-details">${evt.description}</p>
        <div class="event-select-trigger">
          <span>Plan This Ceremony</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Services in Section
function renderServices() {
  const container = document.getElementById('servicesContainer');
  if (!container || !window.ncStore) return;

  const services = window.ncStore.getServices();
  container.innerHTML = services.map(srv => `
    <div class="service-card" onclick="selectServiceAndScroll('${srv.name}')">
      <div>
        <div class="service-icon-wrap">
          <i class="fa-solid ${srv.icon}"></i>
        </div>
        <h3 class="service-title">${srv.name}</h3>
        <p class="service-desc">${srv.desc}</p>
      </div>
      <div class="service-price-tag">
        <i class="fa-solid fa-tag"></i> Starting from ₹${srv.defaultCost.toLocaleString('en-IN')}
      </div>
    </div>
  `).join('');
}

// Render Packages in Section
function renderPackages() {
  const container = document.getElementById('packagesContainer');
  if (!container || !window.ncStore) return;

  const packages = window.ncStore.getPackages();
  container.innerHTML = packages.map(pkg => `
    <div class="package-card ${pkg.popular ? 'popular' : ''}">
      ${pkg.popular ? '<div class="popular-badge"><i class="fa-solid fa-crown"></i> Most Popular</div>' : ''}
      <h3 class="package-tier-name">${pkg.name}</h3>
      <p class="package-tagline">${pkg.tagline}</p>
      
      <div class="package-price-wrap">
        <div class="package-price">${pkg.priceLabel}</div>
        <div class="package-note">*Customized to your guest count & city</div>
      </div>

      <ul class="package-features">
        ${pkg.features.map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('')}
      </ul>

      <button type="button" class="btn ${pkg.popular ? 'btn-gold' : 'btn-outline-gold'} btn-lg" onclick="selectPackageAndOpenWizard('${pkg.id}')">
        Choose ${pkg.name}
      </button>
    </div>
  `).join('');
}

// Render Client Reviews
function renderReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container || !window.ncStore) return;

  const reviews = window.ncStore.getReviews();
  container.innerHTML = reviews.map(rev => `
    <div class="testimonial-card">
      <div>
        <div class="stars-rating">
          ${Array(rev.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <p class="testimonial-text">"${rev.quote}"</p>
      </div>
      <div class="testimonial-author">
        <img src="${rev.avatar}" alt="${rev.customerName}" class="author-avatar">
        <div class="author-info">
          <h5>${rev.customerName}</h5>
          <p>${rev.event} • ${rev.date}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// -----------------------------------------------------------------------------
// Interactive 5-Step Customer Wedding Planning & Booking Engine (Steps 1 to 5)
// -----------------------------------------------------------------------------
let wizardState = {
  selectedEvents: ['Wedding'],
  selectedServices: ['Wedding Decoration', 'Catering & Feasts', 'Photography & Cinema', 'DJ & Sound / Music'],
  selectedPackage: 'gold',
  packageName: 'Gold Package',
  customerName: '',
  mobile: '',
  email: '',
  eventDate: '',
  location: '',
  guests: '200-500',
  budget: '₹99,999 onwards'
};

function initBookingWizard() {
  const wizardForm = document.getElementById('weddingWizardForm');
  if (!wizardForm) return;

  // Listen to event checkboxes
  const eventPills = document.querySelectorAll('.event-pill-checkbox');
  eventPills.forEach(pill => {
    pill.addEventListener('change', () => {
      const parent = pill.closest('.event-pill-item');
      if (parent) parent.classList.toggle('selected', pill.checked);
      updateWizardState();
    });
  });

  // Listen to service checkboxes
  const serviceCards = document.querySelectorAll('.service-checkbox-input');
  serviceCards.forEach(chk => {
    chk.addEventListener('change', () => {
      const card = chk.closest('.service-checkbox-card');
      if (card) card.classList.toggle('selected', chk.checked);
      updateWizardState();
    });
  });

  // Package select radio buttons
  const pkgRadios = document.querySelectorAll('input[name="selectedPackageRadio"]');
  pkgRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      wizardState.selectedPackage = radio.value;
      const pkg = window.ncStore.getPackages().find(p => p.id === radio.value);
      if (pkg) {
        wizardState.packageName = pkg.name;
        wizardState.budget = pkg.priceLabel;
      }
    });
  });

  // Form Submit
  wizardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleWizardSubmission();
  });
}

function updateWizardState() {
  // Collect events
  const selectedEvts = [];
  document.querySelectorAll('.event-pill-checkbox:checked').forEach(cb => selectedEvts.push(cb.value));
  wizardState.selectedEvents = selectedEvts.length > 0 ? selectedEvts : ['Wedding'];

  // Collect services
  const selectedSrvs = [];
  document.querySelectorAll('.service-checkbox-input:checked').forEach(cb => selectedSrvs.push(cb.value));
  wizardState.selectedServices = selectedSrvs;
}

function handleWizardSubmission() {
  updateWizardState();

  const nameInput = document.getElementById('custName');
  const mobileInput = document.getElementById('custMobile');
  const emailInput = document.getElementById('custEmail');
  const dateInput = document.getElementById('custDate');
  const locationInput = document.getElementById('custLocation');
  const guestsSelect = document.getElementById('custGuests');
  const budgetSelect = document.getElementById('custBudget');
  const notesInput = document.getElementById('custNotes');

  if (!nameInput.value.trim() || !mobileInput.value.trim()) {
    alert('Please enter your full name and WhatsApp mobile number.');
    return;
  }

  const bookingData = {
    customerName: nameInput.value.trim(),
    mobile: mobileInput.value.trim(),
    email: emailInput ? emailInput.value.trim() : '',
    events: wizardState.selectedEvents,
    eventDate: dateInput.value || '2026-12-20',
    location: locationInput.value.trim() || 'Jaipur / Delhi NCR',
    guests: guestsSelect ? guestsSelect.value : '200-500',
    packageId: wizardState.selectedPackage,
    packageName: wizardState.packageName,
    budget: budgetSelect ? budgetSelect.value : wizardState.budget,
    services: wizardState.selectedServices,
    specialNotes: notesInput ? notesInput.value.trim() : ''
  };

  const newBooking = window.ncStore.createBooking(bookingData);

  // If duplicate same-day order was blocked
  if (newBooking.error) {
    showDuplicateOrderModal(newBooking);
    return;
  }

  // Clear form on success
  const wizardForm = document.getElementById('weddingWizardForm');
  if (wizardForm) wizardForm.reset();

  // Show Success Modal
  showBookingSuccessModal(newBooking);
}

// =====================================================================
// Universal Luxury Modal System (Popups for Order Confirmation & Warnings)
// =====================================================================
function showUniversalModal(opts) {
  let modal = document.getElementById('universalAppModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'universalAppModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close-btn" onclick="closeUniversalModal()" aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div id="universalAppModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeUniversalModal();
    });
  }

  const body = document.getElementById('universalAppModalBody');
  if (body) {
    body.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(212, 175, 55, 0.15); border: 2px solid var(--primary-gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          ${opts.icon || '<i class="fa-solid fa-circle-check text-gold" style="font-size: 34px;"></i>'}
        </div>
        <h3 style="font-size: 1.65rem; color: #fff; margin-bottom: 6px;">${opts.title}</h3>
        ${opts.subtitle ? `<p style="color: var(--primary-gold-light); font-size: 0.9rem; margin-bottom: 20px;">${opts.subtitle}</p>` : ''}
        ${opts.contentHtml || ''}
      </div>
    `;
  }

  modal.classList.add('open');
  modal.style.display = 'flex';
}

function closeUniversalModal() {
  const modal = document.getElementById('universalAppModal');
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
}

// Duplicate Order Blocked Modal
function showDuplicateOrderModal(info) {
  const existing = info.existingBooking || {};
  showUniversalModal({
    icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; font-size: 34px;"></i>',
    title: 'Order Already Registered Today',
    subtitle: `Ref ID: ${existing.id || 'Active'} • Same-Day Multiple Order Restriction`,
    contentHtml: `
      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px; text-align: left;">
        <h4 style="color: #f59e0b; font-size: 0.95rem; margin-bottom: 8px;">
          <i class="fa-solid fa-shield-halved"></i> Duplicate Booking Prevention Active
        </h4>
        <p style="font-size: 0.85rem; color: #eeddb0; line-height: 1.6; margin: 0;">
          ${info.message || 'An active booking enquiry has already been submitted today with this mobile number. To avoid confusion, multiple orders on the same day are restricted.'}
        </p>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; text-align: left; font-size: 0.85rem; color: #d1d5db; margin-bottom: 20px;">
        <div><i class="fa-solid fa-user text-gold"></i> <strong>Client:</strong> ${existing.customerName || 'Valued Client'}</div>
        <div><i class="fa-solid fa-phone text-gold"></i> <strong>Mobile:</strong> ${existing.mobile || 'Registered'}</div>
        <div><i class="fa-solid fa-calendar text-gold"></i> <strong>Event Date:</strong> ${existing.eventDate || 'Upcoming'}</div>
        <div><i class="fa-solid fa-bell text-gold"></i> <strong>Status:</strong> Under Review by Coordinator</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a href="https://api.whatsapp.com/send?phone=918279622416&text=${encodeURIComponent('Namaste Naishvi Event Empire, I have an existing booking ' + (existing.id || '') + ' and want to discuss urgent changes.')}" target="_blank" class="btn btn-gold btn-lg">
          <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp to Modify
        </a>
        <a href="/customer" class="btn btn-outline-gold">
          <i class="fa-solid fa-user-check"></i> Track Existing Booking
        </a>
      </div>
    `
  });
}

function showBookingSuccessModal(booking) {
  const modal = document.getElementById('bookingSuccessModal');
  const modalBody = document.getElementById('bookingSuccessBody');
  if (!modal || !modalBody) {
    // Fallback to universal modal
    showUniversalModal({
      icon: '<i class="fa-solid fa-circle-check text-gold" style="font-size: 34px;"></i>',
      title: 'Booking Enquiry Received!',
      subtitle: `Booking ID: <strong>${booking.id}</strong> • Enquiry Logged in Central System`,
      contentHtml: `
        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 20px; text-align: left; margin-bottom: 24px;">
          <h4 style="color: #eeddb0; font-size: 1rem; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
            <i class="fa-solid fa-bell text-gold"></i> Notifications Dispatched
          </h4>
          <div style="font-size: 0.88rem; color: #d1d5db; line-height: 1.7;">
            <div><i class="fa-solid fa-check text-gold"></i> <strong>Customer:</strong> ${booking.customerName} (${booking.mobile})</div>
            <div><i class="fa-solid fa-check text-gold"></i> <strong>Event:</strong> ${booking.events.join(', ')}</div>
            <div><i class="fa-solid fa-check text-gold"></i> <strong>Date:</strong> ${booking.eventDate} | <strong>Venue:</strong> ${booking.location}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="https://api.whatsapp.com/send?phone=918279622416" target="_blank" class="btn btn-gold btn-lg">
            <i class="fa-brands fa-whatsapp"></i> Connect Directly on WhatsApp
          </a>
          <a href="/customer" class="btn btn-outline-gold">
            <i class="fa-solid fa-user-check"></i> Track Booking
          </a>
        </div>
      `
    });
    return;
  }

  const waText = encodeURIComponent(
    `Namaste Naishvi Event Empire! 🙏\nI have just submitted a wedding booking request on your website.\n\n` +
    `📋 Booking ID: ${booking.id}\n` +
    `👤 Name: ${booking.customerName}\n` +
    `💍 Events: ${booking.events.join(', ')}\n` +
    `📅 Date: ${booking.eventDate}\n` +
    `📍 Venue/City: ${booking.location}\n` +
    `👥 Guests: ${booking.guests}\n` +
    `✨ Selected Services: ${booking.services.join(', ')}\n` +
    `💎 Package: ${booking.packageName}\n\n` +
    `Please share the formal quotation and consultation details.`
  );

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 10px 0;">
      <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(212, 175, 55, 0.15); border: 2px solid var(--primary-gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: var(--primary-gold); font-size: 32px;">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3 style="font-size: 1.8rem; color: #fff; margin-bottom: 6px;">Booking Enquiry Received!</h3>
      <p style="color: var(--primary-gold-light); font-size: 0.95rem; margin-bottom: 20px;">
        Booking ID: <strong>${booking.id}</strong> • Status: <strong>Enquiry Logged in Admin Dashboard</strong>
      </p>

      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 20px; text-align: left; margin-bottom: 24px;">
        <h4 style="color: #eeddb0; font-size: 1rem; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
          <i class="fa-solid fa-bell text-gold"></i> Real-Time Notifications Dispatched
        </h4>
        <div style="font-size: 0.88rem; color: #d1d5db; line-height: 1.7;">
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Central Dashboard:</strong> Order alert received & registered.</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Google Sheets & Email:</strong> Dispatched to naishvieventempire@gmail.com.</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Customer:</strong> ${booking.customerName} (${booking.mobile})</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Events:</strong> ${booking.events.join(', ')}</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Location:</strong> ${booking.location} | Date: ${booking.eventDate}</div>
          <div><i class="fa-solid fa-check text-gold"></i> <strong>Services:</strong> ${booking.services.join(', ')}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="https://api.whatsapp.com/send?phone=918279622416&text=${waText}" target="_blank" class="btn btn-gold btn-lg">
          <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> Connect Directly on WhatsApp
        </a>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
          <a href="/customer" class="btn btn-maroon">
            <i class="fa-solid fa-user-check"></i> Track Booking
          </a>
          <a href="/customer-portal?bookingId=${booking.id}" class="btn btn-outline-gold">
            <i class="fa-solid fa-file-invoice-dollar"></i> View Custom Quotation
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
  }
}

// Helper shortcuts for clicks from cards
function selectEventAndScroll(eventName) {
  const pill = document.querySelector(`.event-pill-checkbox[value="${eventName}"]`);
  if (pill) {
    pill.checked = true;
    const parent = pill.closest('.event-pill-item');
    if (parent) parent.classList.add('selected');
  }
  const planner = document.getElementById('weddingPlannerEngine');
  if (planner) planner.scrollIntoView({ behavior: 'smooth' });
}

function selectServiceAndScroll(serviceName) {
  const chk = document.querySelector(`.service-checkbox-input[value="${serviceName}"]`);
  if (chk) {
    chk.checked = true;
    const parent = chk.closest('.service-checkbox-card');
    if (parent) parent.classList.add('selected');
  }
  const planner = document.getElementById('weddingPlannerEngine');
  if (planner) planner.scrollIntoView({ behavior: 'smooth' });
}

function selectPackageAndOpenWizard(packageId) {
  const radio = document.querySelector(`input[name="selectedPackageRadio"][value="${packageId}"]`);
  if (radio) {
    radio.checked = true;
    wizardState.selectedPackage = packageId;
  }
  const planner = document.getElementById('weddingPlannerEngine');
  if (planner) planner.scrollIntoView({ behavior: 'smooth' });
}

// Quick footer consultation form
function initQuickBookingForm() {
  const form = document.getElementById('quickConsultForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="quickName"]').value;
    const phone = form.querySelector('[name="quickPhone"]').value;
    const city = form.querySelector('[name="quickCity"]').value;

    const b = window.ncStore.createBooking({
      customerName: name,
      mobile: phone,
      location: city,
      events: ['Full Wedding Package'],
      packageId: 'gold',
      packageName: 'Gold Package'
    });

    alert(`Thank you, ${name}! Your consultation request has been received. Our senior wedding planner will call you on ${phone}.`);
    form.reset();
  });
}
