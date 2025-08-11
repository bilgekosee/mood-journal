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
  const animRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("diaryText");
    if (saved) setText(saved);
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
  async function handleSave() {
    if (!text.trim()) return alert("Metin boş olamaz.");
    try {
      setSaving(true);
      const data = await saveEntry(text, mood);
      console.log("saved:", data);
      alert("Kaydedildi");
    } catch (err) {
      console.error(err);
      alert("Kaydedilemedi");
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

          <MoodPicker onSelect={(id) => console.log("Seçilen mood:", id)} />
          <div className="actions">
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
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
