import { useState, useEffect, useRef } from "react";
import "./NoteBook.css";
import MoodPicker from "./MoodPicture";

const frames = ["/1.kapak.png", "/2.kapak.png", "/3.kapak.png", "/4.kapak.png"];
async function saveEntry(text, mood) {
  const res = await fetch("http://localhost:5050/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mood }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Save failed");
  return data;
}
export default function Notebook() {
  const [frame, setFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWriter, setShowWriter] = useState(false);

  const [text, setText] = useState("");
  const [mood, setMood] = useState(3);
  const [saving, setSaving] = useState(false);
  const [ai, setAi] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    const savedText = localStorage.getItem("diaryText");
    if (savedText) setText(savedText);
    const savedMood = localStorage.getItem("diaryMood");
    if (savedMood) setMood(Number(savedMood));
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setText(v);
    localStorage.setItem("diaryText", v);
  };

  const handleClick = () => {
    if (showWriter) return;

    if (isAnimating) return;

    if (!isOpen) {
      setIsAnimating(true);
      let i = 0;
      animRef.current = setInterval(() => {
        setFrame(i);
        i++;
        if (i === frames.length) {
          clearInterval(animRef.current);
          setIsAnimating(false);
          setIsOpen(true);
        }
      }, 150);
      return;
    }

    setShowWriter(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && showWriter) setShowWriter(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showWriter]);
  async function handleAnalyze() {
    if (!text.trim()) return alert("Önce bir şeyler yaz.");
    try {
      setAnalyzing(true);
      console.log("analyzing…");
      const res = await fetch("http://localhost:5050/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data?.analysis) {
        console.error("analyze error:", data);
        return alert("analiz hatası: " + (data?.error || "bilinmiyor"));
      }
      console.log("analysis result:", data.analysis);
      setAi(data.analysis);
    } catch (err) {
      console.error(err);
      alert("analiz edilemedi");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!text.trim()) return alert("Metin boş olamaz.");
    try {
      setSaving(true);

      const saved = await saveEntry(text, mood);

      const res = await fetch("http://localhost:5050/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const { analysis } = await res.json();

      console.log("AI Analysis:", analysis);
      setAi(analysis);
    } catch (err) {
      console.error(err);
      alert("kaydedilemedi ");
    } finally {
      setSaving(false);
    }
  }

  if (showWriter) {
    return (
      <div className="book-container">
        <div className="writing-page">
          <textarea
            placeholder="Bugün neler hissettin?"
            value={text}
            onChange={handleChange}
            autoFocus
          />

          <MoodPicker
            value={mood}
            onChange={(id) => {
              setMood(id);
              localStorage.setItem("diaryMood", String(id));
            }}
          />
          <div className="actions">
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? "Analiz ediliyor..." : "Analiz Et"}
            </button>
          </div>
          {ai && (
            <div className="ai-card" style={{ marginTop: 10 }}>
              <div>
                <b>Duygu:</b> {ai.mood} ({ai.score})
              </div>
              {ai.tags?.length ? (
                <div>
                  <b>Etiketler:</b> {ai.tags.join(", ")}
                </div>
              ) : null}
              {ai.suggestions?.length ? (
                <ul>
                  {ai.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : null}
              {ai.summary && <p style={{ opacity: 0.8 }}>{ai.summary}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="book-container">
      <img
        src={frames[frame]}
        alt="Notebook"
        onClick={handleClick}
        className="notebook-img"
        draggable={false}
        style={{ cursor: isAnimating ? "default" : "pointer" }}
      />
    </div>
  );
}
