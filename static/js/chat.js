document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const fileInput = document.getElementById("fileInput");

  const micBtn = document.querySelector(".ri-mic-line")?.parentElement;
  const ttsBtn = document.querySelector(".ri-volume-up-line")?.parentElement;
  const fileBtn = document.querySelector(".ri-attachment-2")?.parentElement;

  // ✅ Guard: only run chat logic if essential DOM is present
  if (!chatForm || !messageInput || !chatMessages) {
    return;
  }

  const chatHistory = [];

  function addMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble-assistant");
    if (sender === "user") {
      bubble.classList.add("chat-bubble-user");
    }
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

  async function fetchLLMResponse(prompt) {
    try {
      const response = await fetch("/general_chat_llm", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.body) {
        replaceTypingWithResponse("[Error]: No response stream from LLM.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            chatHistory.push({ role: "assistant", content: fullText });
            return;
          }
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          replaceTypingWithResponse(fullText);
          read();
        });
      }

      read();
    } catch (err) {
      replaceTypingWithResponse(`[LLM Error]: ${err.message}`);
    }
  }

  // ✅ Message submit
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    addMessage("user", userMessage);
    chatHistory.push({ role: "user", content: userMessage });
    messageInput.value = "";

    showTypingAnimation();
    fetchLLMResponse(userMessage);
  });

  // ✅ Optional handlers
  fileBtn?.addEventListener("click", () => {
    if (fileInput) fileInput.click();
  });

  micBtn?.addEventListener("click", () => {
    alert("🎙️ Mic input not yet implemented.");
  });

  ttsBtn?.addEventListener("click", () => {
    alert("🔊 TTS not yet implemented.");
  });
});
