(() => {
  const apiBaseUrl = (window.MUSCLE_RECOVERY_API_URL || "http://localhost:3000").replace(/\/$/, "");

  async function request(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      if (response.status === 401 && !window.location.pathname.endsWith("auth.html")) {
        window.location.assign("auth.html");
      }
      throw new Error(body.error || `Request failed (${response.status}).`);
    }
    return response.json();
  }

  async function getRecovery() {
    return request("/api/muscles/recovery");
  }

  async function getExercises() {
    return request("/api/exercises");
  }

  async function createWorkout(workout) {
    return request("/api/workouts", {
      method: "POST",
      body: JSON.stringify(workout),
    });
  }

  window.MuscleRecoveryApi = {
    apiBaseUrl,
    getRecovery,
    getExercises,
    createWorkout,
    getCurrentUser: () => request("/api/auth/me"),
    register: (account) => request("/api/auth/register", { method: "POST", body: JSON.stringify(account) }),
    login: (credentials) => request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
    request,
  };
})();
