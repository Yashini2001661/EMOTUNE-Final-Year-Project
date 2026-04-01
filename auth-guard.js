import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "auth.html";
  } else {
    const userName = document.getElementById("userName");
    if (userName) {
      userName.textContent = user.displayName || user.email;
    }
  }
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "auth.html";
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  });
}