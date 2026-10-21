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
  default_priority?: "Low" | "Medium" | "High";
}

type RequestBody = DirectRequestBody | N8nRequestBody;

function isDirectRequest(body: RequestBody): body is DirectRequestBody {
  return 'tasks' in body && Array.isArray(body.tasks);
}

function isN8nRequest(body: RequestBody): body is N8nRequestBody {
  return 'note_text' in body && typeof body.note_text === 'string';
}

function parseNotesBasic(noteText: string, defaultPriority: "Low" | "Medium" | "High" = 'Medium'): TaskData[] {
  console.log('Using basic note parser (no AI)');
  const tasks: TaskData[] = [];
  const lines = noteText.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) continue;

    let description = trimmed.replace(/^[-*•]\s*/, '');
    let assignee_name: string | undefined;
    let priority: "Low" | "Medium" | "High" = defaultPriority;
    let deadline: string | undefined;

    const assigneeMatch = description.match(/^\*{0,2}([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\*{0,2}:\s*(.+)$/);
    if (assigneeMatch) {
      assignee_name = assigneeMatch[1];
      description = assigneeMatch[2];
    }

    if (/(urgent|asap|critical|high priority|important)/i.test(description)) {
      priority = 'High';
    } else if (/(low priority|when possible|eventually|nice to have)/i.test(description)) {
      priority = 'Low';
    }

    const datePatterns = [
      /(?:by|before|due|deadline:?)\s*(\d{4}-\d{2}-\d{2})/i,
      /(?:by|before|due|deadline:?)\s*([A-Z][a-z]+\s+\d{1,2})/i,
      /(?:by|before|due|deadline:?)\s*(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)/i,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = description.match(pattern);
      if (dateMatch) {
        try {
          const dateStr = dateMatch[1];

          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            deadline = dateStr;
          }
          else if (/^[A-Z][a-z]+\s+\d{1,2}$/.test(dateStr)) {
            const [monthStr, day] = dateStr.split(' ');
            const year = new Date().getFullYear();
            const monthMap: { [key: string]: number } = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            const month = monthMap[monthStr.substring(0, 3)];
            if (month !== undefined) {
              const date = new Date(year, month, parseInt(day));
              deadline = date.toISOString().split('T')[0];
            }
          }
          else if (/^\d{1,2}[-/]\d{1,2}$/.test(dateStr)) {
            const parts = dateStr.split(/[-/]/);
            const year = new Date().getFullYear();
            const date = new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
            deadline = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Failed to parse date:', dateMatch[1], e);
        }
        break;
      }
    }

    description = description
      .replace(/\b(urgent|asap|critical|high priority|low priority|when possible|eventually|important|nice to have)\b/gi, '')
      .replace(/(?:by|before|due|deadline:?)\s*(\d{4}-\d{2}-\d{2})/gi, '')
      .replace(/(?:by|before|due|deadline:?)\s*([A-Z][a-z]+\s+\d{1,2})/gi, '')
      .replace(/(?:by|before|due|deadline:?)\s*(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (description.length > 0) {
      tasks.push({
        description,
        assignee_name,
        priority,
        status: 'Not Started',
        deadline,
      });
    }
  }

  if (tasks.length === 0 && noteText.trim().length > 0) {
    tasks.push({
      description: noteText.trim(),
      priority: defaultPriority,
      status: 'Not Started',
    });
  }

  return tasks;
}

interface LlmProvider {
  url: string;
  key: string;
  model: string;
}

const OPENROUTER_MODEL = 'deepseek/deepseek-v4.1-flash';
const OPENROUTER_FALLBACK_MODEL = 'z-ai/glm-5.3-flash';

async function parseNotesWithLlm(noteText: string, provider: LlmProvider, defaultPriority: "Low" | "Medium" | "High" = 'Medium'): Promise<TaskData[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: `You are a task extraction assistant. Extract actionable tasks from meeting notes and return them as a JSON array.\n\nToday's date is: ${today}\n\nEach task should have:\n- description (string, required): The task description\n- assignee_name (string, optional): Person's name if mentioned\n- priority ("Low" | "Medium" | "High", optional): Task priority, default ${defaultPriority}. Only override this if the note explicitly mentions a different priority.\n- status ("Not Started" | "In Progress" | "Done", optional): Default "Not Started"\n- deadline (string, optional): Date in YYYY-MM-DD format if mentioned. Convert relative dates like "next Friday", "tomorrow", "in 2 weeks" to absolute dates based on today's date.\n\nReturn ONLY a valid JSON array of tasks, nothing else. If no tasks found, return empty array [].`
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
      console.error(`${provider.model} API error:`, errorText);
      throw new Error(`${provider.model} API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Malformed output throws, so the caller moves on to the next provider.
    if (!content) {
      throw new Error(`${provider.model} returned no content`);
    }

    let tasks: unknown;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      tasks = JSON.parse(cleanContent);
    } catch {
      throw new Error(`${provider.model} returned invalid JSON`);
    }

    if (!Array.isArray(tasks)) {
      throw new Error(`${provider.model} returned a non-array`);
    }
    return tasks as TaskData[];
  } catch (error) {
    console.error(`Error parsing notes with ${provider.model}:`, error);
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
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    // DeepSeek first, GLM as the backup model; the regex parser is the last resort.
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const providers: LlmProvider[] = openRouterKey
      ? [OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL].map((model) => ({ url: openRouterUrl, key: openRouterKey, model }))
      : [];

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();

    // Bind user_id to the caller's login. Only the service role may act for another user.
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (token !== supabaseServiceKey) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ error: "You need to be signed in to do this." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      body.user_id = authData.user.id;

      if (isN8nRequest(body) && body.note_id) {
        const { data: note } = await supabase
          .from("notes")
          .select("id")
          .eq("id", body.note_id)
          .eq("user_id", body.user_id)
          .maybeSingle();
        if (!note) {
          return new Response(
            JSON.stringify({ error: "Note not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

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

    if (isDirectRequest(body)) {
      console.log('Processing direct task insertion');
      tasks = body.tasks;
    } else if (isN8nRequest(body)) {
      console.log('Processing notes with AI');
      const defaultPriority = body.default_priority || 'Medium';

      let parsed = false;
      for (const provider of providers) {
        try {
          tasks = await parseNotesWithLlm(body.note_text, provider, defaultPriority);
          parsed = true;
          break;
        } catch (aiError) {
          console.error(`${provider.model} parsing failed, trying next option:`, aiError);
        }
      }
      if (!parsed) {
        console.log('No AI provider succeeded, using basic parser');
        tasks = parseNotesBasic(body.note_text, defaultPriority);
      }

      // Fallback: If AI returns no tasks, but we have text, treat the text as a task
      // This handles cases like "Buy milk" where AI might not see it as a "meeting task"
      if (tasks.length === 0 && body.note_text.trim().length > 0) {
        console.log('AI returned 0 tasks. Falling back to using note text as task description.');
        tasks.push({
          description: body.note_text.trim(),
          priority: defaultPriority,
          status: 'Not Started',
        });
      }

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
          } catch {
            console.error(`Invalid deadline format: ${task.deadline}`);
          }
        }

        interface TaskInsert {
          user_id: string;
          assignee_id: string;
          description: string;
          priority: "Low" | "Medium" | "High";
          status: "Not Started" | "In Progress" | "Done";
          deadline: string | null;
          note_id?: string;
        }

        const taskInsert: TaskInsert = {
          user_id: body.user_id,
          assignee_id: assignee_id || body.user_id,
          description: task.description,
          priority: task.priority || "Medium",
          status: task.status || "Not Started",
          deadline,
        };

        if (isN8nRequest(body) && body.note_id) {
          taskInsert.note_id = body.note_id;
        }

        const { data: newTask, error: insertError } = await supabase
          .from("tasks")
          .insert(taskInsert)
          .select()
          .single();

        if (insertError) {
          console.error('Task insertion error:', insertError);
          errors.push({ task: task.description, error: insertError.message });
        } else {
          createdTasks.push(newTask);
          console.log(`Created task: ${task.description}`);

          if (newTask.assignee_id && newTask.assignee_id !== null) {
            console.log(`Notification logic delegated to DB trigger for: ${newTask.assignee_id}`);
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