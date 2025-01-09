import View from "./View";

class SearchView extends View {
  #clearButton = document.querySelector(".search__clear");
  constructor() {
    super(document.querySelector(".search"));
  }
  getQuery() {
    const query = this.parentElement.querySelector(".search__input").value;
    return query;
  }
  #clearInut() {
    this.parentElement.querySelector(".search__input").value = "";
  }
  // addHandleShowResult(handler) {
  //   handler();
  //   this.#clearInut();
  // }
  addHandleSearch(handler) {
    this.parentElement.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
      this.#clearButton.classList.remove("hidden");
    });
  }
  addHandleRemoveSearch(handler) {
    this.parentElement.addEventListener("click", (e) => {
      const clearButton = e.target.closest(".search__clear");
      if (!clearButton) return;
      handler();
      this.#clearButton.classList.add("hidden");
      this.#clearInut();
    });
  }
}

export default new SearchView();
