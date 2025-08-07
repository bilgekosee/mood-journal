import { useState } from "react";
import "./NoteBook.css";

const frames = ["/1.kapak.png", "/2.kapak.png", "/3.kapak.png", "/4.kapak.png"];

export default function Notebook() {
  const [frame, setFrame] = useState(0);

  const handleClick = () => {
    let i = 0;
    const interval = setInterval(() => {
      setFrame(i);
      i++;
      if (i === frames.length) clearInterval(interval);
    }, 150);
  };

  return (
    <div className="book-container">
      <img
        src={frames[frame]}
        alt="Notebook"
        onClick={handleClick}
        className="notebook-img"
      />
    </div>
  );
}
