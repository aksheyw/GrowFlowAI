import { Task } from '../lib/supabase';

export function getPlantEmoji(status: Task['status']): string {
  const emojiMap: Record<Task['status'], string> = {
    'Not Started': '🌱',
    'In Progress': '🌿',
    'Done': '🌳'
  };
  return emojiMap[status] || '🌱';
}

export function getProgressPercentage(status: Task['status']): number {
  const percentageMap: Record<Task['status'], number> = {
    'Not Started': 0,
    'In Progress': 60,
    'Done': 100
  };
  return percentageMap[status] || 0;
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getInitials(name: string | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getFirstName(fullName: string | undefined): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

export function formatDeadline(deadline: string | null): {
  text: string;
  isOverdue: boolean;
  isDueSoon: boolean;
} {
  if (!deadline) {
    return { text: 'No deadline', isOverdue: false, isDueSoon: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isDueSoon = diffDays >= 0 && diffDays <= 3;

  let text = '';

  if (diffDays < 0) {
    text = `Overdue by ${Math.abs(diffDays)}d`;
  } else if (diffDays === 0) {
    text = 'Due today';
  } else if (diffDays === 1) {
    text = 'Due tomorrow';
  } else if (diffDays <= 7) {
    text = `Due in ${diffDays} days`;
  } else {
    text = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  return { text, isOverdue, isDueSoon };
}

export const STATUS_OPTIONS = [
  {
    value: 'Not Started' as const,
    label: 'Not Started',
    description: 'Ready to plant',
    emoji: '🌱'
  },
  {
    value: 'In Progress' as const,
    label: 'In Progress',
    description: 'Growing nicely',
    emoji: '🌿'
  },
  {
    value: 'Done' as const,
    label: 'Completed',
    description: 'Fully grown!',
    emoji: '🌳'
  }
];
