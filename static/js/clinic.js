// Generate report (Part 1 or Part 2)
function generateReport(section) {
  const formData = new FormData();

  if (section === 1) {
    formData.append("name", document.querySelector('input[placeholder="Enter patient\'s full name"]').value);
    formData.append("dob", document.querySelector('input[type="date"]').value);
    formData.append("sex", document.querySelector('select').value);
    formData.append("notes", document.querySelector('textarea').value);

    // ✅ Include passport image
    const passportInput = document.getElementById("passportUpload");
    if (passportInput && passportInput.files.length > 0) {
      formData.append("passport", passportInput.files[0]);
    }

    document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      if (cb.checked) {
        const label = cb.parentElement.textContent.trim();
        if (cb.closest('.bg-gray-50')) {
          formData.append("symptoms", label);
        } else {
          formData.append("history", label);
        }
      }
    });

    fetch("/generate_report", {
      method: "POST",
      body: formData
    })
    .then(res => res.text())
    .then(html => {
      document.getElementById("part1").innerHTML = html;
    });

  } else if (section === 2) {
    const name = document.querySelector('#part2 input[type="text"]').value;
    formData.append("quick_name", name);

    // ✅ Include lab scan image
    const labInput = document.getElementById("labUpload");
    if (labInput && labInput.files.length > 0) {
      formData.append("lab_scan", labInput.files[0]);
    }

    fetch("/generate_quick_report", {
      method: "POST",
      body: formData
    })
    .then(res => res.text())
    .then(html => {
      document.getElementById("part2").innerHTML = html;
    });
  }
}

// Reload page for editing
function editSection(section) {
  location.reload(); // Replace later with stateful edit if needed
}

// Simulate backend diagnosis
function diagnoseBackend(section) {
  alert(`Sending Part ${section} data to backend for diagnosis...`);
}

// Download report as PNG
function downloadAsPNG(section) {
  const target = document.querySelector(`#part${section} .report-card`);
  if (!target) return alert("No report found!");

  html2canvas(target).then(canvas => {
    const link = document.createElement("a");
    link.download = `ACE_Report_Part${section}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// Download report as PDF
function downloadAsPDF(section) {
  const target = document.querySelector(`#part${section} .report-card`);
  if (!target) return alert("No report found!");

  html2canvas(target).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ACE_Report_Part${section}.pdf`);
  });
}

// 📸 Preview uploaded image inside a container with file name
function handleImageUpload(inputElement, previewId) {
  const preview = document.getElementById(previewId);
  if (!inputElement.files?.length || !preview) return;

  const file = inputElement.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    preview.innerHTML = `
      <p class="text-sm text-gray-500 mt-2">Selected: ${file.name}</p>
      <img src="${e.target.result}" alt="Preview" class="mt-2 rounded-lg shadow max-h-60 mx-auto" />
      <div class="mt-3 text-center">
        <button onclick="clearUpload('${inputElement.id}', '${previewId}')"
          class="clear-btn inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-button bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition"
          aria-label="Clear uploaded file">
          <i class="ri-close-line"></i>
          Clear
        </button>
      </div>
    `;
  };

  reader.readAsDataURL(file);
}

// 🧼 Clear image and reset preview container
function clearUpload(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (input && preview) {
    input.value = "";
    preview.innerHTML = `<span class="text-sm text-gray-500 italic">No file selected.</span>`;
  }
}

// Make key functions available to dynamically inserted buttons
window.downloadAsPDF = downloadAsPDF;
window.downloadAsPNG = downloadAsPNG;
window.editSection = editSection;
window.diagnoseBackend = diagnoseBackend;
