import * as model from "./model";
import searchView from "./views/SearchView";
import resultView from "./views/ResultView";
import filtersView from "./views/FiltersView";
import productView from "./views/ProductView";
import cartView from "./views/CartView";
import {
  getDarkModePreference,
  setDarkModePreference,
} from "../../scripts/services/preferences";
import showMessage from "../../scripts/utils/message";

const controleSearch = () => {
  const query = searchView.getQuery();
  model.searchProducts(query);
  resultView.render(model.state.search.result);
};

const controlRemoveSearch = () => {
  resultView.render({ products: model.state.products, cart: model.state.cart });
};

const controleCategories = async () => {
  await model.loadCategories();
  filtersView.initCategories(() => model.state.categories);
};

const controlFilters = () => {
  const formData = new FormData(
    filtersView.parentElement.querySelector("form")
  );
  const data = Object.fromEntries(formData);
  model.filterProducts(data);
  resultView.render(model.state.search.result);
};

const controlRemoveFilters = () => {
  model.clearFilters();
  resultView.render({ products: model.state.products, cart: model.state.cart });
};

const assignProductPage = () =>
  Array.from(cartView.parentElement.children).forEach((item) => {
    item.addEventListener("click", (e) => {
      const buttonIncrement = e.target.closest(".cart__button--increment");
      const buttonDecrement = e.target.closest(".cart__button--decrement");
      const buttonRemoveFromCart = e.target.closest(
        ".cart__button--remove-from-cart"
      );
      if (
        e.target !== buttonIncrement &&
        e.target !== buttonDecrement &&
        e.target !== buttonRemoveFromCart
      ) {
        window.location.hash = item.dataset.href;
      }
    });
  });

const controlAddToCart = (id) => {
  if (!model.state.user.email) {
    setTimeout(() => (window.location.href = "/signin"), 3000);
    showMessage("Please sign in to add products to cart", 2);
    return;
  }

  if (id) {
    model.loadProduct(id);
  }
  model.addProductToCart(model.state.product);
  cartView.render(model.state.cart);
  cartView.calculateTotal();
  showMessage("Product added to cart", 0);
  assignProductPage();
};

const controlRemoveFromCart = (id) => {
  model.removeProductFromCart(id);
  cartView.render(model.state.cart);
  cartView.calculateTotal(model.state.cart);
  assignProductPage();
};

const controlChangeQuantity = (id, operation) => {
  model.changeProductQuantity(id, operation);
  cartView.render(model.state.cart);
  cartView.calculateTotal(model.state.cart);
  assignProductPage();
};

const controlProducts = async () => {
  try {
    const id = window.location.hash.slice(1);
    if (!id) {
      resultView.renderSpinner();
      if (!model.state.products.length) {
        await model.loadProducts();
      }
      const data = {
        products: model.state.products,
        cart: model.state.cart,
      };
      resultView.render(data);
      document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          controlAddToCart(e.target.dataset.id);
        });
      });
      document.querySelectorAll(".remove-from-cart").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          controlRemoveFromCart(e.target.dataset.id);
        });
      });
      document.querySelectorAll(".preview__product").forEach((preview) => {
        preview.addEventListener("click", () => {
          window.location.hash = preview.dataset.href;
        });
      });
    }
    if (id) {
      await model.loadProduct(id);
      productView.render(model.state.product);
      document.querySelector(".options")?.classList.add("hidden");
      document.querySelector(".search")?.classList.add("hidden");
      productView.controlProduct(controlAddToCart);
    }
  } catch (error) {
    resultView.renderError(error.message);
  }
};

const init = () => {
  productView.addHandleRender(controlProducts);
  resultView.handleViewMode();
  searchView.addHandleSearch(controleSearch);
  searchView.addHandleRemoveSearch(controlRemoveSearch);
  filtersView.addHandleFilters(controlFilters);
  filtersView.addHandleClearFilters(controlRemoveFilters);
  cartView.addHandleRemoveFromCart(controlRemoveFromCart);
  cartView.addHandleQuantityChange(controlChangeQuantity);
};

init();

