import View from "./View";

class ProductView extends View {
  isProductOpen;
  constructor() {
    super(document.querySelector("body"));
    this.currentSlide = 0;
  }

  controlProduct(controlAddToCart) {
    document.querySelector(".product__close").addEventListener("click", () => {
      this.isProductOpen = false;
      window.location.href = "";
    });
    document
      .querySelector(".product-button ")
      .addEventListener("click", () => controlAddToCart(this._data.id));
    this._handleSlideLeftChange();
    this._handleSlideRightChange();
    this._handleSlideKeyChange();
    this._addDots();
    this._activeDot();
  }
  _moveToSlide(toSlide) {
    document.querySelectorAll(".slide").forEach((slide, i) => {
      slide.style.transform = `translateX(${100 * (i - toSlide)}%)`;
    });
    this.currentSlide = toSlide;
    this._activeDot();
  }
  _moveSlideRight() {
    this.currentSlide++;
    if (this.currentSlide === this._data.images.length) {
      this.currentSlide = 0;
    }
    this._moveToSlide(this.currentSlide);
  }
  _moveSlideLeft() {
    this.currentSlide--;
    if (this.currentSlide < 0) {
      this.currentSlide = this._data.images.length - 1;
    }
    this._moveToSlide(this.currentSlide);
  }
  _handleSlideKeyChange() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this._moveSlideLeft();
      if (e.key === "ArrowRight") this._moveSlideRight();
    });
  }
  _handleSlideLeftChange() {
    document
      .querySelector(".slider__btn--left")
      ?.addEventListener("click", this._moveSlideLeft.bind(this));
  }
  _handleSlideRightChange() {
    document
      .querySelector(".slider__btn--right")
      ?.addEventListener("click", this._moveSlideRight.bind(this));
  }

  _addDots() {
    const dotsContainer = document.querySelector(".dots");
    this._data.images.forEach((_, i) => {
      dotsContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
    dotsContainer.addEventListener("click", (e) => {
      if (!e.target.classList.contains("dots__dot")) return;
      this._moveToSlide(+e.target.dataset.slide);
      this._activeDot();
    });
  }
  _activeDot() {
    document.querySelectorAll(".dots__dot").forEach((dot) => {
      dot.classList.remove("dots__dot--active");
    });
    document
      .querySelector(`.dots__dot[data-slide="${this.currentSlide}"]`)
      .classList.add("dots__dot--active");
  }
  _generateMarkup() {
    return `
        <main class="product__container">
          <div class="product__close">
            &times;
          </div>
          <div class="product__main">
            <div class="product__images-slider">
              ${this._data.images
                .map(
                  (img, i) =>
                    `<div class="slide" style="transform:translateX(${
                      100 * i
                    }%);"><img src="${img}" alt=${this._data.title} /></div>`
                )
                .join("")}
                ${
                  this._data.images?.length > 1
                    ? `<button class="slider__btn slider__btn--left">&#10094;</button>
                  <button class="slider__btn slider__btn--right">&#10095;</button>
                  <div class="dots"></div> `
                    : ""
                }
            </div>
            <div class="product__main-description">
              <h1>${this._data.name}</h1>
              <div class="product__details">
                <p>${this._data.description}</p>
                <div class="product__details-item">
                  <h4>Category</h4>
                  <p>${this._data.category}</p>
                </div>
                <div class="product__details-item">
                  <h4>Brand</h4>
                  <p>${this._data.brand}</p>
                </div>
                ${
                  this._data.weight
                    ? `<div class="product__details-item">
                    <h4>Weight</h4>
                    <p>${this._data.weight} g</p>
                  </div>`
                    : ""
                }
                ${
                  this._data.dimensions
                    ? `<div class="product__details-item dimensions">
                  <h4>Dimensions</h4>
                  <table>
                    <tr>
                      <th>length</th>
                      <td>${this._data.dimensions.length}</td>
                    </tr>
                    <tr>
                      <th>Width</th>
                      <td>${this._data.dimensions.width}</td>
                    </tr>
                    <tr>
                      <th>Height</th>
                      <td>${this._data.dimensions.height}</td>
                    </tr>
                  </table>
                </div>`
                    : ""
                }
              </div>
              <div class="product__actions-price">
              <div class="product__price-container">
                ${
                  this._data.discount
                    ? `<span style="text-decoration: line-through; opacity: 0.6;font-size:1.3rem">
                    ${this._data.price} $
                  </span>
                  <span style="opacity: 0.6;font-size:1.3rem">-${this._data.discount}%</span>`
                    : ""
                }
                <span>${Math.ceil(
                  this._data.price -
                    (this._data.price *
                      (this._data.discount ? this._data.discount : 1)) /
                      100
                )} $</span>
              </div>
              <div class="product__main-action">
                <button class="add-to-cart product-button ${
                  this._data.stock <= 0 ? "disabled" : ""
                }"
                 ${
                   this._data.stock <= 0 ? "disabled title='Out of stock'" : ""
                 }>
                 Add to cart
                 </button>
              </div>
            </div>
            </div>
          </div>
        </main>
        `;
  }
  addHandleRender(handler) {
    Array.of("hashchange", "load").forEach((ev) => {
      window.addEventListener(ev, handler);
    });
  }
}
export default new ProductView();
