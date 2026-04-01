import { auth, db, googleProvider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const tabButtons = document.querySelectorAll(".tab-btn");
const formSections = document.querySelectorAll(".form-section");
const statusMessage = document.getElementById("statusMessage");

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message " + type;

  setTimeout(() => {
    statusMessage.className = "status-message";
    statusMessage.textContent = "";
  }, 3500);
}

function activateTab(tabName) {
  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  formSections.forEach(section => {
    section.classList.toggle("active", section.id === tabName + "Form");
  });
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

document.getElementById("goToReset").addEventListener("click", function (e) {
  e.preventDefault();
  activateTab("reset");
});

document.querySelectorAll(".toggle-password").forEach(button => {
  button.addEventListener("click", function () {
    const input = document.getElementById(this.dataset.target);
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    this.textContent = isPassword ? "Hide" : "Show";
  });
});

// Redirect already logged-in users
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.includes("auth.html")) {
    window.location.href = "index.html";
  }
});

// Register
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: fullName
    });

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName: fullName,
      email: user.email,
      provider: "password",
      theme: "dark",
      preferredDetection: "voice",
      createdAt: serverTimestamp()
    });

    showMessage("Account created successfully.", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage("Login successful.", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// Google Login
document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email || "",
        provider: "google",
        theme: "dark",
        preferredDetection: "voice",
        createdAt: serverTimestamp()
      });
    }

    showMessage("Google login successful.", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const formSections = document.querySelectorAll(".form-section");
  const goToReset = document.getElementById("goToReset");
  const statusMessage = document.getElementById("statusMessage");

  function showTab(tabName) {
    tabButtons.forEach((button) => {
      button.classList.remove("active");
      if (button.dataset.tab === tabName) {
        button.classList.add("active");
      }
    });

    formSections.forEach((form) => {
      form.classList.remove("active");
    });

    if (tabName === "login") {
      document.getElementById("loginForm").classList.add("active");
    } else if (tabName === "register") {
      document.getElementById("registerForm").classList.add("active");
    } else if (tabName === "reset") {
      document.getElementById("resetForm").classList.add("active");
    }

    if (statusMessage) {
      statusMessage.textContent = "";
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showTab(button.dataset.tab);
    });
  });

  if (goToReset) {
    goToReset.addEventListener("click", (e) => {
      e.preventDefault();
      showTab("reset");
    });
  }

  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetInput = document.getElementById(button.dataset.target);

      if (targetInput.type === "password") {
        targetInput.type = "text";
        button.textContent = "Hide";
      } else {
        targetInput.type = "password";
        button.textContent = "Show";
      }
    });
  });

  showTab("login");
});

// Password reset
document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("Password reset email sent.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});