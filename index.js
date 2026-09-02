(() => {
  const signInButton = document.querySelector("#signInButton");
  const profileSection = document.querySelector("#profileSection");
  const profileMenuButton = document.querySelector("#profileMenuButton");
  const profileDropdown = document.querySelector("#profileDropdown");
  const profileAvatar = document.querySelector("#profileAvatar");
  const profileName = document.querySelector("#profileName");
  const profileEmail = document.querySelector("#profileEmail");
  const profileLink = document.querySelector("#profileLink");
  const logoutButton = document.querySelector("#logoutButton");

  // Check auth state and update UI accordingly
  async function initializeAuthUI() {
    try {
      const user = await window.MuscleRecoveryApi.getCurrentUser();
      // User is authenticated
      showProfileSection(user);
    } catch (error) {
      // User is not authenticated
      showSignInButton();
    }
  }

  function showSignInButton() {
    signInButton.hidden = false;
    profileSection.hidden = true;
  }

  function showProfileSection(user) {
    signInButton.hidden = true;
    profileSection.hidden = false;

    // Generate initials from user name or email
    const displayName = user.name || user.email || "User";
    const initials = displayName
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);

    profileAvatar.textContent = initials;
    profileName.textContent = displayName;
    profileEmail.textContent = user.email || "";
  }

  // Toggle dropdown visibility
  profileMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    profileDropdown.hidden = !profileDropdown.hidden;
    profileMenuButton.setAttribute("aria-expanded", !profileDropdown.hidden);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!profileSection.contains(event.target)) {
      profileDropdown.hidden = true;
      profileMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  // Close dropdown when clicking menu items
  profileDropdown.addEventListener("click", () => {
    profileDropdown.hidden = true;
    profileMenuButton.setAttribute("aria-expanded", "false");
  });

  // Handle logout
  logoutButton.addEventListener("click", async () => {
    try {
      await window.MuscleRecoveryApi.logout();
      // Redirect to index.html to show sign-in button
      window.location.assign("index.html");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  });

  // Handle profile link (placeholder for future implementation)
  profileLink.addEventListener("click", () => {
    // TODO: Implement profile page navigation
    console.log("Profile page not yet implemented");
  });

  // Initialize on page load
  initializeAuthUI();
})();
