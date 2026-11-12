import { apiClient } from "./apiClient";

export const adminService = {
  /**
   * Fetch platform analytics and overview
   */
  async getOverview() {
    const res = await apiClient.get("/admin/overview");
    return res.data;
  },

  /**
   * Fetch users with search, stage, role, status filters, and sorting
   */
  async getUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.stage && params.stage !== "all") query.set("stage", params.stage);
    if (params.role && params.role !== "all") query.set("role", params.role);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);

    const queryStr = query.toString();
    const endpoint = `/admin/users${queryStr ? `?${queryStr}` : ""}`;
    const res = await apiClient.get(endpoint);
    return {
      users: res.data || [],
      pagination: res.pagination || {}
    };
  },

  /**
   * Get single user deep-dive status
   */
  async getUserById(id) {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },

  /**
   * Update account status (active ↔ suspended)
   */
  async updateUserStatus(id, status) {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  /**
   * Update user role (student ↔ admin)
   */
  async updateUserRole(id, role) {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  /**
   * Grant bonus XP to learner
   */
  async awardBonusXp(id, amount, reason) {
    const res = await apiClient.post(`/admin/users/${id}/bonus-xp`, { amount, reason });
    return res.data;
  },

  /**
   * Delete user account
   */
  async deleteUser(id) {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.message;
  },

  /**
   * Delete all users at one time (Requires explicit confirm phrase and admin password)
   * @param {string} scope - "all" | "students_only"
   * @param {string} confirmPhrase - "DELETE ALL USERS"
   * @param {string} adminPassword - Active admin password for re-authentication
   */
  async deleteAllUsers(scope = "all", confirmPhrase = "DELETE ALL USERS", adminPassword = "") {
    const res = await apiClient.delete(`/admin/users?scope=${scope}`, {
      body: JSON.stringify({ scope, confirmPhrase, adminPassword })
    });
    return res;
  },

  /**
   * Bulk delete selected user accounts
   * @param {string[]} userIds
   */
  async bulkDeleteUsers(userIds = []) {
    const res = await apiClient.post("/admin/users/bulk-delete", { userIds });
    return res;
  },

  /**
   * Fetch admin audit trail logs
   */
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.action && params.action !== "all") query.set("action", params.action);
    if (params.search) query.set("search", params.search);

    const queryStr = query.toString();
    const endpoint = `/admin/audit-logs${queryStr ? `?${queryStr}` : ""}`;
    const res = await apiClient.get(endpoint);
    return {
      logs: res.data || [],
      pagination: res.pagination || {}
    };
  },

  /**
   * Fetch active curriculum overrides from PostgreSQL
   */
  async getCurriculumOverrides() {
    try {
      const res = await apiClient.get("/admin/curriculum/overrides");
      return res.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Save or update curriculum override in PostgreSQL
   */
  async saveCurriculumOverride({ entityType, entityId, data, isArchived = false }) {
    const res = await apiClient.post("/admin/curriculum/overrides", {
      entityType,
      entityId,
      data,
      isArchived
    });
    return res.data;
  },

  /**
   * Delete custom curriculum override from PostgreSQL
   */
  async deleteCurriculumOverride(type, id) {
    const res = await apiClient.delete(`/admin/curriculum/overrides/${type}/${id}`);
    return res.data;
  },

  /**
   * Safety check: Check how many students have completed or attempted this topic
   */
  async checkTopicUsage(topicId) {
    const res = await apiClient.get(`/admin/curriculum/topics/${topicId}/usage`);
    return res.data;
  },

  /**
   * Post quiz audit summary to server audit history
   */
  async recordQuizAuditRun(auditSummary) {
    try {
      const res = await apiClient.post("/admin/quizzes/validate", auditSummary);
      return res.data;
    } catch {
      return null;
    }
  }
};

