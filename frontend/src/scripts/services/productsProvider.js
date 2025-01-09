import { PRODUCTS_BASE_API_URL, TIMEOUT_SECONDS } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new Error(
          `Request took too long! Timeout after ${s} second, check your connection.`
        )
      );
    }, s * 1000);
  });
};

export async function getCategories() {
  try {
    const response = await fetch(PRODUCTS_BASE_API_URL + "/categories");
    const data = await response.json();
    if (response.status !== 200) throw new Error(data.error);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getProducts() {
  try {
    const response = await fetch(PRODUCTS_BASE_API_URL + "/products");
    const data = await response.json();
    if (response.status !== 200) throw new Error(data.error);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getProductById(id) {
  try {
    const response = await Promise.race([
      fetch(PRODUCTS_BASE_API_URL + "/products/" + id),
      timeout(TIMEOUT_SECONDS),
    ]);
    const data = await response.json();
    if (!response?.status || response.status !== 200)
      throw new Error(data.error);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function postProduct(product) {
  try {
    const response = await fetch(PRODUCTS_BASE_API_URL + "/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    const data = await response.json();
    if (response.status !== 201) throw new Error(data);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function putProduct(product) {
  try {
    const response = await fetch(
      PRODUCTS_BASE_API_URL + "/products/" + product.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      }
    );
    const data = await response.json();
    if (response.status !== 200) throw new Error(data);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const response = await fetch(PRODUCTS_BASE_API_URL + "/products/" + id, {
      method: "DELETE",
    });
    const data = await response.json();
    if (response.status !== 204) throw new Error(data);
    return data;
  } catch (error) {
    throw error;
  }
}

function isClientSignedIn() {
  return document.cookie.includes("PHPSESSID");
}

/**
 * Get the cart of the client.
 * IT IS MEANT TO BE USED ONY ON CLIENT SIDE.
 * @returns {Promise<Array>} - Array of products in the cart.
 *
 */
export function getCart() {
  try {
    const response = fetch(PRODUCTS_BASE_API_URL + "/cart");
    const data = response.json();
    if (response.status !== 200) throw new Error(response);
    return data;
  } catch (error) {
    throw error;
  }
}

export function addToCart(id) {
  try {
    const response = fetch(PRODUCTS_BASE_API_URL + "/cart/" + id, {
      method: "POST",
    });
    const data = response.json();
    if (response.status !== 200) throw new Error(data);
    return data;
  } catch (error) {
    throw error;
  }
}
