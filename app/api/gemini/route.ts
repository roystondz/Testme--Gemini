import { NextResponse } from 'next/server';
import { generateWithGemini } from '@/services/gemini';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description } = body;

  console.log('Received request with title:', title);
  console.log('Received request with description:', description);

  try {
    const result = await generateWithGemini(title, description);

    // Construct the URL for redirection
     // Ensure it's relative to the current URL

    // Add title and description as query parameter  // Perform the redirect with status code 307
    return NextResponse.json({ result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
