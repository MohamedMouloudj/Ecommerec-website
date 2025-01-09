import View from "./View";

class CartView extends View {
  #buttonOpen;
  #buttonClose;
  #blockRequest;
  #total;
  constructor() {
    super(document.querySelector(".cart__items"));
    this.#buttonOpen = document.querySelector(".cart__button--open");
    this.#buttonClose = document.querySelector(".cart__button--close");
    this._toggleOpenCart();
    this.addHandleRemoveFromCart = this.addHandleRemoveFromCart.bind(this);
    this.addHandleQuantityChange = this.addHandleQuantityChange.bind(this);
    this.#blockRequest = false;
    this.#total = 0;
  }
  _toggleOpenCart() {
    this.#buttonOpen.addEventListener("click", () => {
      this.parentElement.closest(".cart").classList.toggle("hidden");
      document.body.classList.toggle("no-scroll");
    });
    this.#buttonClose.addEventListener("click", () => {
      this.parentElement.closest(".cart").classList.toggle("hidden");
      document.body.classList.toggle("no-scroll");
    });
  }
  _generateMarkup() {
    return this._data
      .map(
        (addedProduct) => `
            <li class="flex justify-between px-4 py-3 flex-row text-xl cursor-pointer bg-neutral-100 dark:bg-neutral-300 rounded-lg  dark:text-black hover:bg-neutral-200 dark:hover:bg-neutral-100 duration-200" data-href="${
              addedProduct.product.id
            }">
              <div class="w-40">
                <img src="${addedProduct.product.thumbnail}" alt="${
          addedProduct.product.name
        }" />
              </div>
              <div class="flex-1 flex flex-col justify-between">
                  <div class="flex items-center justify-between flex-1">
                    <h4 class="text-[1.7rem] font-bold text-inherit inline">${
                      addedProduct.product.name
                    }</h4>
                    <div class="flex gap-2">
                      ${
                        addedProduct.product.discount
                          ? `<span class="line-through opacity-60 text-base italic">
                        ${addedProduct.product.price} $
                        </span>`
                          : ""
                      }
                      <span class="italic">${Math.ceil(
                        addedProduct.product.price -
                          (addedProduct.product.price *
                            addedProduct.product.discount) /
                            100
                      )} $</span>
                    </div>
                  </div>
                  <div class="flex flex-col justify-end">
                    <div class="flex flex-row-reverse items-center gap-2">
                      <button 
                      class="bg-accent-700 hover:bg-accent-600 p-2 rounded-lg text-white dark:text-black text-base cart__button--remove-from-cart" 
                      data-id="${addedProduct.product.id}">Remove</button>
                      <div class="flex gap-2">
                      <button 
                      class="border-2 border-primary-900 hover:border-primary-400 hover:text-primary-400 w-6 h-6 rounded-full flex justify-center items-center text-primary-900 ${
                        addedProduct.product.stock === addedProduct.quantity
                          ? `border-neutral-500 hover:border-neutral-500 text-neutral-500 cursor-not-allowed hover:text-neutral-500`
                          : ``
                      }cart__button--increment" 
                      data-id="${addedProduct.product.id}">+</button>
                      <span class="italic">Quantity:</span> <span class="cart__item-quantity">${
                        addedProduct.product.quantity
                      }</span>
                      <button class="border-2 border-primary-900 hover:border-primary-400  hover:text-primary-400 w-6 h-6 rounded-full flex justify-center items-center text-primary-900 cart__button--decrement" data-id="${
                        addedProduct.product.id
                      }">-</button>
                      </div>
                    </div>
                  </div>
            </li>
          `
      )
      .join("");
  }
  addHandleRemoveFromCart(handler) {
    this.parentElement.addEventListener(
      "click",
      function (e) {
        const button = e.target.closest(".cart__button--remove-from-cart");
        if (!button) return;
        handler(button.dataset.id);
      }.bind(this)
    );
  }
  addHandleQuantityChange(handler) {
    this.parentElement.addEventListener(
      "click",
      function (e) {
        if (this.#blockRequest) return;
        const buttonIncrement = e.target.closest(".cart__button--increment");
        const buttonDecrement = e.target.closest(".cart__button--decrement");
        if (!buttonIncrement && !buttonDecrement) return;
        this.#blockRequest = true;
        setTimeout(() => {
          this.#blockRequest = false;
        }, 2000);
        handler(
          buttonIncrement
            ? buttonIncrement.dataset.id
            : buttonDecrement.dataset.id,
          buttonIncrement ? "increment" : "decrement"
        );
      }.bind(this)
    );
  }
  calculateTotal(freshData) {
    if (freshData) {
      this._data = freshData;
    }
    this.#total = this._data.reduce((acc, curr) => {
      return (
        acc +
        +curr.product.price *
          (1 - curr.product.discount / 100) *
          curr.product.quantity
      );
    }, 0);
    this.#total = this.#total.toFixed(2);
    document.querySelector(".cart__total--price").textContent = this.#total;
  }
}
export default new CartView();
