import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/explain", async (req, res) => {
  const { code, language } = req.body;

  const prompt = `
You are a patient programming teacher.

Explain the following code for a beginner student.
Use very simple language.
Explain WHY each part exists.

Return ONLY valid JSON with:
- summary
- line_by_line
- common_mistakes
- beginner_tip

Code language: ${language}

Code:
${code}
`;

  try {
    const response = await fetch(process.env.API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to get explanation from AI" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});