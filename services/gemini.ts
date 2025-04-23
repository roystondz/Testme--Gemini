import { parse } from "path";

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
const API_KEY = process.env.API_KEY!;

export async function generateWithGemini(title: string, description: string) {
  const fullPrompt = `
  Generate a JSON array of 10 multiple choice questions based on the title :${title} and description :${description}.
Each object should have "question", "options", and "answer" fields.

Respond ONLY with pure JSON.
Do not include markdown formatting, no code blocks, no extra explanation — just raw JSON.

Format:

{
  "questions": [
    {
      "question": "Your question here?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Correct Option"
    }
  ]
}


Title: ${title}
Description: ${description}

Please ensure that the questions are related to the description and provide clear and distinct options for each question. The correct answer should be indicated in the "answer" field.

  `;

  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Gemini API error:', errorData);
    throw new Error('Failed to fetch from Gemini');

} else {
  const data = await response.json();
  console.log('Gemini API response:', data);

  // Step 1: Make sure `data.candidates` exists and has at least one element
  let parsedQuestions: { questions: any[] } | null = null;

  if (data && data.candidates && data.candidates.length > 0) {
    const textData = data.candidates[0].content.parts[0].text;
  
    // Step 2: Parse the text content as JSON
    parsedQuestions = JSON.parse(textData);
    
  } else {
    console.error("Candidates data not found.");
  }

  return parsedQuestions ? parsedQuestions.questions : [];
  // Return the parsed questions
}
}
