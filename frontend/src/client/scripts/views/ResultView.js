import previewView from "./PreviewView";
import View from "./View";

class ResultView extends View {
  constructor() {
    super(document.querySelector(".products__view"));
    this.viewMode = "list";
  }

  _generateMarkup() {
    const dataToLoop = this._data.products ?? this._data.result ?? this._data;
    return dataToLoop
      .map((product) =>
        previewView.render({ product, cart: this._data.cart }, true)
      )
      .map((previewProduct) => {
        const range = document.createRange();
        const previewProsuctElement =
          range.createContextualFragment(previewProduct);
        if (this.viewMode === "grid") {
          previewProsuctElement.firstElementChild.classList.add(
            "preview__product--list"
          );
          previewProduct = previewProsuctElement.firstElementChild.outerHTML;
        }
        return previewProduct;
      })
      .join("");
  }

  handleViewMode() {
    document
      .querySelector(".options__view-types")
      .addEventListener("click", () => {
        if (this.viewMode === "list") {
          this.viewMode = "grid";
        } else {
          this.viewMode = "list";
        }
        const mainContainer = document.querySelector(".products__view");
        mainContainer.classList.toggle("products__view--list");
        const previewElements = document.querySelectorAll(".preview__product");
        previewElements.forEach((element) => {
          element.classList.toggle("preview__product--list");
        });
      });
  }
}

export default new ResultView();
