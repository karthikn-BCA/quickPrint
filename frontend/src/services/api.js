const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('cp_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getSessionToken() {
  let token = sessionStorage.getItem('cp_session_token');
  if (!token) {
    token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('cp_session_token', token);
  }
  return token;
}

export const api = {
  // Pricing & Shop info
  async getPricing() {
    const res = await fetch(`${API_BASE}/pricing`);
    return res.json();
  },

  async calculateEstimate(items) {
    const res = await fetch(`${API_BASE}/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return res.json();
  },

  // Document Uploads
  async uploadDocuments(formData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: {
        'x-session-token': getSessionToken(),
      },
      body: formData,
    });
    return res.json();
  },

  async deleteDocument(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  getDocumentPreviewUrl(id) {
    return `${API_BASE}/documents/preview/${id}`;
  },

  getDocumentDownloadUrl(id) {
    return `${API_BASE}/documents/download/${id}`;
  },

  // Orders & Checkout
  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': getSessionToken(),
      },
      body: JSON.stringify(orderPayload),
    });
    return res.json();
  },

  async trackOrder(orderId, mobileNumber) {
    const params = new URLSearchParams({ orderId });
    if (mobileNumber) params.append('mobileNumber', mobileNumber);

    const res = await fetch(`${API_BASE}/orders/track?${params.toString()}`, {
      headers: {
        'x-session-token': getSessionToken(),
      },
    });
    return res.json();
  },

  async getMyOrders(mobileNumber) {
    const res = await fetch(`${API_BASE}/orders/my-orders?mobileNumber=${encodeURIComponent(mobileNumber)}`);
    return res.json();
  },

  // Payment Verification
  async verifyPayment(paymentPayload) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload),
    });
    return res.json();
  },

  // Admin APIs
  async adminLogin(identifier, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return res.json();
  },

  async getAdminMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/orders?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminOrderDetails(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async markOrderPrinted(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/mark-printed`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async markOrderCollected(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/mark-collected`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async retryPrintJob(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/retry-print`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getShopSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateShopSettings(settingsPayload) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(settingsPayload),
    });
    return res.json();
  },
};
