import { Task } from '../lib/supabase';

/**
 * Format date as full text (e.g., "Monday, November 20, 2025")
 */
export function formatDateLong(dateString: string | null): string {
    if (!dateString) return 'No date';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date in short format (e.g., "Nov 20, 2025")
 */
export function formatDateShort(dateString: string | null): string {
    if (!dateString) return 'No date';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format timestamp as relative time (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return time.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Calculate task statistics from an array of tasks
 */
export function calculateTaskStats(tasks: Task[]): {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
} {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        total,
        completed,
        inProgress,
        notStarted,
        completionRate
    };
}

/**
 * Filter tasks by status
 */
export function filterTasksByStatus(
    tasks: Task[],
    status: 'all' | 'Not Started' | 'In Progress' | 'Done'
): Task[] {
    if (status === 'all') return tasks;
    return tasks.filter(task => task.status === status);
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    return deadline < now && task.status !== 'Done';
}

/**
 * Check if a task is due soon (within 3 days)
 */
export function isTaskDueSoon(task: Task): boolean {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    return deadline <= threeDaysFromNow && deadline >= now && task.status !== 'Done';
}
