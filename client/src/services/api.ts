const getBaseApiUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!envUrl) {
    return '/api';
  }
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE_URL = getBaseApiUrl();

class ApiClient {
  private accessToken: string | null = localStorage.getItem('intellmeet_token');
  private refreshToken: string | null = localStorage.getItem('intellmeet_refresh_token');

  public setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('intellmeet_token', access);
    localStorage.setItem('intellmeet_refresh_token', refresh);
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('intellmeet_token');
    localStorage.removeItem('intellmeet_refresh_token');
  }

  public getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/refresh')) {
      // Attempt token refresh
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
          ...options,
          headers,
        });
      }
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? `API Endpoint not found (${response.status}). Please ensure VITE_API_URL on Vercel is set to your Render backend URL.`
            : `Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`
        );
      }
      return text as unknown as T;
    }

    if (!response.ok) {
      throw new Error(data?.message || 'An API error occurred');
    }
    return data.data !== undefined ? data.data : data;
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return false;
      const data = await res.json();
      if (data.success && data.data) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    } catch {
      // Ignore
    }
    this.clearTokens();
    return false;
  }

  // Auth API
  public signup(data: any) {
    return this.request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  }

  public login(data: any) {
    return this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  public getMe() {
    return this.request<any>('/auth/me');
  }

  public updateProfile(data: any) {
    return this.request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Meetings API
  public getMeetings(params?: { status?: string; workspaceId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/meetings${query ? `?${query}` : ''}`);
  }

  public getMeetingByCode(code: string) {
    return this.request<any>(`/meetings/code/${code}`);
  }

  public createMeeting(data: any) {
    return this.request<any>('/meetings', { method: 'POST', body: JSON.stringify(data) });
  }

  public endMeeting(code: string) {
    return this.request<any>(`/meetings/code/${code}/end`, { method: 'POST' });
  }

  // Workspaces API
  public getWorkspaces() {
    return this.request<any[]>('/workspaces');
  }

  public createWorkspace(data: any) {
    return this.request<any>('/workspaces', { method: 'POST', body: JSON.stringify(data) });
  }

  public inviteWorkspaceMember(workspaceId: string, email: string, role: string) {
    return this.request<any>(`/workspaces/${workspaceId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  // Tasks API
  public getTasks(params?: { status?: string; workspaceId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/tasks${query ? `?${query}` : ''}`);
  }

  public createTask(data: any) {
    return this.request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) });
  }

  public updateTaskStatus(taskId: string, status: string) {
    return this.request<any>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public convertActionItemToTask(actionItemId: string, meetingId?: string) {
    return this.request<any>('/tasks/from-action-item', {
      method: 'POST',
      body: JSON.stringify({ actionItemId, meetingId }),
    });
  }

  // AI API
  public getTranscript(meetingId: string) {
    return this.request<any>(`/ai/transcript/${meetingId}`);
  }

  public getMeetingSummary(meetingId: string) {
    return this.request<any>(`/ai/summary/${meetingId}`);
  }

  public getActionItems(meetingId: string) {
    return this.request<any[]>(`/ai/action-items/${meetingId}`);
  }

  public queryAiAssistant(meetingId: string, query: string) {
    return this.request<{ query: string; answer: string }>(`/ai/query/${meetingId}`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Analytics & Notifications
  public getAnalytics() {
    return this.request<any>('/analytics/dashboard');
  }

  public getNotifications() {
    return this.request<{ notifications: any[]; unreadCount: number }>('/notifications');
  }

  public markNotificationAsRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public markAllNotificationsAsRead() {
    return this.request<any>('/notifications/read-all', { method: 'POST' });
  }
}

export const api = new ApiClient();
