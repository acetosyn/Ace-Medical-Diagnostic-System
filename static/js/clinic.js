// Generate report (Part 1 or Part 2)
function generateReport(section) {
  const formData = new FormData();

  if (section === 1) {
    formData.append("name", document.querySelector('input[placeholder="Enter patient\'s full name"]').value);
    formData.append("dob", document.querySelector('input[type="date"]').value);
    formData.append("sex", document.querySelector('select').value);
    formData.append("notes", document.querySelector('textarea').value);

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

// Manual handlers for file name preview (works regardless of visibility)
function bindUploadPreview(inputId, labelId) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(labelId);

  if (input && label) {
    input.addEventListener("change", () => {
      if (input.files?.length) {
        label.textContent = "Selected: " + input.files[0].name;
      } else {
        label.textContent = "";
      }
    });
  }
}

// Ensure DOM is ready (especially when injected dynamically)
window.addEventListener("load", () => {
  bindUploadPreview("labUpload", "lab-file-name");
  bindUploadPreview("reportUpload", "report-file-name");
});
