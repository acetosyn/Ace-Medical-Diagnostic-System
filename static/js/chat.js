// chat.js – ACE: Your Medical & Diagnostic Assistant with avatars and typing effect
function initChat() {
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const fileInput = document.getElementById("fileInput");

  const micBtn = document.querySelector(".ri-mic-line")?.parentElement;
  const ttsBtn = document.querySelector(".ri-volume-up-line")?.parentElement;
  const fileBtn = document.querySelector(".ri-attachment-2")?.parentElement;

  if (!chatForm || !messageInput || !chatMessages) return;

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
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;

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
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return msg;
  }

  // Typing effect for ACE’s replies
  async function typeWriterEffect(element, text, speed = 15) {
    for (let char of text) {
      element.textContent += char;
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }

 // Main function to send message
async function sendMessage() {
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  displayUserMessage(userMessage);
  chatHistory.push({ role: "user", content: userMessage });
  messageInput.value = "";

  const typingBubble = createTypingBubble();

  try {
    const response = await fetch("/general_chat_llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMessage })
    });

    if (!response.ok || !response.body) throw new Error("No response from LLM.");

    chatMessages.removeChild(typingBubble);
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
        /(I'm fine|Still doing well|your friendly medical & diagnostic assistant)/i.test(fullBotResponse);

      await typeWriterEffect(botMsgDiv, chunk, isSmallTalk ? 5 : 15);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatHistory.push({ role: "assistant", content: fullBotResponse });
  } catch (err) {
    console.error("❌ Error:", err);
    chatMessages.removeChild(typingBubble);
    const errorDiv = displayBotMessage();
    errorDiv.textContent = "⚠️ Sorry, something went wrong.";
  }
}


  // Handle submit and Enter key
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  fileBtn?.addEventListener("click", () => fileInput?.click());
  micBtn?.addEventListener("click", () => alert("🎙️ Mic input not yet implemented."));
  ttsBtn?.addEventListener("click", () => alert("🔊 TTS not yet implemented."));

  // Show initial ACE welcome message
  function showInitialMessage() {
    chatMessages.innerHTML = "";

    const row = document.createElement("div");
    row.classList.add("chat-row", "bot-row", "first-response");

    const avatar = document.createElement("img");
    avatar.src = "/static/images/bot.jpg";
    avatar.classList.add("chat-avatar", "bot-avatar");

    const msg = document.createElement("div");
    msg.classList.add("chat", "chat-bubble-assistant");
    msg.textContent = "Hi! I'm ACE, your Medical & Diagnostic Assistant 🧠. How can I help you today?";

    row.appendChild(avatar);
    row.appendChild(msg);
    chatMessages.appendChild(row);
  }

  showInitialMessage();
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("chatForm")) initChat();
});
