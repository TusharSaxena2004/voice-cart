import { NextRequest, NextResponse } from "next/server";
import { parseVoiceCommand } from "@/lib/llm";
import { validateParsedCommand } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Transcript is required" },
        { status: 400 }
      );
    }

    if (transcript.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Transcript too long" },
        { status: 400 }
      );
    }

    const rawCommand = await parseVoiceCommand(transcript.trim());
    const validated = validateParsedCommand(rawCommand);

    return NextResponse.json({ success: true, data: validated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed";
    console.error("[parse-voice] Error:", err);

    // Check for API key errors
    if (message.includes("API key") || message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "LLM API key not configured. Check .env.local" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
