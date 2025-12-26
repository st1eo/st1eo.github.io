// ========= Helpers =========
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {
  const nav = $("#nav");
  const toast = $("#toast");
  const themeBtn = $("#themeBtn");
  const brandLogo = $("#brandLogo");
  const burger = $("#burger");


  // ========= Toast =========
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-show"), 2200);
  }

  // ========= Mobile menu =========
  burger?.addEventListener("click", () => {
    nav?.classList.toggle("is-open");
  });

  // Smooth scroll + close menu
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const el = $(id);
      if (!el) return;

      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      nav?.classList.remove("is-open");
    });
  });

  // ========= Theme toggle =========
  function updateThemeUI() {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";

    // theme button icon
    if (themeBtn) themeBtn.textContent = theme === "light" ? "🌙" : "☀️";

    // logo swap
    if (brandLogo) {
        brandLogo.src = theme === "light" ? "blue.png" : "white.png";
    }
 }


  // init theme from storage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeUI();

  themeBtn?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeUI();
  });

  // ========= Forms =========
  $("#lead")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("✅ Ariza yuborildi! Tez orada bog‘lanamiz.");
    e.target.reset();
  });

  $("#ctaLead")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("✅ Ariza yuborildi! Tez orada bog‘lanamiz.");
    e.target.reset();
  });

  // ========= Scrollspy (active nav) =========
  const links = $$(".nav__link");
  const sections = links
    .map((l) => $(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          links.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === id)
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
    );

    sections.forEach((s) => obs.observe(s));
  }

  modal?.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeShorts();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeShorts();
  });
});
// ========= Shorts modal (NEW STYLE) =========
// ===== YouTube modal (reviews) =====
const ytModal = document.getElementById("ytModal");
const ytOpenBtn = document.getElementById("ytOpenBtn");


function openYT(id){
  ytModal?.classList.add("is-open");
  ytModal?.setAttribute("aria-hidden","false");

  if (ytOpenBtn) ytOpenBtn.href = `https://www.youtube.com/shorts/${id}`;
}

function closeYT(){
  ytModal?.classList.remove("is-open");
  ytModal?.setAttribute("aria-hidden", "true");
  if (ytFrame) ytFrame.src = "";
}

document.querySelectorAll(".short-tile").forEach(tile => {
  tile.addEventListener("click", (e) => {
    const id = tile.dataset.video;
    if (!id) return;

    // откроем shorts на YouTube (без iframe)
    const url = `https://www.youtube.com/shorts/${id}`;

    // если это <a>, то можно не мешать, но на всякий случай:
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  });
});


ytModal?.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeYT();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && ytModal?.classList.contains("is-open")) closeYT();
});


function fillUTM(form){
  if (!form) return;
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]
    .forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = localStorage.getItem(key) || "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  fillUTM(document.getElementById("lead"));
  fillUTM(document.getElementById("ctaLead"));
});
function getUTM() {
  return {
    utm_source: localStorage.getItem("utm_source") || "",
    utm_medium: localStorage.getItem("utm_medium") || "",
    utm_campaign: localStorage.getItem("utm_campaign") || "",
    utm_content: localStorage.getItem("utm_content") || "",
    utm_term: localStorage.getItem("utm_term") || "",
  };
}

async function sendToCRM(form) {
  const payload = {
    name: form.name?.value || "",
    phone: form.phone?.value || "",
    goal: form.goal?.value || form.tarif?.value || "",
    ...getUTM(),
    page: window.location.href,
  };

  const r = await fetch("https://ilmmarkazi.amocrm.ru/api/amocrm/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "CRM error");
  return data;
}

document.getElementById("lead")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await sendToCRM(e.target);
    showToast("✅ Ariza yuborildi! Tez orada bog‘lanamiz.");
    e.target.reset();
  } catch (err) {
    console.error(err);
    showToast("❌ Xatolik. Qayta urinib ko‘ring.");
  }
});

const API_BASE = "https://macropterous-distressedly-ryland.ngrok-free.dev";

fetch(`${API_BASE}/api/lead`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "1"
  },
  body: JSON.stringify({
    name,
    phone,
    email,
    comment
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
