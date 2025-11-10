import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TaskData {
  description: string;
  assignee_name?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "Not Started" | "In Progress" | "Done";
  deadline?: string;
}

interface RequestBody {
  user_id: string;
  tasks: TaskData[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: RequestBody = await req.json();
    const { user_id, tasks } = body;

    if (!user_id || !tasks || !Array.isArray(tasks)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: user_id and tasks array required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process each task
    const createdTasks = [];
    const errors = [];

    for (const task of tasks) {
      try {
        // Find assignee by name if provided
        let assignee_id = null;
        if (task.assignee_name) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .ilike("full_name", `%${task.assignee_name}%`)
            .limit(1)
            .maybeSingle();

          if (profiles) {
            assignee_id = profiles.id;
          }
        }

        // Parse deadline if provided
        let deadline = null;
        if (task.deadline) {
          try {
            deadline = new Date(task.deadline).toISOString().split('T')[0];
          } catch {
            // Invalid date, skip
          }
        }

        // Insert task
        const { data: newTask, error: insertError } = await supabase
          .from("tasks")
          .insert({
            user_id,
            assignee_id,
            description: task.description,
            priority: task.priority || "Medium",
            status: task.status || "Not Started",
            deadline,
          })
          .select()
          .single();

        if (insertError) {
          errors.push({ task: task.description, error: insertError.message });
        } else {
          createdTasks.push(newTask);
        }
      } catch (taskError) {
        errors.push({ task: task.description, error: String(taskError) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: createdTasks.length,
        tasks: createdTasks,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing tasks:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
