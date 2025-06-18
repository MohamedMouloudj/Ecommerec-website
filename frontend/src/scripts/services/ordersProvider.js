/**
 * Orders Provider Service
 * Handles all API interactions related to orders
 */
import { BASE_API_URL } from "./config";

/**
 * Fetch all orders for the authenticated user
 * @returns {Promise<Array>} - A promise that resolves to an array of order objects
 */
export const getAllOrders = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch orders");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Fetch a specific order by ID
 * @param {number} orderId - The ID of the order to fetch
 * @returns {Promise<Object>} - A promise that resolves to the order object
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${BASE_API_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch order details");
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Create a new order from the current active cart
 * @param {Object} orderData - Order data including optional discount
 * @param {number} [orderData.discountPercent] - Optional discount percentage
 * @returns {Promise<Object>} - A promise that resolves to the created order information
 */
export const createOrder = async (orderData = {}) => {
  try {
    const response = await fetch(`${BASE_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create order");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Cancel an existing order
 * @param {number} orderId - The ID of the order to cancel
 * @returns {Promise<Object>} - A promise that resolves to the cancellation confirmation
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${BASE_API_URL}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cancel order");
    }

    return response.json();
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};
