import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: false,
  })
);
app.use(express.json());

await mongoose.connect(process.env.MONGODB_URI);

const entrySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    mood: { type: Number, min: 1, max: 5, default: 3 },
    ai: {
      mood: String,
      score: Number,
      tags: [String],
      suggestions: [String],
      summary: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const Entry = mongoose.model("Entry", entrySchema);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/entries", async (req, res) => {
  const { text, mood } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text required" });
  const doc = await Entry.create({ text: text.trim(), mood });
  res.status(201).json(doc);
});

app.get("/api/entries", async (_req, res) => {
  const list = await Entry.find().sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

app.get("/api/entries/:id", async (req, res) => {
  const doc = await Entry.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "not found" });
  res.json(doc);
});

app.put("/api/entries/:id", async (req, res) => {
  const { text, mood } = req.body;
  const doc = await Entry.findByIdAndUpdate(
    req.params.id,
    { ...(text !== undefined ? { text } : {}), ...(mood ? { mood } : {}) },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: "not found" });
  res.json(doc);
});

app.delete("/api/entries/:id", async (req, res) => {
  const out = await Entry.findByIdAndDelete(req.params.id);
  if (!out) return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
});

app.listen(process.env.PORT, () => {
  console.log("API ready on http://localhost:" + process.env.PORT);
});
