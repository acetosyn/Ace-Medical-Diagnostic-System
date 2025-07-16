function diagnoseBackend(sectionId = 1) {
  const part = document.querySelector(`#part${sectionId}`);
  if (!part) return;

  const formData = new FormData(document.querySelector("form"));

  fetch("/generate_report", {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(html => {
      part.innerHTML = html;

      // Then trigger diagnosis
      const data = {};
      formData.forEach((value, key) => {
        if (data[key]) {
          if (!Array.isArray(data[key])) data[key] = [data[key]];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });

      const reportInput = document.querySelector('input[name="report_scan"]');
      if (reportInput && reportInput.files.length > 0) {
        const reader = new FileReader();
        reader.onloadend = () => {
          data.report_scan_b64 = reader.result.split(",")[1];
          fetch("/run_diagnosis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          })
            .then(res => res.json())
            .then(result => {
              const card = document.querySelector(`#part${sectionId} .report-card`);
              const div = document.createElement("div");
              div.className = "mt-6 p-4 bg-green-50 text-gray-800 text-sm rounded shadow diagnosis-result";
              div.innerHTML = `
                <p><strong>Diagnosis Result:</strong> ${result.result}</p>
                <p><strong>Summary:</strong> ${result.summary}</p>
                <p><strong>Confidence:</strong> ${result.confidence}</p>
              `;
              card.appendChild(div);
            });
        };
        reader.readAsDataURL(reportInput.files[0]);
      }
    });
}
