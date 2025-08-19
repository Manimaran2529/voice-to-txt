// ======= CONFIG =======
const API_BASE = "http://127.0.0.1:5000"; // change if your Flask host/port differs

// status pill
(async () => {
  const el = document.getElementById("apiStatus");
  try {
    const r = await fetch(`${API_BASE}/health`);
    el.textContent = r.ok ? "API: online" : "API: offline";
  } catch {
    el.textContent = "API: offline";
  }
})();

// ======= FILE UPLOAD =======
const uploadForm = document.getElementById("uploadForm");
const fileTranscriptEl   = document.getElementById("fileTranscript");
const fileTranslationEl  = document.getElementById("fileTranslation");
const fileDownloadLink   = document.getElementById("fileDownloadLink");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  fileTranscriptEl.textContent = "Processing…";
  fileTranslationEl.textContent = "";

  const fd = new FormData(uploadForm);

  try {
    const res = await fetch(`${API_BASE}/upload-file`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    fileTranscriptEl.textContent  = data.transcript || "No transcript.";
    fileTranslationEl.textContent = data.translation || "No translation.";

    if (data.download) {
      fileDownloadLink.href = `${API_BASE}${data.download}`;
      fileDownloadLink.style.display = "inline-block";
    }
  } catch (err) {
    fileTranscriptEl.textContent = `❌ ${err.message}`;
    fileTranslationEl.textContent = "";
    fileDownloadLink.style.display = "none";
    console.error("File upload error:", err);
  }
});

// ======= LIVE MIC =======
const startBtn = document.getElementById("startMic");
const stopBtn  = document.getElementById("stopMic");
const liveTargetLang = document.getElementById("liveTargetLang");
const micTranscriptEl  = document.getElementById("micTranscript");
const micTranslationEl = document.getElementById("micTranslation");
const micDownloadLink  = document.getElementById("micDownloadLink");

let mediaRecorder;
let micChunks = [];

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    micChunks = [];
    micTranscriptEl.textContent = "Recording… speak now.";
    micTranslationEl.textContent = "";

    mediaRecorder.ondataavailable = (e) => { if (e.data.size) micChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(micChunks, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("file", blob, "mic.webm");
      fd.append("targetLang", liveTargetLang.value);

      micTranscriptEl.textContent = "Processing…";
      try {
        const res = await fetch(`${API_BASE}/upload-mic`, { method: "POST", body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        micTranscriptEl.textContent  = data.transcript || "No transcript.";
        micTranslationEl.textContent = data.translation || "No translation.";

        if (data.download) {
          micDownloadLink.href = `${API_BASE}${data.download}`;
          micDownloadLink.style.display = "inline-block";
        }
      } catch (err) {
        micTranscriptEl.textContent = `❌ ${err.message}`;
        micTranslationEl.textContent = "";
        micDownloadLink.style.display = "none";
        console.error("Mic error:", err);
      }
    };

    mediaRecorder.start();
    startBtn.disabled = true; stopBtn.disabled = false;
  } catch (err) {
    alert("Microphone access was denied.");
    console.error(err);
  }
});

stopBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    startBtn.disabled = false; stopBtn.disabled = true;
  }
});

// ======= TTS for the latest translation (Mic preferred, else File) =======
const speakBtn = document.getElementById("speakBtn");
const langMap = { en: "en-US", ta: "ta-IN", hi: "hi-IN", fr: "fr-FR" };
let voices = [];

function pickVoice(langCode){
  const tag = (langMap[langCode] || "en-US").toLowerCase();
  return voices.find(v => v.lang.toLowerCase() === tag)
      || voices.find(v => v.lang.toLowerCase().startsWith(tag.split("-")[0]))
      || null;
}
window.speechSynthesis.onvoiceschanged = () => { voices = speechSynthesis.getVoices(); };

speakBtn.addEventListener("click", () => {
  const text = micTranslationEl.textContent.trim() || fileTranslationEl.textContent.trim();
  if (!text) return;

  // prefer mic target language if mic translation exists, else file’s target
  const micHasText = !!micTranslationEl.textContent.trim();
  const langCode = micHasText ? liveTargetLang.value : document.getElementById("targetLang").value;

  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(langCode);
  if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = langMap[langCode] || "en-US"; }
  u.rate = 1; u.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
});
