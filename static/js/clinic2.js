// =============== 🧠 LLM Tools (Simplify / Translate / ICD Mapping) ==============
function runLLM(action) {
  let prompt = "";
  const reportText = document.querySelector(".report-card")?.innerText || "";

  if (!reportText) return alert("No report content found!");

  switch (action) {
    case "simplify":
      prompt = `Simplify the following patient report:\n\n${reportText}`;
      break;
    case "translate":
      prompt = `Translate this clinical report into plain, non-technical English:\n\n${reportText}`;
      break;
    case "map_icd":
      prompt = `Map the clinical findings in this report to relevant ICD-10 codes:\n\n${reportText}`;
      break;
    default:
      return alert("Unknown action");
  }

  sendLLMRequest(prompt);
}

// =============== 💬 Chat About Report (Ask a Question) ==============
document.addEventListener("click", (e) => {
  if (e.target.id === "llm-send-btn") {
    const input = document.getElementById("llm-chat-input");
    const question = input.value.trim();
    if (!question) return;

    addChatMessage("user", question);
    input.value = "";
    sendLLMRequest(question);
  }
});

// =============== 🌐 Send Request to Backend LLM API ==============
function sendLLMRequest(prompt) {
  const chatBox = document.getElementById("llm-chat-output");
  const aiContainer = document.createElement("div");
  aiContainer.className = "ai-msg text-sm text-gray-700 flex gap-2 items-start mt-3";
  aiContainer.innerHTML = `
    <div class="text-xl">🤖</div>
    <div class="response text-gray-700 whitespace-pre-line"></div>
  `;
  chatBox.appendChild(aiContainer);
  const responseDiv = aiContainer.querySelector(".response");

  fetch("/llm_chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  }).then(res => {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function readChunk() {
      reader.read().then(({ done, value }) => {
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        responseDiv.textContent = buffer;
        readChunk();
      });
    }
    readChunk();
  }).catch(err => {
    responseDiv.textContent = "[Error]: " + err.message;
  });
}

// =============== 🧠 Add Chat Message (User Bubble) ==============
function addChatMessage(role, text) {
  const chatBox = document.getElementById("llm-chat-output");

  const wrapper = document.createElement("div");
  wrapper.className = `${role}-msg text-sm flex gap-2 items-start mb-2`;

  if (role === "user") {
    wrapper.innerHTML = `
      <div class="text-xl">🧑</div>
      <div class="bg-blue-100 text-blue-800 p-2 rounded-lg shadow-sm max-w-[80%]">${text}</div>
    `;
  }

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}
