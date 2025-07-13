document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const fileInput = document.getElementById("fileInput");

  const micBtn = document.querySelector(".ri-mic-line")?.parentElement;
  const ttsBtn = document.querySelector(".ri-volume-up-line")?.parentElement;
  const fileBtn = document.querySelector(".ri-attachment-2")?.parentElement;

  // Store chat messages
  const chatHistory = [];

  function addMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble-assistant");
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingAnimation() {
    const typing = document.createElement("div");
    typing.className = "chat-bubble-assistant";
    typing.textContent = "Typing...";
    typing.id = "typingBubble";
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function replaceTypingWithResponse(text) {
    const typing = document.getElementById("typingBubble");
    if (typing) {
      typing.textContent = text;
      typing.id = "";
    }
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    addMessage("user", userMessage);
    chatHistory.push({ role: "user", content: userMessage });
    messageInput.value = "";

    // Fake typing and response
    showTypingAnimation();

    setTimeout(() => {
      const reply = `Simulated response to: "${userMessage}"`;
      replaceTypingWithResponse(reply);
      chatHistory.push({ role: "bot", content: reply });
    }, 1000);
  });

  // File button click triggers file input
  fileBtn?.addEventListener("click", () => fileInput.click());

  // Mic button placeholder
  micBtn?.addEventListener("click", () => {
    alert("🎙️ Mic input not yet implemented.");
  });

  // TTS button placeholder
  ttsBtn?.addEventListener("click", () => {
    alert("🔊 TTS not yet implemented.");
  });
});
