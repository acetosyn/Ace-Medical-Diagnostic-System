function initTTSHandlers() {
  const micButton = document.getElementById("mic-button");
  const speakerButton = document.getElementById("speaker-button");

  if (!micButton || !speakerButton) return;

  let recognition;
  let isRecording = false;
  let bestVoice = null;
  let firstLoad = true;

  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  function cacheBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = [
      'Google UK English Female', 'Google US English',
      'Microsoft Aria Online', 'Microsoft Jenny Online', 'Microsoft Zira Desktop',
      'Samantha', 'Karen', 'Moira'
    ];
    bestVoice = voices.find(v => preferredVoices.some(name => v.name.includes(name))) ||
                voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                voices.find(v => v.lang.startsWith('en')) ||
                voices[0];
  }

function sanitizeTTS(text) {
  return text
    .replace(/\bACE\b/g, "Ace") // fix pronunciation
    .replace(/([\u231A-\uDFFF])/g, '')
    .replace(/__FETCH_FROM_[A-Z]+__/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

  function speakText(text) {
    const synth = window.speechSynthesis;
    if (!text) return;

    const cleanText = sanitizeTTS(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = bestVoice;
    utterance.pitch = 1.1;
    utterance.rate = 1.05;

    if (synth.speaking) synth.cancel();

    if (isiOS && !window._ttsPrimed) {
      const unlock = () => {
        synth.speak(new SpeechSynthesisUtterance(" "));
        window._ttsPrimed = true;
        document.body.removeEventListener("click", unlock);
      };
      document.body.addEventListener("click", unlock);
    }

    synth.speak(utterance);
  }

  function initTTS(text) {
    const synth = window.speechSynthesis;
    const tryLoad = (attempts = 0) => {
      const voices = synth.getVoices();
      if (voices.length > 0 || attempts > 5) {
        cacheBestVoice();
        speakText(text);
      } else {
        setTimeout(() => tryLoad(attempts + 1), 200);
      }
    };
    tryLoad();
  }

  window.initTTS = initTTS;


// 🔊 Speaker button
speakerButton.addEventListener("click", async () => {
  const botMessages = Array.from(document.querySelectorAll(".chat-bubble-assistant"))
    .map(el => el.textContent.trim())
    .filter(Boolean);

  const debugEl = document.getElementById("tts-debug");

  if (firstLoad) {
    firstLoad = false;
    const greeting = "Hi! I'm ACE, your Medical & Diagnostic Assistant 🧠. How can I help you today?";
    initTTS(greeting);
    if (debugEl) debugEl.textContent = `🗣️ <strong>Spoken (intro):</strong> ${greeting}`;
    return;
  }

  if (botMessages.length < 2) {
    const latest = botMessages.at(-1);
    initTTS(latest);
    if (debugEl) debugEl.innerHTML = `🗣️ <strong>Spoken (single reply):</strong> ${latest || 'No message found.'}`;
    return;
  }

  try {
    const response = await fetch("/summarize_history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: botMessages.slice(0, -1) })
    });

    const data = await response.json();
    const latest = botMessages.at(-1);

    if (data?.summary?.trim()) {
      const fullSpeech = `${data.summary} ... ${latest}`;
      console.log("🔊 Summary from backend:", data.summary);
      initTTS(fullSpeech);
      if (debugEl) debugEl.innerHTML = `🗣️ <strong>Summary + Reply:</strong> ${fullSpeech}`;
    } else {
      console.warn("⚠ No summary returned from backend. Falling back to latest bot message.");
      initTTS(latest);
      if (debugEl) debugEl.innerHTML = `🗣️ <strong>Fallback Reply:</strong> ${latest}`;
    }
  } catch (error) {
    console.error("❌ TTS summary error:", error);
    const fallback = botMessages.at(-1);
    initTTS(fallback);
    if (debugEl) debugEl.innerHTML = `❌ <strong>Error:</strong> ${error.message || fallback}`;
  }
});


  // 🎙 Mic / voice input
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("⚠ Your browser does not support voice recognition. Try using Google Chrome.");
    return;
  }

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isRecording = true;
    micButton.classList.add("recording");
    micButtonAnimation?.play?.();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    if (transcript && window.handleVoiceInput) {
      window.handleVoiceInput(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("⚠ Speech recognition error. Try again.");
  };

  recognition.onend = () => {
    isRecording = false;
    micButton.classList.remove("recording");
    micButtonAnimation?.stop?.();
  };

  micButton.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      initTTS("Voice assistant activated. Listening now.");
    }
  });
}

// Call it on load
initTTSHandlers();
