/**
 * Reusable function to display a message on the screen
 * @param {String} message - message to be displayed
 * @param {Number} type - 1 for error, 0 for success, 2 for info
 * @param {Number} time - default is 3 seconds
 * @returns {void}
 * @author Mohamed Mouloudj
 */
function showMessage(message, type, time = 3) {
  const range = document.createRange();
  const checkSVG = range.createContextualFragment(checkSVGMarkup);
  const errorSVG = range.createContextualFragment(errorSVGMarkup);
  const infoSVG = range.createContextualFragment(infoSVGMarkup);
  const messageContainer = document.createElement("div");
  messageContainer.className = `fixed top-5 inset-x-0 z-[1000000] flex justify-center items-center`;
  const messageElement = document.createElement("p");
  messageElement.className = `flex gap-4 ${
    type === 1
      ? "text-accent-500"
      : type === 0
      ? "text-lime-500"
      : "text-cyan-400"
  }
   bg-neutral-100 text-sm text-center p-3 duration-300 rounded-lg w-fit`;
  messageElement.textContent = message;
  switch (type) {
    case 1:
      messageElement.prepend(errorSVG);
      break;
    case 0:
      messageElement.prepend(checkSVG);
      break;
    case 2:
      messageElement.prepend(infoSVG);
      break;
    default:
      break;
  }
  messageContainer.appendChild(messageElement);
  document.body.appendChild(messageContainer);

  setTimeout(() => {
    messageElement.style.transform = "scale(0)";
    setTimeout(() => {
      messageContainer.remove();
    }, 300);
  }, time * 1000);
}
const checkSVGMarkup = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_3426_23)">
    <path d="M18.3334 9.2333V9.99997C18.3323 11.797 17.7504 13.5455 16.6745 14.9848C15.5985 16.4241 14.0861 17.477 12.3628 17.9866C10.6395 18.4961 8.79774 18.4349 7.11208 17.8121C5.42642 17.1894 3.98723 16.0384 3.00915 14.5309C2.03108 13.0233 1.56651 11.24 1.68475 9.4469C1.80299 7.65377 2.49769 5.94691 3.66525 4.58086C4.83281 3.21482 6.41068 2.26279 8.16351 1.86676C9.91635 1.47073 11.7502 1.65192 13.3917 2.3833M18.3334 3.3333L10 11.675L7.50002 9.17497" stroke="#84cc16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
    <clipPath id="clip0_3426_23">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
  </svg>`;
const errorSVGMarkup = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6583 8.34172L12.3583 7.64172" stroke="#f56565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.64166 12.3583L9.93333 10.0667" stroke="#f56565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.3583 12.3584L7.64166 7.64172" stroke="#f56565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3.33335 4.99996C2.29169 6.39163 1.66669 8.12496 1.66669 9.99996C1.66669 14.6 5.40002 18.3333 10 18.3333C14.6 18.3333 18.3334 14.6 18.3334 9.99996C18.3334 5.39996 14.6 1.66663 10 1.66663C8.80835 1.66663 7.66669 1.91663 6.64169 2.37496" stroke="#f56565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
const infoSVGMarkup = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 6.66663V10.8333" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3.33335 4.99996C2.29169 6.39163 1.66669 8.12496 1.66669 9.99996C1.66669 14.6 5.40002 18.3333 10 18.3333C14.6 18.3333 18.3334 14.6 18.3334 9.99996C18.3334 5.39996 14.6 1.66663 10 1.66663C8.80835 1.66663 7.66669 1.91663 6.64169 2.37496" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.99542 13.3334H10.0029" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export default showMessage;
