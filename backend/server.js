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
    const response = await fetch(
      `${process.env.API_URL}&key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    
    // Extract the text content from the API response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && 
        data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      
      let textContent = data.candidates[0].content.parts[0].text;
      
      // Remove markdown code block markers if present
      textContent = textContent.replace(/```json\n?/g, '').replace(/```$/g, '').trim();
      
      try {
        // Try to parse the extracted text as JSON
        const parsedContent = JSON.parse(textContent);
        res.json(parsedContent);
      } catch (e) {
        // If parsing fails, return the original response
        res.json(data);
      }
    } else {
      // If the expected structure isn't found, return the original response
      res.json(data);
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to get explanation from AI" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});