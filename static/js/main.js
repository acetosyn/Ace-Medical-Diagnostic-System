// main.js

const pageContent = document.getElementById("pageContent");

// Load a new HTML page
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

      setTimeout(() => {
        pageContent.classList.remove("fade-slide-in");
      }, 400);
    }, 300);
  } catch (err) {
    pageContent.innerHTML = "<div class='text-center text-red-600 py-12'>Failed to load page.</div>";
  }
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

// Collapse mobile menu (if open)
function collapseMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
  }
}

// Handle internal links
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
      collapseMobileMenu();  // 🔁 collapse menu if clicked
    }
  }
});

// Handle hash links (e.g., #contact)
document.addEventListener("click", function (e) {
  const link = e.target.closest("a[href^='#']");
  if (link) {
    const id = link.getAttribute("href").substring(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      collapseMobileMenu(); // 🔁 collapse on scroll
    }
  }
});

// On load
window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.slice(1);
  loadPage(`${path}.html`);
  updateActiveNav(location.pathname);
});

// Back/forward nav
window.addEventListener("popstate", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.slice(1);
  loadPage(`${path}.html`);
  updateActiveNav(location.pathname);
});

// Toggle mobile menu
// Slide animation for mobile menu
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");

  if (!menu) return;

  if (menu.classList.contains("hidden")) {
    // Show with animation
    menu.classList.remove("hidden", "slide-exit", "slide-exit-active");
    menu.classList.add("slide-enter");

    requestAnimationFrame(() => {
      menu.classList.add("slide-enter-active");
    });

    // Auto-collapse after 5 seconds
    setTimeout(() => collapseMobileMenu(), 5000);

  } else {
    // Hide with animation
    menu.classList.remove("slide-enter", "slide-enter-active");
    menu.classList.add("slide-exit");

    requestAnimationFrame(() => {
      menu.classList.add("slide-exit-active");
    });

    setTimeout(() => {
      menu.classList.add("hidden");
      menu.classList.remove("slide-exit", "slide-exit-active");
    }, 300);
  }
}

function collapseMobileMenu() {
  const menu = document.getElementById("mobileMenu");

  if (!menu || menu.classList.contains("hidden")) return;

  menu.classList.remove("slide-enter", "slide-enter-active");
  menu.classList.add("slide-exit");

  requestAnimationFrame(() => {
    menu.classList.add("slide-exit-active");
  });

  setTimeout(() => {
    menu.classList.add("hidden");
    menu.classList.remove("slide-exit", "slide-exit-active");
  }, 300);
}

document.querySelector(".mobile-menu-button")?.addEventListener("click", toggleMobileMenu);

