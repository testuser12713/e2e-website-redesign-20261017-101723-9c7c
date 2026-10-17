(function () {
  "use strict";

  const STORAGE_KEY = "equicrew.prototype.inquiries.v1";
  const SESSION_KEY = "equicrew.prototype.session.v1";
  const DEMO_EMAIL = "demo@equicrew.com";
  const DEMO_PASSWORD = "EquiCrew-Demo-2026";

  const DEMO_INQUIRIES = [
    {
      id: 248,
      first_name: "Anna",
      last_name: "Gruber",
      email: "anna.gruber@example.at",
      message:
        "Guten Tag, wir sanieren unser Einfamilienhaus in Perg und möchten die bestehende Ölheizung durch ein zukunftssicheres System ersetzen. Ist der EquiCube auch in Kombination mit einer bestehenden Photovoltaikanlage möglich? Bitte um einen Termin für ein erstes Gespräch.",
      created_at: "2026-10-14T06:42:00Z",
      status: "new"
    },
    {
      id: 247,
      first_name: "Markus",
      last_name: "Pichler",
      email: "markus.pichler@example.at",
      message:
        "Wir planen den Neubau eines Niedrigenergiehauses mit Fußbodenheizung. Welche Voraussetzungen müssen im Technikraum geschaffen werden und wie lange dauert die Installation vor Ort?",
      created_at: "2026-10-13T15:15:00Z",
      status: "read"
    },
    {
      id: 246,
      first_name: "Sabine",
      last_name: "Aigner",
      email: "sabine.aigner@example.at",
      message:
        "Sehr geehrtes EquiCrew-Team, wir interessieren uns für ein Angebot für ein Reihenhaus mit 140 m² Wohnfläche. Die bestehende Gastherme ist am Ende ihrer Lebensdauer. Bitte melden Sie sich bei uns für eine erste Einschätzung.",
      created_at: "2026-10-12T09:03:00Z",
      status: "new"
    },
    {
      id: 245,
      first_name: "Thomas",
      last_name: "Reiter",
      email: "thomas.reiter@example.at",
      message:
        "Wir haben bereits eine Wärmepumpe und eine PV-Anlage, die aber nicht optimal zusammenspielen. Kann der EquiCube die Steuerung übernehmen und die Komponenten sinnvoll ergänzen?",
      created_at: "2026-10-10T17:28:00Z",
      status: "done"
    },
    {
      id: 244,
      first_name: "Lena",
      last_name: "Obermüller",
      email: "lena.obermueller@example.at",
      message:
        "Bitte um Rückruf bezüglich einer Wartungsanfrage. Unsere Anlage läuft seit zwei Jahren problemlos, wir möchten den nächsten Servicetermin gerne frühzeitig vereinbaren.",
      created_at: "2026-10-09T07:12:00Z",
      status: "read"
    },
    {
      id: 243,
      first_name: "Florian",
      last_name: "Ebner",
      email: "florian.ebner@example.at",
      message:
        "Guten Tag, wie aufwendig ist der Austausch des Pufferspeichers bei einem EquiCube aus der ersten Serie? Gibt es hierfür standardisierte Module?",
      created_at: "2026-10-07T13:46:00Z",
      status: "done"
    },
    {
      id: 242,
      first_name: "Ingrid",
      last_name: "Mayr",
      email: "ingrid.mayr@example.at",
      message:
        "Unser Architekt hat den Technikraum für den EquiCube bereits eingeplant. Wir hätten gerne Unterlagen zu den Anschlussmaßen und zur benötigten Belüftung für die Detailplanung.",
      created_at: "2026-10-04T08:20:00Z",
      status: "read"
    },
    {
      id: 241,
      first_name: "Stefan",
      last_name: "Wakolbinger",
      email: "stefan.wakolbinger@example.at",
      message:
        "Gibt es die Möglichkeit, den EquiCube zunächst ohne Batterie zu betreiben und diese später nachzurüsten? Wir möchten die Investition gerne in Etappen umsetzen.",
      created_at: "2026-10-01T05:55:00Z",
      status: "done"
    }
  ];

  const STATUS_LABELS = {
    new: "Neu",
    read: "Gelesen",
    done: "Erledigt"
  };

  const icons = {
    arrow: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 5l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5l3.6 3.5L16 5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initials(item) {
    return `${item.first_name.charAt(0)}${item.last_name.charAt(0)}`.toUpperCase();
  }

  function sortNewestFirst(items) {
    return items.slice().sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  function readInquiries() {
    let stored = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) stored = parsed;
      }
    } catch (error) {
      stored = [];
    }

    const byId = new Map();
    stored.forEach((item) => {
      if (item && Number.isInteger(item.id)) byId.set(item.id, item);
    });
    DEMO_INQUIRIES.forEach((item) => {
      if (!byId.has(item.id)) byId.set(item.id, { ...item });
    });

    return sortNewestFirst(Array.from(byId.values()));
  }

  function writeInquiries(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      return false;
    }
  }

  let inquiries = readInquiries();

  function persist() {
    return writeInquiries(inquiries);
  }

  function formatDate(iso, withTime) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    const formatted = new Intl.DateTimeFormat("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Vienna"
    }).format(date);

    if (!withTime) return formatted;

    const time = new Intl.DateTimeFormat("de-AT", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Vienna"
    }).format(date);

    return `${formatted} · ${time} Uhr`;
  }

  function badgeFor(status) {
    const safeStatus = STATUS_LABELS[status] ? status : "new";
    return `<span class="badge badge-${safeStatus}">${STATUS_LABELS[safeStatus]}</span>`;
  }

  function setMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) return;

    const label = toggle.querySelector("[data-nav-label]");
    const closeMenu = (restoreFocus) => {
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      if (label) label.textContent = "Menü";
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (label) label.textContent = isOpen ? "Schließen" : "Menü";
      if (isOpen) {
        const firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu(false);
    });
  }

  function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const fields = {
      first_name: {
        input: form.elements.first_name,
        error: form.querySelector('[data-error-for="first_name"]'),
        validate(value) {
          return value.trim() ? "" : "Bitte gib deinen Vornamen ein.";
        }
      },
      last_name: {
        input: form.elements.last_name,
        error: form.querySelector('[data-error-for="last_name"]'),
        validate(value) {
          return value.trim() ? "" : "Bitte gib deinen Nachnamen ein.";
        }
      },
      email: {
        input: form.elements.email,
        error: form.querySelector('[data-error-for="email"]'),
        validate(value) {
          const trimmed = value.trim();
          if (!trimmed) return "Bitte gib deine E-Mail-Adresse ein.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return "Bitte gib eine gültige E-Mail-Adresse ein.";
          }
          return "";
        }
      },
      message: {
        input: form.elements.message,
        error: form.querySelector('[data-error-for="message"]'),
        validate(value) {
          return value.trim() ? "" : "Bitte schreib uns eine Nachricht.";
        }
      }
    };

    const touched = new Set();
    const submitButton = form.querySelector('[data-submit]');
    const success = document.querySelector("[data-contact-success]");
    const failure = document.querySelector("[data-contact-error]");
    const forceError = new URLSearchParams(window.location.search).get("state") === "error";

    function showFieldError(name, message) {
      const field = fields[name];
      if (!field) return;
      const wrapper = field.input.closest(".field");
      if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
      field.input.setAttribute("aria-invalid", message ? "true" : "false");
      if (field.error) field.error.textContent = message;
    }

    function validateField(name) {
      const field = fields[name];
      if (!field) return true;
      const message = field.validate(field.input.value);
      showFieldError(name, message);
      return !message;
    }

    function validateAll() {
      let firstInvalid = null;
      Object.keys(fields).forEach((name) => {
        const valid = validateField(name);
        if (!valid && !firstInvalid) firstInvalid = fields[name].input;
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    function hideStatus() {
      if (success) success.classList.remove("is-visible");
      if (failure) failure.classList.remove("is-visible");
    }

    function showSuccess() {
      hideStatus();
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    }

    function showFailure() {
      hideStatus();
      if (failure) {
        failure.classList.add("is-visible");
        failure.setAttribute("tabindex", "-1");
        failure.focus();
      }
    }

    Object.keys(fields).forEach((name) => {
      const field = fields[name];
      if (!field || !field.input) return;
      field.input.addEventListener("blur", () => {
        touched.add(name);
        validateField(name);
      });
      field.input.addEventListener("input", () => {
        if (touched.has(name)) validateField(name);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      touchAll();
      hideStatus();

      if (!validateAll()) return;

      const payload = {
        first_name: fields.first_name.input.value.trim(),
        last_name: fields.last_name.input.value.trim(),
        email: fields.email.input.value.trim(),
        message: fields.message.input.value.trim()
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalLabel = submitButton.innerHTML;
        submitButton.textContent = "Wird gesendet …";
      }

      window.setTimeout(() => {
        const nextId = inquiries.reduce((max, item) => Math.max(max, item.id), 240) + 1;
        const newInquiry = {
          id: nextId,
          ...payload,
          created_at: new Date().toISOString(),
          status: "new"
        };
        const stored = forceError ? false : persistWith([newInquiry, ...inquiries]);

        if (submitButton) {
          submitButton.disabled = false;
          if (submitButton.dataset.originalLabel) {
            submitButton.innerHTML = submitButton.dataset.originalLabel;
          }
        }

        if (!stored) {
          showFailure();
          return;
        }

        inquiries = sortNewestFirst([newInquiry, ...inquiries]);
        form.reset();
        touched.clear();
        Object.keys(fields).forEach((name) => showFieldError(name, ""));
        showSuccess();
      }, 650);
    });

    function touchAll() {
      Object.keys(fields).forEach((name) => touched.add(name));
    }

    function persistWith(items) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  function readSession() {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function getSessionEmail() {
    const session = readSession();
    return session && session.email ? session.email : DEMO_EMAIL;
  }

  function initLogout() {
    document.querySelectorAll('[data-action="logout"]').forEach((button) => {
      button.addEventListener("click", () => {
        try {
          window.sessionStorage.removeItem(SESSION_KEY);
        } catch (error) {
          /* no-op */
        }
        window.location.href = "admin-login.html";
      });
    });

    document.querySelectorAll("[data-admin-email]").forEach((node) => {
      node.textContent = getSessionEmail();
    });
  }

  function initLogin() {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;

    const email = form.elements.email;
    const password = form.elements.password;
    const emailError = form.querySelector('[data-login-error="email"]');
    const passwordError = form.querySelector('[data-login-error="password"]');
    const formError = document.querySelector("[data-login-form-error]");

    function setFieldError(input, errorNode, message) {
      const wrapper = input.closest(".field");
      if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorNode) errorNode.textContent = message;
    }

    function hideFormError() {
      if (!formError) return;
      formError.classList.remove("is-visible");
      formError.textContent = "";
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideFormError();

      const emailEmpty = !email.value.trim();
      const passwordEmpty = !password.value;
      setFieldError(
        email,
        emailError,
        emailEmpty ? "Bitte gib deine E-Mail-Adresse ein." : ""
      );
      setFieldError(
        password,
        passwordError,
        passwordEmpty ? "Bitte gib dein Passwort ein." : ""
      );

      if (emailEmpty || passwordEmpty) {
        (emailEmpty ? email : password).focus();
        return;
      }

      const matches =
        email.value.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() &&
        password.value === DEMO_PASSWORD;

      if (!matches) {
        if (formError) {
          formError.textContent =
            "E-Mail-Adresse oder Passwort ist nicht korrekt. Bitte versuche es erneut.";
          formError.classList.add("is-visible");
          formError.setAttribute("tabindex", "-1");
          formError.focus();
        }
        password.value = "";
        password.focus();
        return;
      }

      try {
        window.sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ email: DEMO_EMAIL, createdAt: new Date().toISOString() })
        );
      } catch (error) {
        /* session storage is optional for the prototype */
      }

      const nextParam = new URLSearchParams(window.location.search).get("next");
      const safeNext =
        nextParam &&
        /^(admin-inbox\.html|admin-inquiry-detail\.html)(\?[^#]*)?$/.test(nextParam)
          ? nextParam
          : "admin-inbox.html";

      window.location.href = safeNext;
    });

    [email, password].forEach((input) => {
      input.addEventListener("input", () => {
        const errorNode =
          input === email
            ? emailError
            : passwordError;
        setFieldError(input, errorNode, "");
      });
    });
  }

  function renderInbox() {
    const body = document.querySelector("[data-inbox-body]");
    if (!body) return;

    const newest = sortNewestFirst(inquiries);
    const newCount = newest.filter((item) => item.status === "new").length;

    document.querySelectorAll("[data-inquiry-count]").forEach((node) => {
      node.textContent = String(newest.length);
    });
    document.querySelectorAll("[data-new-count]").forEach((node) => {
      node.textContent = String(newCount);
    });
    document.querySelectorAll("[data-nav-count]").forEach((node) => {
      node.textContent = String(newest.length);
    });

    const empty = document.querySelector("[data-inbox-empty]");
    const table = document.querySelector("[data-inbox-table]");

    if (!newest.length) {
      if (empty) empty.hidden = false;
      if (table) table.hidden = true;
      return;
    }

    if (empty) empty.hidden = true;
    if (table) table.hidden = false;

    body.innerHTML = newest
      .map((item) => {
        const href = `admin-inquiry-detail.html?id=${item.id}`;
        const name = `${item.first_name} ${item.last_name}`;
        return `
          <tr>
            <td data-label="Name">
              <div class="person">
                <span class="avatar" aria-hidden="true">${escapeHtml(initials(item))}</span>
                <a class="person-link" href="${href}">${escapeHtml(name)}</a>
              </div>
            </td>
            <td data-label="E-Mail">
              <a class="cell-mail" href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>
            </td>
            <td data-label="Eingang">
              <span class="cell-date">${escapeHtml(formatDate(item.created_at, false))}<br>${escapeHtml(
                new Intl.DateTimeFormat("de-AT", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Europe/Vienna"
                }).format(new Date(item.created_at))
              )}</span>
            </td>
            <td data-label="Nachricht">
              <span class="cell-excerpt">${escapeHtml(item.message)}</span>
            </td>
            <td data-label="Status">${badgeFor(item.status)}</td>
            <td data-label="Aktion">
              <a class="row-chevron" href="${href}" aria-label="Anfrage von ${escapeHtml(name)} öffnen">
                ${icons.chevron}
              </a>
            </td>
          </tr>`;
      })
      .join("");
  }

  function initDetail() {
    const content = document.querySelector("[data-detail-content]");
    if (!content) return;

    const missing = document.querySelector("[data-detail-missing]");
    const params = new URLSearchParams(window.location.search);
    const requestedId = Number.parseInt(params.get("id"), 10);
    const fallback = sortNewestFirst(inquiries)[0];
    const inquiry =
      inquiries.find((item) => item.id === requestedId) ||
      (Number.isNaN(requestedId) ? fallback : null);

    if (!inquiry) {
      content.hidden = true;
      if (missing) missing.hidden = false;
      return;
    }

    if (missing) missing.hidden = true;
    content.hidden = false;

    const fullName = `${inquiry.first_name} ${inquiry.last_name}`;
    const setText = (selector, value) => {
      document.querySelectorAll(selector).forEach((node) => {
        node.textContent = value;
      });
    };

    setText("[data-detail-name]", fullName);
    setText("[data-detail-first-name]", inquiry.first_name);
    setText("[data-detail-last-name]", inquiry.last_name);
    setText("[data-detail-email]", inquiry.email);
    setText("[data-detail-message]", inquiry.message);
    setText("[data-detail-received]", formatDate(inquiry.created_at, true));
    setText("[data-detail-id]", `#${inquiry.id}`);
    setText("[data-detail-initials]", initials(inquiry));

    document.querySelectorAll("[data-detail-email-link]").forEach((link) => {
      link.href = `mailto:${inquiry.email}`;
    });

    document.title = `Anfrage von ${fullName} – EquiCrew Intern`;

    function renderStatus() {
      document.querySelectorAll("[data-detail-badge]").forEach((node) => {
        node.className = `badge badge-${inquiry.status}`;
        node.textContent = STATUS_LABELS[inquiry.status];
      });

      const actions = document.querySelector("[data-status-actions]");
      const note = document.querySelector("[data-status-note]");
      if (!actions) return;

      if (inquiry.status === "new") {
        actions.innerHTML = `
          <button class="btn btn-secondary btn-sm" type="button" data-status-action="read">
            ${icons.check}<span>Als gelesen markieren</span>
          </button>
          <button class="btn btn-primary btn-sm" type="button" data-status-action="done">
            ${icons.check}<span>Als erledigt markieren</span>
          </button>`;
        if (note) note.textContent = "Neue Anfrage. Markiere sie nach der Bearbeitung als gelesen oder erledigt.";
      } else if (inquiry.status === "read") {
        actions.innerHTML = `
          <button class="btn btn-primary btn-sm" type="button" data-status-action="done">
            ${icons.check}<span>Als erledigt markieren</span>
          </button>`;
        if (note) note.textContent = "Diese Anfrage ist als gelesen markiert.";
      } else {
        actions.innerHTML = "";
        if (note) note.textContent = "Diese Anfrage ist erledigt. Der Status bleibt in der Liste sichtbar.";
      }
    }

    content.addEventListener("click", (event) => {
      const button = event.target.closest("[data-status-action]");
      if (!button) return;
      const nextStatus = button.getAttribute("data-status-action");
      if (!STATUS_LABELS[nextStatus]) return;

      inquiry.status = nextStatus;
      const persisted = persist();
      renderStatus();

      const message = document.querySelector("[data-status-message]");
      if (message) {
        message.textContent = persisted
          ? `Status auf „${STATUS_LABELS[nextStatus]}“ gesetzt.`
          : "Der Status konnte in diesem Browser nicht gespeichert werden.";
        message.classList.add("is-visible");
        message.setAttribute("tabindex", "-1");
        message.focus();
      }
    });

    renderStatus();
  }

  const pageFile = window.location.pathname.split("/").pop();
  const protectedPage =
    pageFile === "admin-inbox.html" || pageFile === "admin-inquiry-detail.html";

  if (protectedPage && !readSession()) {
    const next = `${pageFile}${window.location.search}`;
    window.location.replace(`admin-login.html?next=${encodeURIComponent(next)}`);
    return;
  }

  setMobileNav();
  initContactForm();
  initLogin();
  initLogout();
  renderInbox();
  initDetail();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
