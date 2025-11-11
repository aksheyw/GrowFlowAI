import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  user_id: string;
  note_text: string;
  meeting_title?: string;
  meeting_date?: string;
  meeting_location?: string;
  meeting_participants?: string[];
  default_priority?: "Low" | "Medium" | "High";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();

    if (!payload.user_id || !payload.note_text) {
      return new Response(
        JSON.stringify({ error: "user_id and note_text are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: payload.user_id,
        content: payload.note_text.trim(),
        processed: false,
        meeting_title: payload.meeting_title?.trim() || null,
        meeting_date: payload.meeting_date || null,
        meeting_location: payload.meeting_location?.trim() || null,
        meeting_participants: payload.meeting_participants || null,
      })
      .select()
      .single();

    if (noteError || !noteData) {
      throw new Error(`Failed to save note: ${noteError?.message || "Unknown error"}`);
    }

    const processUrl = `${supabaseUrl}/functions/v1/process-ai-notes`;
    const processResponse = await fetch(processUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: payload.user_id,
        note_text: payload.note_text.trim(),
        note_id: noteData.id,
        default_priority: payload.default_priority || "Medium",
      }),
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      console.error("AI processing error:", errorText);
      throw new Error(`AI processing failed: ${processResponse.status}`);
    }

    const processResult = await processResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        note_id: noteData.id,
        tasks_created: processResult.created || 0,
        message: `Note saved and ${processResult.created || 0} task(s) created`,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
