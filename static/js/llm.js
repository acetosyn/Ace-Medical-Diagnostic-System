// llm.js – Handles LLM chat from report interface

function sendLLMChat() {
  const inputEl = document.getElementById("llm-chat-input");
  const outputEl = document.getElementById("llm-chat-output");
  const userMessage = inputEl.value.trim();

  if (!userMessage) return;

  // Clear input & show loading
  inputEl.value = "";
  outputEl.innerHTML = "<div class='text-gray-400 italic'>🧠 Processing...</div>";

  const controller = new AbortController();
  fetch("/llm_chat", {
    method: "POST",
    body: JSON.stringify({ prompt: userMessage }),
    headers: {
      "Content-Type": "application/json"
    },
    signal: controller.signal
  }).then(response => {
    if (!response.body) throw new Error("No response stream");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    function read() {
      reader.read().then(({ done, value }) => {
        if (done) return;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        outputEl.innerHTML = `<pre class="whitespace-pre-wrap text-sm text-gray-800">${fullText}</pre>`;
        read();
      });
    }

    read();
  }).catch(err => {
    outputEl.innerHTML = `<span class='text-red-500'>[LLM Error] ${err.message}</span>`;
  });
}
