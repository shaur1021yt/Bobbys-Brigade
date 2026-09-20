document.addEventListener('DOMContentLoaded', function () {
  // Skip-to-content link
  var skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to content';
  document.body.insertBefore(skipLink, document.body.firstChild);
  // Add target id to first section after header
  var header = document.querySelector('.site-header');
  if (header && header.nextElementSibling) {
    header.nextElementSibling.id = 'main-content';
  }

  // Lazy-load images that don't already have a loading attribute
  document.querySelectorAll('img:not([loading])').forEach(function (img) {
    img.setAttribute('loading', 'lazy');
  });

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      var expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    // Close mobile nav when any link inside it is clicked
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Simple scroll-reveal
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      io.observe(el);
    });
  }
});
