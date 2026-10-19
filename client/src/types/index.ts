export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  jobTitle?: string;
  department?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  timezone?: string;
}

export interface Meeting {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  organizer: string | User;
  workspace?: string;
  meetingCode: string;
  startTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  isRecordingEnabled: boolean;
  isAiEnabled: boolean;
  invitees?: string[];
  createdAt?: string;
}

export interface Workspace {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  owner: string | User;
  members: Array<{ user: string | User; role: 'Owner' | 'Admin' | 'Member' }>;
  createdAt?: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  workspace?: string;
  meeting?: string;
  assignee?: User;
  creator: string | User;
  priority: PriorityLevel;
  status: TaskStatus;
  deadline?: string;
  tags?: string[];
  createdAt?: string;
}

export interface ActionItem {
  _id?: string;
  id?: string;
  meeting: string;
  title: string;
  description?: string;
  assigneeName?: string;
  priority: PriorityLevel;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface MeetingSummaryData {
  meeting: string;
  overview: string;
  mainPoints: string[];
  decisions: string[];
  questions: string[];
  outcomes: string[];
  recommendations: string[];
}

export interface ChatMessage {
  meeting: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  totalMeetings: number;
  meetingsThisWeek: number;
  totalMeetingHours: number;
  pendingActionItems: number;
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  weeklyTrends: Array<{ day: string; meetings: number; durationHours: number; tasksCompleted: number }>;
  taskDistribution: Array<{ name: string; value: number }>;
}
