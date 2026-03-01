import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/debug", async (req, res) => {
  try {
    const { code, language } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash",
    });

    const prompt = `
You are GCoder AI.

Analyze this ${language} code:

${code}

Return:
ERRORS:
FIX:
WHY IT HAPPENS:
BEGINNER TIP:
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ output: response });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});