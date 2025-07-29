// Cache user-entered data for both sections
let part1Data = {};
let part2Data = {};

// Generate report (Part 1 or Part 2)
function generateReport(section) {
  const formData = new FormData();

  if (section === 1) {
    const name = document.getElementById("part1").querySelector('input[placeholder="Enter patient\'s full name"]').value;
    const dob = document.getElementById("part1").querySelector('input[type="date"]').value;
    const sex = document.getElementById("part1").querySelector('select').value;
    const notes = document.querySelector('textarea[name="notes"]').value;

    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("sex", sex);
    formData.append("notes", notes);

    const passportInput = document.getElementById("passportUpload");
    if (passportInput?.files?.length) formData.append("passport", passportInput.files[0]);

    const reportInput = document.getElementById("reportUpload");
    if (reportInput?.files?.length) formData.append("report_scan", reportInput.files[0]);

    const symptoms = [], history = [];
    document.querySelectorAll('[data-section="symptoms"] input[type="checkbox"]').forEach(cb => {
      if (cb.checked) symptoms.push(cb.value);
    });
    document.querySelectorAll('[data-section="history"] input[type="checkbox"]').forEach(cb => {
      if (cb.checked) history.push(cb.value);
    });

    symptoms.forEach(symptom => formData.append("symptoms", symptom));
    history.forEach(hx => formData.append("history", hx));

    // Cache entered data
    part1Data = { name, dob, sex, notes, symptoms, history };

    fetch("/generate_report", { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => renderReport(section, data));

  } else if (section === 2) {
    const quick_name = document.querySelector('#part2 input[type="text"]').value;
    formData.append("quick_name", quick_name);

    const labInput = document.getElementById("labUpload");
    if (labInput?.files?.length) formData.append("lab_scan", labInput.files[0]);

    // Cache entered data
    part2Data = { quick_name };

    fetch("/generate_quick_report", { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => renderReport(section, data));
  }
}

// Inject report data into <template>
function renderReport(section, data) {
  const template = document.getElementById("reportTemplate");
  const clone = template.content.cloneNode(true);
  const part = document.getElementById(`part${section}`);
  part.innerHTML = "";
  part.appendChild(clone);

  const card = part.querySelector(".report-card");

  const title = section === 1 ? "Patient Report" : "Quick Upload Report";
  card.querySelector(".report-title").textContent = title;

  const name = data.name || data.quick_name || "N/A";
  card.querySelector(".report-name").innerHTML = `<strong>Name:</strong> ${name}`;

  const details = card.querySelector(".report-details");
  if (section === 1) {
    details.innerHTML = `
      <p><strong>Date of Birth:</strong> ${data.dob || "N/A"}</p>
      <p><strong>Sex:</strong> ${data.sex || "N/A"}</p>
      <p><strong>Symptoms:</strong> ${data.symptoms?.join(", ") || "None"}</p>
      <p><strong>Medical History:</strong> ${data.history?.join(", ") || "None"}</p>
      <p><strong>Additional Notes:</strong> ${data.notes || "None"}</p>
    `;
  }

  const imgContainer = card.querySelector(".report-images");

  if (data.passport_b64) {
    const img = document.createElement("img");
    img.src = `data:image/jpeg;base64,${data.passport_b64}`;
    img.alt = "Passport";
    img.className = "w-32 h-32 object-cover rounded shadow mb-4";
    imgContainer.appendChild(img);
  }

  const scanSrc = data.lab_b64 || data.report_scan_b64;
  if (scanSrc) {
    const img = document.createElement("img");
    img.src = `data:image/jpeg;base64,${scanSrc}`;
    img.alt = "Scanned Report or Lab";
    img.className = "w-40 h-auto rounded shadow";
    imgContainer.appendChild(img);
  }

  card.querySelectorAll("[data-section]").forEach(btn => btn.setAttribute("data-section", section));
  card.querySelectorAll(".pdf-btn").forEach(btn => btn.addEventListener("click", () => downloadAsPDF(section)));
  card.querySelectorAll(".png-btn").forEach(btn => btn.addEventListener("click", () => downloadAsPNG(section)));
  card.querySelectorAll(".diagnose-btn").forEach(btn => btn.addEventListener("click", () => diagnoseBackend(section)));
  card.querySelectorAll(".back-btn").forEach(btn => btn.addEventListener("click", () => loadClinicForm(section)));

  if (typeof initLLMChat === "function" && !card.classList.contains("llm-initialized")) {
    initLLMChat();
    card.classList.add("llm-initialized");
  }
}

// Restore the full intake form from <template> with cached data
function loadClinicForm(section) {
  const part1 = document.getElementById("part1");
  const part2 = document.getElementById("part2");
  const template1 = document.getElementById("part1-template");
  const template2 = document.getElementById("part2-template");

  if (section === 1 && part1 && template1 && template1.content.hasChildNodes()) {
    part1.innerHTML = "";
    part1.appendChild(template1.content.cloneNode(true));

    // Restore cached values
    if (part1Data.name) part1.querySelector('input[placeholder="Enter patient\'s full name"]').value = part1Data.name;
    if (part1Data.dob) part1.querySelector('input[type="date"]').value = part1Data.dob;
    if (part1Data.sex) part1.querySelector('select').value = part1Data.sex;
    if (part1Data.notes) part1.querySelector('textarea[name="notes"]').value = part1Data.notes;

    // Restore checkboxes
    part1.querySelectorAll('[data-section="symptoms"] input[type="checkbox"]').forEach(cb => {
      cb.checked = part1Data.symptoms?.includes(cb.value) || false;
    });
    part1.querySelectorAll('[data-section="history"] input[type="checkbox"]').forEach(cb => {
      cb.checked = part1Data.history?.includes(cb.value) || false;
    });
  }

  if (section === 2 && part2 && template2 && template2.content.hasChildNodes()) {
    part2.innerHTML = "";
    part2.appendChild(template2.content.cloneNode(true));

    // Restore cached value
    if (part2Data.quick_name) part2.querySelector('input[type="text"]').value = part2Data.quick_name;
  }

  console.log(`Section ${section} form restored with cached data.`);
}

function diagnoseBackend(section) {
  alert(`Sending Part ${section} data to backend for diagnosis...`);
}

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

function downloadAsPDF(section) {
  const target = document.querySelector(`#part${section} .report-card`);
  if (!target) return alert("No report found!");

  html2canvas(target, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ACE_Report_Part${section}.pdf`);
  }).catch(err => {
    alert("Failed to generate PDF. Try again.");
    console.error(err);
  });
}

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
        <button onclick="clearUpload('${inputElement.id}', '${previewId}')" class="clear-btn inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-button bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition" aria-label="Clear uploaded file">
          <i class="ri-close-line"></i>
          Clear
        </button>
      </div>
    `;
  };

  reader.readAsDataURL(file);
}

function clearUpload(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (input && preview) {
    input.value = "";
    preview.innerHTML = `<span class="text-sm text-gray-500 italic">No file selected.</span>`;
  }
}

window.downloadAsPDF = downloadAsPDF;
window.downloadAsPNG = downloadAsPNG;
window.diagnoseBackend = diagnoseBackend;
