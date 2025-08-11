import { useState } from "react";
import "./MoodPicture.css";

const moods = [
  { id: 1, img: "/verysad.png", label: "Çok kötü" },
  { id: 2, img: "/sad.png", label: "Kötü" },
  { id: 3, img: "/notr.png", label: "Orta" },
  { id: 4, img: "/smile.png", label: "İyi" },
  { id: 5, img: "/happy.png", label: "Harika" },
];

export default function MoodPicker({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    setSelected(id);
    if (onSelect) onSelect(id);
  };

  return (
    <div className="mood-picker">
      {moods.map((mood) => (
        <div
          key={mood.id}
          className={`mood-item ${selected === mood.id ? "selected" : ""}`}
          onClick={() => handleSelect(mood.id)}
        >
          <img src={mood.img} alt={mood.label} />
          <span>{mood.label}</span>
        </div>
      ))}
    </div>
  );
}
