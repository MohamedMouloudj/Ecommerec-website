import {
  getProductById,
  getProducts,
} from "../../scripts/services/productsProvider";

export const state = {
  product: {},
  products: [],
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
};

export async function loadProducts() {
  try {
    const products = await getProducts();
    products.forEach((product) => {
      product.isAdded = false;
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
  state.search.result = state.products.filter((product) => {
    return (
      product.name.toLowerCase().includes(state.search.query) ||
      product.description.toLowerCase().includes(state.search.query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(state.search.query))
    );
  });
}

export function filterProducts(filters) {
  if (filters.category === "all") {
    filters.category = "";
  }
  state.search.filters.category = filters.category;
  state.search.filters.price.min = +filters.lowerBound ?? 0;
  state.search.filters.price.max = +filters.upperBound ?? 0;
  state.search.result = state.products.filter((product) => {
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
  });
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
