// src/users.js

// Get all users (as object)
export const getUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || {};
  };
  
  // Get current user key (username)
  export const getCurrentUserKey = () => {
    return localStorage.getItem("currentUser");
  };
  
  // Get current user data
  export const getCurrentUser = () => {
    const users = getUsers();
    const currentUsername = getCurrentUserKey();
  
    return users[currentUsername] || null;
  };
  
  // Update current user with new data
  export const updateCurrentUser = (updatedData) => {
    const users = getUsers();
    const currentUsername = getCurrentUserKey();
  
    if (currentUsername && users[currentUsername]) {
      users[currentUsername] = {
        ...users[currentUsername],
        ...updatedData,
      };
      localStorage.setItem("users", JSON.stringify(users));
    }
  };
  