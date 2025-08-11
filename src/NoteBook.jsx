import { useState, useEffect, useRef } from "react";
import "./NoteBook.css";
import MoodPicker from "./MoodPicture";

const frames = ["/1.kapak.png", "/2.kapak.png", "/3.kapak.png", "/4.kapak.png"];

export default function Notebook() {
  const [frame, setFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWriter, setShowWriter] = useState(false);

  const [text, setText] = useState("");

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
