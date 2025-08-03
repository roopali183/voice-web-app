/*import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Setup OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get audio blob from form-data
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileForOpenAI = new Blob([buffer], { type: file.type });

    // Create a new File object (openai expects a File or fs.ReadStream)
    const openAiFile = new File([fileForOpenAI], "recording.webm", { type: file.type });

    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file: openAiFile,
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ text: response });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}*/


import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Setup OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get audio blob from form-data
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const blob = new Blob([buffer], { type: file.type });

    // Create a new File object (OpenAI expects a File)
    const openAiFile = new File([blob], "recording.webm", { type: file.type });

    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file: openAiFile,
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ text: response });
  } catch (error: unknown) {
    console.error("Transcription error:", error);
    
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}