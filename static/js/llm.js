// llm.js – ACE: Report Page LLM Chat with avatars & typewriter effect

function initLLMChat() {
  const inputEl = document.getElementById("llm-chat-input");
  const outputEl = document.getElementById("llm-chat-output");
  const sendBtn = document.getElementById("llm-send-btn");
  if (!inputEl || !outputEl) return;

  const chatHistory = [];

  // Display user message with avatar
  function displayUserMessage(message) {
    const row = document.createElement("div");
    row.classList.add("chat-row", "user-row");

    const avatar = document.createElement("img");
    avatar.src = "/static/images/user.jpg";
    avatar.classList.add("chat-avatar", "user-avatar");

    const msg = document.createElement("div");
    msg.classList.add("chat", "chat-bubble-user");
    msg.textContent = message;

    row.appendChild(msg);
    row.appendChild(avatar);
    outputEl.appendChild(row);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // Create typing indicator for ACE
  function createTypingBubble() {
    const row = document.createElement("div");
    row.classList.add("chat-row", "bot-row", "typing-row");

    const avatar = document.createElement("img");
    avatar.src = "/static/images/bot.jpg";
    avatar.classList.add("chat-avatar", "bot-avatar");

    const bubble = document.createElement("div");
    bubble.classList.add("chat", "chat-bubble-assistant", "typing-bubble");
    bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

    row.appendChild(avatar);
    row.appendChild(bubble);
    outputEl.appendChild(row);
    outputEl.scrollTop = outputEl.scrollHeight;

    return row;
  }

  // Display ACE's message container
  function displayBotMessage() {
    const row = document.createElement("div");
    row.classList.add("chat-row", "bot-row");

    const avatar = document.createElement("img");
    avatar.src = "/static/images/bot.jpg";
    avatar.classList.add("chat-avatar", "bot-avatar");

    const msg = document.createElement("div");
    msg.classList.add("chat", "chat-bubble-assistant");
    msg.textContent = "";

    row.appendChild(avatar);
    row.appendChild(msg);
    outputEl.appendChild(row);
    outputEl.scrollTop = outputEl.scrollHeight;

    return msg;
  }

  // Typewriter effect for ACE’s replies
  async function typeWriterEffect(element, text, speed = 15) {
    for (let char of text) {
      element.textContent += char;
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }

// Send message function
async function sendMessage() {
  const userMessage = inputEl.value.trim();
  if (!userMessage) return;

  displayUserMessage(userMessage);
  chatHistory.push({ role: "user", content: userMessage });
  inputEl.value = "";

  const typingBubble = createTypingBubble();

  try {
    const response = await fetch("/llm_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (!response.ok || !response.body) throw new Error("No LLM response stream.");

    outputEl.removeChild(typingBubble);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const botMsgDiv = displayBotMessage();
    let fullBotResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullBotResponse += chunk;

      const isSmallTalk = fullBotResponse.length < 100 &&
        /(I'm doing well|Still doing well|clinical report assistant)/i.test(fullBotResponse);

      await typeWriterEffect(botMsgDiv, chunk, isSmallTalk ? 5 : 15);
      outputEl.scrollTop = outputEl.scrollHeight;
    }

    chatHistory.push({ role: "assistant", content: fullBotResponse });
  } catch (err) {
    console.error("❌ Error:", err);
    outputEl.removeChild(typingBubble);
    const errorDiv = displayBotMessage();
    errorDiv.textContent = "⚠️ Sorry, something went wrong.";
  }
}


  // Event listeners
  sendBtn?.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initial greeting
  function showInitialMessage() {
    outputEl.innerHTML = "";

    const row = document.createElement("div");
    row.classList.add("chat-row", "bot-row", "first-response");

    const avatar = document.createElement("img");
    avatar.src = "/static/images/bot.jpg";
    avatar.classList.add("chat-avatar", "bot-avatar");

    const msg = document.createElement("div");
    msg.classList.add("chat", "chat-bubble-assistant");
    msg.textContent = "Hello! I'm ACE, your Clinical Report Assistant 🧠. How can I help you understand this report today?";

    row.appendChild(avatar);
    row.appendChild(msg);
    outputEl.appendChild(row);
  }

  showInitialMessage();
}

// Auto-init when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("llm-chat-input")) initLLMChat();
});
