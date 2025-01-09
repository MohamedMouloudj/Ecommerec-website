import { PRODUCTS_BASE_API_URL } from "./services/config";
import showMessage from "./utils/message";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const client = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${PRODUCTS_BASE_API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(client),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    showMessage(data.message, 0);
    setTimeout(() => {
      window.location.href = data.redirectPath;
    }, 3000);
  } catch (error) {
    showMessage("Incorrect email or password", 1);
  }
});
