const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    console.log('request', endpoint, options); 
    const url = `${this.baseURL}${endpoint}`;
    console.log('url', url);
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signout() {
    return this.request('/auth/signout', {
      method: 'POST',
    });
  }

  // Friend methods
  async sendFriendRequest(userId) {
    return this.request(`/friends/${userId}/request`, {
      method: 'POST',
    });
  }

  async acceptFriendRequest(userId) {
    return this.request(`/friends/${userId}/accept`, {
      method: 'POST',
    });
  }

  async rejectFriendRequest(userId) {
    return this.request(`/friends/${userId}/reject`, {
      method: 'POST',
    });
  }

  // Friends/Users methods
  async getFriends() {
    return this.request('/friends');
  }
  async getFriendSuggestions() {
    return this.request('/friends/suggestions');
  }
  async getReceivedRequests() {
    return this.request('/friends/requests/received');
  }
  async getSentRequests() {
    return this.request('/friends/requests/sent');
  }
  async cancelFriendRequest(userId) {
    return this.request(`/friends/${userId}/cancel`, { method: 'DELETE' });
  }
  async unfriend(userId) {
    return this.request(`/friends/${userId}/unfriend`, { method: 'DELETE' });
  }
  async getFriendStatus(userId) {
    return this.request(`/friends/${userId}/status`);
  }

  // Post/Feed methods
  async getFeed() {
    return this.request('/posts/feed');
  }

  async createPost(formData) {
    // formData should be a FormData object for image upload
    return this.request('/posts', {
      method: 'POST',
      body: formData,
      headers: { ...formData.getHeaders?.() }, // for axios, not fetch, but keep for future
    });
  }

  async likePost(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addComment(postId, text) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async updatePost(postId, content) {
    return this.request(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  // Profile methods
  async getMe() {
    return this.request('/users/me');
  }
  async updateMe(formData) {
    // formData should be a FormData object for avatar upload
    return this.request('/users/me', {
      method: 'PUT',
      body: formData,
      headers: { ...formData.getHeaders?.() },
    });
  }
  async getUser(id) {
    return this.request(`/users/${id}`);
  }
  async getPostsByUser(id) {
    return this.request(`/posts/user/${id}`);
  }

  // Settings methods
  async changePassword(currentPassword, newPassword) {
    return this.request('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Chat/Messaging methods
  async sendMessage(recipient, content) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipient, content }),
      headers: { 'Content-Type': 'application/json' },
    });
  }
  async getMessages(userId) {
    return this.request(`/messages/${userId}`);
  }
  async getConversations() {
    return this.request('/messages/conversations');
  }
}

export default new ApiService();