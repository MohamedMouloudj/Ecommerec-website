import View from "./View";

class PrevieView extends View {
  _parentElement = "";
  _generateMarkup() {
    const discount = +this._data.product.discount ?? 1;
    return `
      <li class="preview__product" data-href="${this._data.product.id}">
        <div class="preview__main">
          <img src="${this._data.product.thumbnail}" alt="${
      this._data.product.name
    }" />
          <h4>${this._data.product.name}</h4>
        </div>
        <div class="preview__details">
          <div class="preview__description">
            <p>${this._data.product.description}</p>
          </div>
          <div class="preview__action">
            <div class="priview__price-container">
            ${
              this._data.product.discount
                ? `<h4 style="text-decoration: line-through; opacity: 0.6;font-size:1rem">
                  ${this._data.product.price} $
                </h4>`
                : ""
            }
            <h4>${Math.ceil(
              this._data.product.price -
                (+this._data.product.price * discount) / 100
            )} $</h4>
            </div>
            ${
              this._data.cart.some(
                (product) => product.id === this._data.product.id
              )
                ? `<button class="remove-from-cart" data-id="${this._data.product.id}">Remove from cart</button>`
                : `<button class="add-to-cart" data-id="${this._data.product.id}">Add to cart</button>`
            }
          </div>
        </div>
      </li>
    `;
  }
  addHandleRemoveFromCart(handler) {
    document
      .querySelector(".remove-from-cart")
      .addEventListener("click", function (e) {
        handler();
      });
  }
}

export default new PrevieView();
