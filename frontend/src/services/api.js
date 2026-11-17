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

async function handleJsonResponse(res) {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') {
      return {
        success: false,
        error: res.ok
          ? 'Empty response received from server.'
          : `Server returned status ${res.status} with empty body. Please verify the backend is running.`,
      };
    }
    return JSON.parse(text);
  } catch (err) {
    return {
      success: false,
      error: `Could not parse server response (${res.status || 'network error'}). Ensure backend is running on port 5000.`,
    };
  }
}

export const api = {
  // Pricing & Shop info
  async getPricing() {
    const res = await fetch(`${API_BASE}/pricing`);
    return handleJsonResponse(res);
  },

  async calculateEstimate(items) {
    const res = await fetch(`${API_BASE}/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return handleJsonResponse(res);
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
    return handleJsonResponse(res);
  },

  async deleteDocument(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
    });
    return handleJsonResponse(res);
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
    return handleJsonResponse(res);
  },

  async trackOrder(orderId, mobileNumber) {
    const params = new URLSearchParams({ orderId });
    if (mobileNumber) params.append('mobileNumber', mobileNumber);

    const res = await fetch(`${API_BASE}/orders/track?${params.toString()}`, {
      headers: {
        'x-session-token': getSessionToken(),
      },
    });
    return handleJsonResponse(res);
  },

  async getMyOrders(mobileNumber) {
    const res = await fetch(`${API_BASE}/orders/my-orders?mobileNumber=${encodeURIComponent(mobileNumber)}`);
    return handleJsonResponse(res);
  },

  // Payment Verification
  async verifyPayment(paymentPayload) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload),
    });
    return handleJsonResponse(res);
  },

  // Admin APIs
  async adminLogin(identifier, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return handleJsonResponse(res);
  },

  async getAdminMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async getAdminOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/orders?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async getAdminOrderDetails(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async markOrderPrinted(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/mark-printed`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async markOrderCollected(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/mark-collected`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async retryPrintJob(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/retry-print`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
  },

  async getShopSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders(),
    });
    return handleJsonResponse(res);
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
    return handleJsonResponse(res);
  },
};
