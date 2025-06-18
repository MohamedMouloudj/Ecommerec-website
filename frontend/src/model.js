import { mode } from "crypto-js";
import {
  getProducts,
  getProductById,
  getCategories,
} from "./scripts/services/productsProvider";
import {
  fetchUserInfo,
  getUserCart,
  handleLogout,
  removeProductItem,
  updateCart,
} from "./scripts/services/user";
// TODO: add isAdded attribute
export const state = {
  product: {},
  products: [],
  cart: [],
  search: {
    query: "",
    filters: {
      category: "",
      price: {
        min: 0,
        max: 0,
      },
    },
    result: [],
  },
  cart: [],
  categories: [],
  user: {},
};

export async function loadProducts() {
  try {
    const products = await getProducts();
    products.forEach((product) => {
      // product.isAdded = false;
      state.products.push(product);
    });
  } catch (error) {
    throw error;
  }
}

export async function loadProduct(id) {
  try {
    id = +id;
    if (!state.products.length) {
      state.product = await getProductById(id);
      return;
    }
    state.product = state.products.find((product) => product.id === id);
  } catch (error) {
    throw error;
  }
}

export function searchProducts(query) {
  state.search.query = query.trim().toLowerCase();
  state.search.result = {
    result: state.products.filter((product) => {
      return (
        product.name.toLowerCase().includes(state.search.query) ||
        product.description.toLowerCase().includes(state.search.query) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(state.search.query)
        )
      );
    }),
    cart: state.cart,
  };
}

export function filterProducts(filters) {
  if (filters.category === "all") {
    filters.category = "";
  }
  state.search.filters.category = filters.category;
  state.search.filters.price.min = +filters.lowerBound ?? 0;
  state.search.filters.price.max = +filters.upperBound ?? 0;
  state.search.result = {
    products: state.products.filter((product) => {
      const category = filters.category
        ? product.category === filters.category
        : true;
      if (state.search.filters.price.max !== 0) {
        const price = state.search.filters.price
          ? product.price <= state.search.filters.price.max
          : false;
        return category && price;
      }
      if (state.search.filters.price.min !== 0) {
        const price = state.search.filters.price
          ? product.price >= state.search.filters.price.min
          : false;
        return category && price;
      }
      if (
        state.search.filters.price.min !== 0 &&
        state.search.filters.price.max !== 0
      ) {
        const price = state.search.filters.price
          ? product.price >= state.search.filters.price.min &&
            product.price <= state.search.filters.price.max
          : false;
        return category && price;
      }
      return category;
    }),
    cart: state.cart,
  };
}

export function clearFilters() {
  state.search.filters = {
    category: "",
    price: {
      min: 0,
      max: 0,
    },
  };
  state.search.result = [];
}

export async function loadCategories() {
  try {
    const categories = await getCategories();
    categories.forEach((category) => {
      state.categories.push(category);
    });
  } catch (error) {
    throw error;
  }
}

export const addProductToCart = (product) => {
  if (state.cart.some((cartProduct) => cartProduct.product.id === product.id)) {
    return;
  }
  product = { ...product, isAdded: true, quantity: 1 };
  state.cart.push({ product });
  updateCart({ id: product.id, quantity: 1 });
};

export const changeProductQuantity = (id, operation) => {
  try {
    const addedProduct = state.cart.find(
      (product) => product.product.id === +id
    );
    if (operation === "increment") {
      if (addedProduct.product.quantity === addedProduct.product.stock) return;
      addedProduct.product.quantity++;
      const data = updateCart(addedProduct.product);
      return data.message;
    }
    if (addedProduct.product.quantity === 1) {
      removeProductFromCart(id);
      return;
    }
    addedProduct.product.quantity--;
    const data = updateCart(addedProduct.product);
    return data.message;
  } catch (error) {
    throw error;
  }
};

export async function removeProductFromCart(id) {
  try {
    state.cart = state.cart.filter((product) => product.product.id !== +id);
    const data = await removeProductItem(id);
    return data.message;
  } catch (error) {
    throw error;
  }
}

export const clearCart = () => {
  state.cart = [];
};

export async function setUser() {
  try {
    state.user = await fetchUserInfo();
    if (state.user.email) {
      const serevrCart = await getUserCart();
      serevrCart.forEach((cartItem) => {
        state.cart.push({ product: cartItem });
        state.products.forEach((product) => {
          if (product.id === cartItem.id) {
            product.isAdded = true;
          }
        });
      });
    }
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  if (await handleLogout()) {
    state.user = {};
  }
}
