import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  task_id: string;
  new_status: "Not Started" | "In Progress" | "Done";
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

    const body: RequestBody = await req.json();

    if (!body.task_id || !body.new_status) {
      return new Response(
        JSON.stringify({ error: "task_id and new_status are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the current user from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the token and get the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the task status
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({ status: body.new_status })
      .eq("id", body.task_id)
      .select("id, description, status, note_id, user_id")
      .single();

    if (updateError) {
      console.error("Task update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update task", details: updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Task ${body.task_id} updated to status: ${body.new_status}`);

    // If the task is marked as "Done", create a notification for the task creator
    if (body.new_status === "Done" && updatedTask.user_id) {
      // Only notify if the person completing the task is NOT the creator
      if (user.id !== updatedTask.user_id) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            recipient_id: updatedTask.user_id,
            actor_id: user.id,
            type: "completed",
            task_id: updatedTask.id,
            message: `Task completed: ${updatedTask.description}`,
            read: false,
          });

        if (notificationError) {
          console.error("Notification insertion error:", notificationError);
        } else {
          console.log(`Notification created for task creator: ${updatedTask.user_id}`);
        }
      } else {
        console.log("Task creator completed their own task - no notification sent");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        task: updatedTask,
        message: "Task status updated successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: String(error),
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
