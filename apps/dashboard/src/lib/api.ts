const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:40000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('orbis_token') : null;
    const masterSync = typeof window !== 'undefined' ? localStorage.getItem('orbis_master_sync') : 'true';

    const isAuthRoute = endpoint.includes('/auth/');
    if (!isAuthRoute && masterSync === 'false') {
        return Promise.reject({ message: 'Master Sync is Offline', isOffline: true });
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // Auto-prepend slash if missing
    const url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API Request failed' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error(`API Fetch Error [${url}]:`, error);
        throw error;
    }
}

export const campaignsApi = {
    list: () => apiFetch('/campaigns'),
    listQueue: () => apiFetch('/campaigns/queue'),
    get: (id: string) => apiFetch(`/campaigns/${id}`),
    create: (data: any) => apiFetch('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) => apiFetch(`/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: string) => apiFetch(`/campaigns/${id}`, { method: 'DELETE' }),
};

export const leadsApi = {
    list: (params?: { stage?: string; campaignId?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiFetch(`/leads?${query}`);
    },
    get: (id: string) => apiFetch(`/leads/${id}`),
    getTimeline: (id: string) => apiFetch(`/leads/${id}/timeline`),
    update: (id: string, data: any) => apiFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStage: (id: string, stage: string) => apiFetch(`/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    delete: (id: string) => apiFetch(`/leads/${id}`, { method: 'DELETE' }),
};

export const emailSequencesApi = {
    list: () => apiFetch('/email-sequences'),
    create: (data: any) => apiFetch('/email-sequences', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/email-sequences/${id}`, { method: 'DELETE' }),
};

export const agentsApi = {
    list: () => apiFetch('/agents'),
};

export const incidentsApi = {
    list: () => apiFetch('/incidents'),
};

export const settingsApi = {
    get: () => apiFetch('/settings'),
    update: (data: any) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

export const diagnosticsApi = {
    runWorkflowTest: (url: string) => apiFetch('/diagnostics/workflow-test', {
        method: 'POST',
        body: JSON.stringify({ url })
    }),
};

export const aiApi = {
    generateEmails: (data: any) => apiFetch('/ai/generate-emails', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
};

export const usersApi = {
    list: () => apiFetch('/users'),
    create: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

export const authApi = {
    login: (credentials: { identifier: string; password: string }) => 
        apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    forgotCredentials: (identifier: string) => 
        apiFetch('/auth/forgot-credentials', { method: 'POST', body: JSON.stringify({ identifier }) }),
    getProfile: () => apiFetch('/auth/profile'),
};
