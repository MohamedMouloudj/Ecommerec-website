import View from "./View";

class FiltersView extends View {
  #categoriesElement = document.getElementById("category");
  constructor() {
    super(document.querySelector(".options__filters--container"));
    this.#categoriesElement.insertAdjacentHTML(
      "beforeend",
      `<option value="all">All</option>`
    );
    document.querySelectorAll('input[type="number"]').forEach((input) => {
      input.addEventListener("input", () => {
        if (input.value < 0) {
          input.value = 0;
        }
      });
    });
  }

  initCategories(handler) {
    handler()?.forEach((category) => {
      this.#categoriesElement.insertAdjacentHTML(
        "beforeend",
        `<option value="${category}">${category}</option>`
      );
    });
  }

  addHandleFilters(handler) {
    this.parentElement.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
    });
  }
  addHandleClearFilters(handler) {
    this.parentElement.addEventListener("click", (e) => {
      const clearButton = e.target.closest(".fliters__clear");
      if (!clearButton) return;
      handler();
    });
  }
}

export default new FiltersView();
