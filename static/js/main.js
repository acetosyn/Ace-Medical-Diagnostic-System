// main.js

const pageContent = document.getElementById("pageContent");
const navLinks = document.querySelectorAll("nav a[href]");

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

// Highlight current nav link
function updateActiveNav(path) {
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) {
      link.classList.add("text-primary", "border-b-2", "border-primary");
    } else {
      link.classList.remove("text-primary", "border-b-2", "border-primary");
    }
  });
}

// Handle nav clicks
navLinks.forEach(link => {
  const href = link.getAttribute("href");

  if (href.startsWith("/")) {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = href.replace(/^\//, "") || "home";
      const file = `${page}.html`;

      loadPage(file);
      updateActiveNav(href);
      history.pushState({ path: href }, "", href);
    });
  }
});

// On first load
window.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.replace(/^\//, "");
  const file = `${path}.html`;

  loadPage(file);
  updateActiveNav(location.pathname);
});

// Handle browser back/forward
window.addEventListener("popstate", () => {
  const path = location.pathname === "/" ? "home" : location.pathname.replace(/^\//, "");
  const file = `${path}.html`;

  loadPage(file);
  updateActiveNav(location.pathname);
});
