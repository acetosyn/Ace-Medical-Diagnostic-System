// Navbar toggle for mobile menu
document.addEventListener('DOMContentLoaded', function () {
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }
});

// Form Interactions: Summary updates and custom inputs
document.addEventListener('DOMContentLoaded', function () {
  const clinicalSummary = document.getElementById('clinicalSummary');
  const symptomsSummary = document.getElementById('symptomsSummary');
  const historySummary = document.getElementById('historySummary');
  const labsSummary = document.getElementById('labsSummary');

  function updateSummary() {
    if (clinicalSummary) clinicalSummary.classList.remove('hidden');

    // Update symptoms summary
    const selectedSymptoms = Array.from(document.querySelectorAll('input[id^="symptom"]:checked'))
      .map(checkbox => checkbox.nextElementSibling?.textContent.trim())
      .filter(Boolean);
    if (symptomsSummary) {
      symptomsSummary.textContent = selectedSymptoms.length > 0
        ? selectedSymptoms.join(', ')
        : 'No symptoms selected';
    }

    // Update medical history summary
    const selectedHistory = Array.from(document.querySelectorAll('input[id^="history"]:checked'))
      .map(checkbox => checkbox.nextElementSibling?.textContent.trim())
      .filter(Boolean);
    if (historySummary) {
      historySummary.textContent = selectedHistory.length > 0
        ? selectedHistory.join(', ')
        : 'No medical history selected';
    }

    // Update labs summary
    const labTests = Array.from(document.querySelectorAll('input[id^="lab"][id$="-name"]'))
      .map(input => {
        const valueInput = document.getElementById(input.id.replace('-name', '-value'));
        const value = valueInput ? valueInput.value : '';
        return `${input.value}: ${value}`;
      }).filter(Boolean);
    if (labsSummary) {
      labsSummary.textContent = labTests.length > 0
        ? labTests.join('\n')
        : 'No lab results entered';
    }
  }

  // Attach event listeners to all inputs
  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('change', updateSummary);
  });

  // Custom checkbox behavior
  document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function () {
      this.checked = !this.checked;
    });
  });

  // Custom radio behavior
  document.querySelectorAll('.custom-radio').forEach(radio => {
    radio.addEventListener('click', function () {
      const name = this.getAttribute('name');
      if (name) {
        document.querySelectorAll(`.custom-radio[name="${name}"]`).forEach(r => {
          r.checked = false;
        });
      }
      this.checked = true;
    });
  });

  // Custom switch behavior (placeholder for future logic)
  document.querySelectorAll('.custom-switch input').forEach(switchEl => {
    switchEl.addEventListener('change', function () {
      // Custom logic for switches can go here
    });
  });
});

// Demo Form Progress Bar Navigation
document.addEventListener('DOMContentLoaded', function () {
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressLines = document.querySelectorAll('.progress-line');

  progressSteps.forEach((step, index) => {
    step.addEventListener('click', function () {
      progressSteps.forEach((s, i) => {
        if (i < index) {
          s.classList.add('completed');
          s.classList.remove('active');
          if (i < progressLines.length) {
            progressLines[i].classList.add('active');
          }
        } else if (i === index) {
          s.classList.add('active');
          s.classList.remove('completed');
        } else {
          s.classList.remove('active', 'completed');
          if (i - 1 < progressLines.length) {
            progressLines[i - 1].classList.remove('active');
          }
        }
      });
    });
  });
});

// Animate Hero Section on Load
document.addEventListener('DOMContentLoaded', function () {
  const slideUps = document.querySelectorAll('.animate-slide-up');
  slideUps.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('show');
    }, index * 200); // staggered appearance
  });
});
