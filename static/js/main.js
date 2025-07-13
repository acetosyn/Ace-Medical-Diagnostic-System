// main.js

const pageContent = document.getElementById("pageContent");

// Load page with slide animation
async function loadPage(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Slide out old content
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

// Highlight active nav and footer links
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

// Handle internal navigation using event delegation
document.addEventListener("click", function (e) {
  const link = e.target.closest("a[href^='/']");
  if (link && !link.hasAttribute("download") && !link.hasAttribute("target")) {
    const href = link.getAttribute("href");
    const isInternal = href.startsWith("/") && !href.startsWith("//");

    if (isInternal) {
      e.preventDefault();
      const page = href === "/" ? "home" : href.replace(/^\//, "");
      const file = `${page}.html`;

      loadPage(file);
      updateActiveNav(href);
      history.pushState({ path: href }, "", href);
    }
  }
});

// Handle hash-based scroll (e.g. Contact Us)
document.addEventListener("click", function (e) {
  const link = e.target.closest("a[href^='#']");
  if (link) {
    const id = link.getAttribute("href").substring(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
});

// Load default page on initial visit
window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.replace(/^\//, "");
  const file = `${path}.html`;

  loadPage(file);
  updateActiveNav(location.pathname);
});

// Handle browser navigation (back/forward)
window.addEventListener("popstate", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.replace(/^\//, "");
  const file = `${path}.html`;

  loadPage(file);
  updateActiveNav(location.pathname);
});

// Scroll to contact section (if used by onclick="scrollToContact()")
function scrollToContact() {
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Toggle mobile menu
document.querySelector(".mobile-menu-button")?.addEventListener("click", () => {
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) {
    mobileMenu.classList.toggle("hidden");
  }
});
