import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

function safeParseJSON(str) {
  if (!str) return null;
  let s = String(str)
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(s);
  } catch {
    const m = s.match(/\{[\s\S]*\}$/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {}
    }
    return null;
  }
}

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

app.post("/api/analyze", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "missing_gemini_api_key" });
    }

    const { text, entryId, save, style = "standard" } = req.body || {};
    let inputText = (text && String(text)) || "";

    if (!inputText && entryId) {
      const doc = await Entry.findById(entryId);
      if (!doc) return res.status(404).json({ error: "entry_not_found" });
      inputText = doc.text || "";
    }

    if (!inputText.trim()) {
      return res.status(400).json({ error: "text required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const depthMap = {
      brief: {
        summaryWords: "50-70",
        suggestions: "2-3",
        reflections: "1-2",
        temp: 0.6,
        maxTokens: 400,
      },
      standard: {
        summaryWords: "90-130",
        suggestions: "3-4",
        reflections: "2-3",
        temp: 0.8,
        maxTokens: 700,
      },
      deep: {
        summaryWords: "140-200",
        suggestions: "4-5",
        reflections: "3-4",
        temp: 0.95,
        maxTokens: 900,
      },
    };
    const D = depthMap[style] || depthMap.standard;

    const generationConfig = {
      temperature: D.temp,
      topP: 0.9,
      maxOutputTokens: D.maxTokens,
    };

    const prompt = `
Rolün: Türkçe konuşan, empatik ve yargısız bir psikolojik danışman gibi yaz.
Tıbbi/klinik teşhis koyma; acil durumlarda profesyonel destek alınabileceğini kibarca hatırlatabilirsin.

Sadece geçerli JSON döndür. Kod bloğu ( \`\`\` ) veya ek açıklama YOK.
Şu şemaya BİREBİR uy:
{
  "mood": "tekKelime",
  "score": -1.0,
  "score_reason": "skorun tek cümle kısa gerekçesi",
  "tags": ["etiket1","etiket2","etiket3"],
  "suggestions": ["kısa ve uygulanabilir öneri", "..."],
  "reflection_questions": ["kısa içgörü sorusu", "..."],
  "summary": "yaklaşık ${D.summaryWords} kelimelik, sıcak ve anlaşılır özet"
}

Kurallar:
- Üslup: sıcak, destekleyici, anlaşılır; yargılayıcı olma.
- Öneriler: ${D.suggestions} adet, bugün/şimdi başlanabilir, küçük ve uygulanabilir.
- Sorular: ${D.reflections} adet, içgörü kazandıran kısa sorular.
- Skor: -1..1 aralığında gerçek sayı.

Kullanıcının günlüğü:
"""${inputText}"""
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const raw = result.response.text();

    const analysis = safeParseJSON(raw);

    if (!analysis) {
      return res
        .status(502)
        .json({ error: "parse_failed", rawSample: raw?.slice(0, 200) });
    }

    if (save && entryId) {
      await Entry.findByIdAndUpdate(entryId, { ai: analysis }, { new: true });
    }

    return res.json({ ok: true, analysis });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "analyze_failed" });
  }
});

const port = Number(process.env.PORT || 5050);
app.listen(port, () => {
  console.log("API ready on http://localhost:" + port);
});
