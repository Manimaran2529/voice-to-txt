from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import whisper, os, uuid, requests, tempfile

app = Flask(__name__)
CORS(app)  # allow calls from http://localhost:5500 etc.

# Load Whisper once
model = whisper.load_model("base")

# ---------- helpers ----------
def translate(text: str, target_lang: str) -> str:
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": "auto",
        "tl": target_lang,
        "dt": "t",
        "q": text
    }
    r = requests.get(url, params=params, timeout=20)
    if r.ok:
        data = r.json()
        return "".join(seg[0] for seg in data[0])
    return "Translation failed."

def save_result(transcript: str, translation: str) -> str:
    os.makedirs("results", exist_ok=True)
    name = f"{uuid.uuid4().hex}.txt"
    path = os.path.join("results", name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"📝 Transcript:\n{transcript}\n\n🌍 Translation:\n{translation}\n")
    return name  # return filename only

def do_transcribe(file_storage, target_lang: str):
    # persist incoming file to a temp file (keeps original extension)
    suffix = os.path.splitext(file_storage.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        file_storage.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path, fp16=False)
        transcript = (result.get("text") or "").strip()
        if not transcript:
            return None, None, "No speech detected."

        translation = translate(transcript, target_lang or "en")
        file_id = save_result(transcript, translation)
        return transcript, translation, f"/download/{file_id}"
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

# ---------- routes ----------
@app.route("/upload-file", methods=["POST"])
def upload_file():
    file = request.files.get("file")
    target_lang = request.form.get("targetLang", "en")
    if not file:
        return jsonify({"error": "No file provided (key 'file')."}), 400

    transcript, translation, download = do_transcribe(file, target_lang)
    if transcript is None:
        return jsonify({"error": "No speech detected."}), 400

    return jsonify({"transcript": transcript, "translation": translation, "download": download})

@app.route("/upload-mic", methods=["POST"])
def upload_mic():
    file = request.files.get("file")
    target_lang = request.form.get("targetLang", "en")
    if not file:
        return jsonify({"error": "No mic blob received (key 'file')."}), 400

    transcript, translation, download = do_transcribe(file, target_lang)
    if transcript is None:
        return jsonify({"error": "No speech detected."}), 400

    return jsonify({"transcript": transcript, "translation": translation, "download": download})

@app.route("/download/<path:fname>")
def download(fname):
    path = os.path.join("results", fname)
    if os.path.exists(path):
        return send_file(path, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

@app.route("/health")
def health():
    return jsonify({"ok": True})

if __name__ == "__main__":
    # Run: python app.py  ->  http://127.0.0.1:5000
    app.run(debug=True)
