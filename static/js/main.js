// main.js

const pageContent = document.getElementById("pageContent");

// Load a new HTML page dynamically
async function loadPage(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    pageContent.classList.add("fade-slide-out");

    setTimeout(() => {
      pageContent.innerHTML = html;
      pageContent.scrollTop = 0;
      pageContent.classList.remove("fade-slide-out");
      pageContent.classList.add("fade-slide-in");

      // Inject page-specific JS and rebind initializers
    if (url.includes("clinic")) {
      loadScript("/static/js/clinic.js", () => {
        window.downloadAsPDF = downloadAsPDF;
        window.downloadAsPNG = downloadAsPNG;
        if (typeof editSection !== "undefined") {
          window.editSection = editSection;
        }
        window.diagnoseBackend = diagnoseBackend;
      });
      loadScript("/static/js/llm.js");
    }

      if (url.includes("chat")) {
      loadScript("/static/js/chat.js", () => {
        if (typeof initChat === "function") initChat();
        loadScript("/static/js/tts.js");
      });
    }


      if (url.includes("home")) {
        loadScript("/static/js/home.js");
      }

      setTimeout(() => {
        pageContent.classList.remove("fade-slide-in");
      }, 400);
    }, 300);
  } catch (err) {
    pageContent.innerHTML = "<div class='text-center text-red-600 py-12'>Failed to load page.</div>";
  }
}

// Utility to load JS dynamically
function loadScript(src, callback) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) existing.remove(); // Force reload if already present

  const script = document.createElement("script");
  script.src = src;
  script.onload = () => {
    console.log(`✅ ${src} loaded`);
    if (typeof callback === "function") callback();
  };
  document.body.appendChild(script);
}

// Highlight nav links
function updateActiveNav(path) {
  document.querySelectorAll("a[href]").forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("text-primary", "border-b-2", "border-primary");
    } else {
      link.classList.remove("text-primary", "border-b-2", "border-primary");
    }
  });
}

// Collapse mobile menu
function collapseMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
  }
}

// Handle internal navigation links
document.addEventListener("click", function (e) {
  const link = e.target.closest("a[href^='/']");
  if (link && !link.hasAttribute("download") && !link.hasAttribute("target")) {
    const href = link.getAttribute("href");
    if (href.startsWith("/")) {
      e.preventDefault();
      const page = href === "/" ? "home" : href.slice(1);
      loadPage(`${page}.html`);
      updateActiveNav(href);
      history.pushState({ path: href }, "", href);
      collapseMobileMenu();
    }
  }
});

// Handle hash links
document.addEventListener("click", function (e) {
  const link = e.target.closest("a[href^='#']");
  if (link) {
    const id = link.getAttribute("href").substring(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      collapseMobileMenu();
    }
  }
});

// On initial load
window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.slice(1);
  loadPage(`${path}.html`);
  updateActiveNav(location.pathname);
});

// Back/forward navigation
window.addEventListener("popstate", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.slice(1);
  loadPage(`${path}.html`);
  updateActiveNav(location.pathname);
});

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden", "slide-exit", "slide-exit-active");
    menu.classList.add("slide-enter");
    requestAnimationFrame(() => menu.classList.add("slide-enter-active"));
    setTimeout(() => collapseMobileMenu(), 5000);
  } else {
    menu.classList.remove("slide-enter", "slide-enter-active");
    menu.classList.add("slide-exit");
    requestAnimationFrame(() => menu.classList.add("slide-exit-active"));
    setTimeout(() => {
      menu.classList.add("hidden");
      menu.classList.remove("slide-exit", "slide-exit-active");
    }, 300);
  }
}

document.querySelector(".mobile-menu-button")?.addEventListener("click", toggleMobileMenu);
