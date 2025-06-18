import { BASE_API_URL } from "./services/config";
import showMessage from "./ui/message";

const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const client = Object.fromEntries(formData.entries());

  if (client.password !== client["confirm-password"]) {
    showMessage("Passwords do not match", 1);
    return;
  }

  const data = {
    name: client.name,
    email: client.email,
    password: client.password,
  };
  client.secret ? (data.secret = client.secret) : null;
  try {
    const response = await fetch(BASE_API_URL + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const dataResponse = await response.json();
    if (response.status !== 200) throw new Error(dataResponse.error);
    showMessage(dataResponse.message, 0);
    console.log(dataResponse);

    setTimeout(() => {
      window.location.href = "/signin";
    }, 2000);
  } catch (error) {
    showMessage(error.message, 1);
  }
});