document
  .querySelector(".options__filters--open")
  .addEventListener("click", () => {
    document
      .querySelector(".options__filters--container")
      .classList.toggle("hidden");
  });

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};
const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("ad__visible");
    } else {
      observer.unobserve(entry.target);
    }
  });
};
const observer = new IntersectionObserver(observerCallback, observerOptions);
const adContainer = document.querySelector(".ad");
if (adContainer) {
  observer.observe(adContainer);
}
document.querySelector("#ad__button").addEventListener("click", (e) => {
  const target = document.querySelector(".app-container");
  smoothScroll(target, 900);
});
function smoothScroll(target, duration) {
  const targetPosition = target.getBoundingClientRect().top;
  const startPosition = window.scrollY; // Updated line
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, targetPosition, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  /**
   * Ease animation function
   * @param {number} t - timeElapsed
   * @param {number} b - startPosition
   * @param {number} c - targetPosition
   * @param {number} d - duration
   * @returns {number} - Updated line
   */
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

document.addEventListener("DOMContentLoaded", async () => {
  controleCategories();
  if (getDarkModePreference()) {
    toggleDarkMode();
  }
  await model.setUser();
  if (!model.state.user.email) return;
  cartView.render(model.state.cart);
  cartView.calculateTotal(model.state.cart);
  assignProductPage();
  const signinButton = document.querySelector("#navbar-actions--signin");
  const signupButton = document.querySelector("#navbar-actions--signup");
  signinButton.remove();
  signupButton.remove();

  const userButton = document.createElement("a");
  userButton.href = "/profile";
  const markup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="var(--text-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="var(--text-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  userButton.insertAdjacentHTML("afterbegin", markup);
  document
    .querySelector("#navbar-actions")
    .insertAdjacentHTML("afterbegin", userButton.outerHTML);
});

function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  toggleButton.classList.toggle("dark");
  const icon = `${
    toggleButton.classList.contains("dark")
      ? `<svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 15C12.8333 15 13.5417 14.7083 14.125 14.125C14.7083 13.5417 15 12.8333 15 12C15 11.1667 14.7083 10.4583 14.125 9.875C13.5417 9.29167 12.8333 9 12 9C11.1667 9 10.4583 9.29167 9.875 9.875C9.29167 10.4583 9 11.1667 9 12C9 12.8333 9.29167 13.5417 9.875 14.125C10.4583 14.7083 11.1667 15 12 15ZM12 17C10.6167 17 9.4375 16.5125 8.4625 15.5375C7.4875 14.5625 7 13.3833 7 12C7 10.6167 7.4875 9.4375 8.4625 8.4625C9.4375 7.4875 10.6167 7 12 7C13.3833 7 14.5625 7.4875 15.5375 8.4625C16.5125 9.4375 17 10.6167 17 12C17 13.3833 16.5125 14.5625 15.5375 15.5375C14.5625 16.5125 13.3833 17 12 17ZM5 13H1V11H5V13ZM23 13H19V11H23V13ZM11 5V1H13V5H11ZM11 23V19H13V23H11ZM6.4 7.75L3.875 5.325L5.3 3.85L7.7 6.35L6.4 7.75ZM18.7 20.15L16.275 17.625L17.6 16.25L20.125 18.675L18.7 20.15ZM16.25 6.4L18.675 3.875L20.15 5.3L17.65 7.7L16.25 6.4ZM3.85 18.7L6.375 16.275L7.75 17.6L5.325 20.125L3.85 18.7Z"
          fill="#FEF7FF"
        />
      </svg>`
      : `<svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 21C9.5 21 7.375 20.125 5.625 18.375C3.875 16.625 3 14.5 3 12C3 9.5 3.875 7.375 5.625 5.625C7.375 3.875 9.5 3 12 3C12.2333 3 12.4625 3.00833 12.6875 3.025C12.9125 3.04167 13.1333 3.06667 13.35 3.1C12.6667 3.58333 12.1208 4.2125 11.7125 4.9875C11.3042 5.7625 11.1 6.6 11.1 7.5C11.1 9 11.625 10.275 12.675 11.325C13.725 12.375 15 12.9 16.5 12.9C17.4167 12.9 18.2583 12.6958 19.025 12.2875C19.7917 11.8792 20.4167 11.3333 20.9 10.65C20.9333 10.8667 20.9583 11.0875 20.975 11.3125C20.9917 11.5375 21 11.7667 21 12C21 14.5 20.125 16.625 18.375 18.375C16.625 20.125 14.5 21 12 21ZM12 19C13.4667 19 14.7833 18.5958 15.95 17.7875C17.1167 16.9792 17.9667 15.925 18.5 14.625C18.1667 14.7083 17.8333 14.775 17.5 14.825C17.1667 14.875 16.8333 14.9 16.5 14.9C14.45 14.9 12.7042 14.1792 11.2625 12.7375C9.82083 11.2958 9.1 9.55 9.1 7.5C9.1 7.16667 9.125 6.83333 9.175 6.5C9.225 6.16667 9.29167 5.83333 9.375 5.5C8.075 6.03333 7.02083 6.88333 6.2125 8.05C5.40417 9.21667 5 10.5333 5 12C5 13.9333 5.68333 15.5833 7.05 16.95C8.41667 18.3167 10.0667 19 12 19Z"
          fill="black"
        />
      </svg>`
  }`;
  toggleButton.innerHTML = "";
  toggleButton.insertAdjacentHTML("afterbegin", icon);
  setDarkModePreference(document.documentElement.classList.contains("dark"));
}
const toggleButton = document.getElementById("dark-mode-toggle");
toggleButton.addEventListener("click", toggleDarkMode);
