import { PRODUCTS_BASE_API_URL as API_BASE_URL } from "./config.js";

export async function fetchUserInfo() {
  try {
    const response = await fetch(API_BASE_URL + "/profile", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.status !== 200) throw new Error("Failed to fetch user info");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function handleLogout() {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    await response.json();
    if (response.status !== 200) throw new Error("Failed to log out");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

export async function getUserCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.status !== 200) throw new Error("Failed to fetch user cart");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateCart(product) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    const data = await response.json();
    if (response.status !== 200) throw new Error("Failed to update cart");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function removeProductItem(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: id }),
    });
    const data = await response.json();
    if (response.status !== 200)
      throw new Error("Failed to remove product from cart");
    return data;
  } catch (error) {
    throw error;
  }
}
