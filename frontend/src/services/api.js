const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to handle API calls
const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('veloop_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw { status: response.status, ...data };
  }

  return data;
};

export const api = {
  getGiveaways: () => fetchApi('/giveaways/current'),
  getGiveawayById: (id) => fetchApi(`/giveaways/${id}`),
  getPreviousGiveaways: () => fetchApi('/giveaways/previous'),
  getStats: () => fetchApi('/giveaways/stats'),
  joinGiveaway: (giveawayId, prizeId, idempotencyKey) => fetchApi(`/giveaways/${giveawayId}/join`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ prizeId })
  }),
  getMyStatus: (giveawayId) => fetchApi(`/giveaways/${giveawayId}/my-status`),
  getMyParticipations: () => fetchApi('/giveaways/my-participations'),
  getWinners: (giveawayId) => fetchApi(`/giveaways/${giveawayId}/winners`),
  getPreviousWinners: () => fetchApi('/giveaways/previous/winners'),
  submitClaim: (giveawayId, claimData) => fetchApi(`/giveaways/${giveawayId}/claim`, {
    method: 'POST',
    body: JSON.stringify(claimData)
  }),
  login: (email, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (name, email, password) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  }),
  getMe: () => fetchApi('/auth/me')
};
