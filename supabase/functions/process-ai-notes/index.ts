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

interface DirectRequestBody {
  user_id: string;
  tasks: TaskData[];
}

interface N8nRequestBody {
  user_id: string;
  note_text: string;
  note_id?: string;
}

type RequestBody = DirectRequestBody | N8nRequestBody;

function isDirectRequest(body: RequestBody): body is DirectRequestBody {
  return 'tasks' in body && Array.isArray(body.tasks);
}

function isN8nRequest(body: RequestBody): body is N8nRequestBody {
  return 'note_text' in body && typeof body.note_text === 'string';
}

async function parseNotesWithOpenAI(noteText: string, openAiKey: string): Promise<TaskData[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a task extraction assistant. Extract actionable tasks from meeting notes and return them as a JSON array.

Today's date is: ${today}

Each task should have:
- description (string, required): The task description
- assignee_name (string, optional): Person's name if mentioned
- priority ("Low" | "Medium" | "High", optional): Task priority, default Medium
- status ("Not Started" | "In Progress" | "Done", optional): Default "Not Started"
- deadline (string, optional): Date in YYYY-MM-DD format if mentioned. Convert relative dates like "next Friday", "tomorrow", "in 2 weeks" to absolute dates based on today's date.

Return ONLY a valid JSON array of tasks, nothing else. If no tasks found, return empty array [].`
          },
          {
            role: 'user',
            content: noteText
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return [];
    }

    // Parse the JSON response
    let tasks: TaskData[];
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      tasks = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return [];
    }

    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error('Error parsing notes with OpenAI:', error);
    throw error;
  }
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
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    
    if (!body.user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let tasks: TaskData[] = [];
    
    // Determine request type and get tasks
    if (isDirectRequest(body)) {
      // Direct task insertion (from n8n or manual API calls)
      console.log('Processing direct task insertion');
      tasks = body.tasks;
    } else if (isN8nRequest(body)) {
      // Process raw notes with AI
      console.log('Processing notes with AI');

      if (!openAiKey) {
        // If no OpenAI key, create a simple task from the notes
        console.log('No OpenAI key found, creating simple task from notes');
        tasks = [{
          description: body.note_text,
          priority: 'Medium',
          status: 'Not Started',
        }];
      } else {
        // Use OpenAI to parse notes
        tasks = await parseNotesWithOpenAI(body.note_text, openAiKey);
      }

      // Update the existing note as processed (if note_id provided)
      if (body.note_id) {
        const { error: noteError } = await supabase
          .from('notes')
          .update({ processed: true })
          .eq('id', body.note_id);

        if (noteError) {
          console.error('Error updating note:', noteError);
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (tasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          created: 0,
          tasks: [],
          message: 'No actionable tasks found in the notes',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process and insert tasks
    const createdTasks = [];
    const errors = [];

    for (const task of tasks) {
      try {
        let assignee_id = null;
        if (task.assignee_name) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .ilike("full_name", `%${task.assignee_name}%`)
            .limit(1)
            .maybeSingle();

          if (profiles) {
            assignee_id = profiles.id;
            console.log(`Matched assignee "${task.assignee_name}" to profile: ${profiles.full_name}`);
          } else {
            console.log(`No profile found for assignee: ${task.assignee_name}`);
          }
        }

        let deadline = null;
        if (task.deadline) {
          try {
            deadline = new Date(task.deadline).toISOString().split('T')[0];
          } catch (dateError) {
            console.error(`Invalid deadline format: ${task.deadline}`);
          }
        }

        const { data: newTask, error: insertError } = await supabase
          .from("tasks")
          .insert({
            user_id: body.user_id,
            assignee_id: assignee_id || body.user_id,
            description: task.description,
            priority: task.priority || "Medium",
            status: task.status || "Not Started",
            deadline,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Task insertion error:', insertError);
          errors.push({ task: task.description, error: insertError.message });
        } else {
          createdTasks.push(newTask);
          console.log(`Created task: ${task.description}`);

          // Create notification if task has a valid assignee
          if (newTask.assignee_id && newTask.assignee_id !== null) {
            const { error: notificationError } = await supabase
              .from("notifications")
              .insert({
                recipient_id: newTask.assignee_id,
                actor_id: body.user_id,
                type: 'assigned',
                task_id: newTask.id,
                message: `You've been assigned: ${newTask.description}`,
                read: false,
              });

            if (notificationError) {
              console.error('Notification insertion error:', notificationError);
            } else {
              console.log(`Notification created for assignee: ${newTask.assignee_id}`);
            }
          }
        }
      } catch (taskError) {
        console.error('Task processing error:', taskError);
        errors.push({ task: task.description, error: String(taskError) });
      }
    }

    const response = {
      success: true,
      created: createdTasks.length,
      tasks: createdTasks,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Final response:', JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
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
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
