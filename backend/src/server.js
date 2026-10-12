import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import { z } from "zod";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || false }));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_request, file, done) => done(null, ["image/jpeg", "image/png", "image/heic", "image/webp"].includes(file.mimetype)) });
const openai = process.env.CALORIEAI_OPENAI_KEY ? new OpenAI({ apiKey: process.env.CALORIEAI_OPENAI_KEY }) : null;
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const analysisSchema = z.object({
  summary: z.string(), confidence: z.number().min(0).max(1), followUpQuestion: z.string().optional(),
  ingredients: z.array(z.object({ name: z.string(), estimatedGrams: z.number().nonnegative(), confidence: z.number().min(0).max(1), nutrition: z.object({ calories: z.number().nonnegative(), protein: z.number().nonnegative(), carbs: z.number().nonnegative(), fat: z.number().nonnegative(), fiber: z.number().nonnegative() }) }))
});

app.get("/health", (_request, response) => response.json({ status: "ok" }));

app.post("/v1/food/analyze", upload.single("image"), async (request, response, next) => {
  try {
    if (!openai) return response.status(503).send("KI-Backend ist noch nicht konfiguriert.");
    if (!request.file) return response.status(400).send("Ein gültiges Bild fehlt.");
    const base64 = request.file.buffer.toString("base64");
    const result = await openai.responses.create({ model, input: [{ role: "user", content: [{ type: "input_text", text: "Analysiere das Essen im Bild. Identifiziere sichtbare Bestandteile, schätze die Portionen vorsichtig und gib Nährwerte für die geschätzte Menge an. Unsichtbare Zutaten und Zubereitungsfette sind unsicher. Antworte ausschließlich als JSON mit summary, confidence, optional followUpQuestion und ingredients[]. Jedes Element enthält name, estimatedGrams, confidence und nutrition mit calories, protein, carbs, fat, fiber. Erfinde keine Erkennung, wenn das Bild kein Essen zeigt." }, { type: "input_image", image_url: `data:${request.file.mimetype};base64,${base64}`, detail: "high" }] }] });
    const parsed = analysisSchema.parse(JSON.parse(result.output_text));
    response.json(parsed);
  } catch (error) { next(error); }
});

const assistantRequest = z.object({ message: z.string().min(1).max(1500), context: z.object({ consumedCalories: z.number(), goal: z.record(z.string(), z.number()), diet: z.string(), allergies: z.string(), preferences: z.string() }) });
app.post("/v1/assistant", async (request, response, next) => {
  try {
    if (!openai) return response.status(503).send("KI-Backend ist noch nicht konfiguriert.");
    const { message, context } = assistantRequest.parse(request.body);
    const result = await openai.responses.create({ model, instructions: "Du bist ein vorsichtiger deutschsprachiger Ernährungsassistent. Berücksichtige Allergien strikt. Stelle keine Diagnosen, empfehle keine extremen Restriktionen und kennzeichne Nährwerte als Schätzung. Rezepte enthalten Zutatenmengen, Schritte, Kalorien und Makros. Antworte knapp und hilfreich.", input: `Nutzerfrage: ${message}\nKontext: ${JSON.stringify(context)}` });
    response.json({ answer: result.output_text });
  } catch (error) { next(error); }
});

app.use((error, _request, response, _next) => {
  console.error(error instanceof Error ? error.message : "Unbekannter Fehler");
  if (error instanceof z.ZodError) return response.status(400).send("Ungültige Anfrage oder KI-Antwort.");
  response.status(500).send("Die Anfrage konnte nicht verarbeitet werden.");
});

app.listen(Number(process.env.PORT || 8787), () => console.log(`CalorieAI backend listening on port ${process.env.PORT || 8787}`));

