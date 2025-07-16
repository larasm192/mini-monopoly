/*jslint es6 */

/**
 * Popup module for displaying decision and information popups.
 * This module provides functions to show popups with "Yes" and "No" buttons for
 * decisions, and a simple information popup with a close button.
 * @namespace popup
 * @author Lara Merican
 * @version 2025
 */
const popup = {};

/**
 * Delays execution for a specified number of milliseconds.
 * This is used to ensure that the popup is displayed after a short delay.
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise} A promise that resolves after the specified delay.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handles keyboard navigation for button groups.
 * Arrow keys switch focus between buttons, Enter triggers click.
 * @param {HTMLElement[]} buttons - Array of buttons to navigate.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function keyboardNavigation(buttons, event) {
  const key = event.key;

  if (key === "ArrowLeft") {
    event.preventDefault();
    buttons[0].focus();
  } else if (key === "ArrowRight") {
    event.preventDefault();
    buttons[1].focus();
  } else if (key === "Enter" || key === " ") {
    event.preventDefault();
    if (document.activeElement) {
      document.activeElement.click();
    }
  }
}


/**
 * Displays a decision popup with "Yes" and "No" buttons.
 * The popup will be hidden after a decision is made.
 * @param {*} message
 * @returns {Promise<boolean>} A promise that resolves to true if "Yes" is clicked, false if "No" is clicked.
 */
popup.decisionPopup = async function (message) {
  await delay(500);

  return new Promise((resolve) => {
    const popupEl = document.getElementById("popup");
    const messageElement = document.getElementById("popup-message");
    const yesBtn = document.getElementById("popup-yes");
    const noBtn = document.getElementById("popup-no");
    const closeBtn = document.getElementById("popup-close");

    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";
    closeBtn.style.display = "none";

    messageElement.textContent = message;
    popupEl.classList.remove("hidden");

    noBtn.focus();
    const buttons = [yesBtn, noBtn];
    const onKeyDown = (event) => keyboardNavigation(buttons, event);
    yesBtn.addEventListener("keydown", onKeyDown);
    noBtn.addEventListener("keydown", onKeyDown);


    const cleanup = () => {
      popupEl.classList.add("hidden");
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("click", onNo);
      yesBtn.removeEventListener("keydown", onKeyDown);
      noBtn.removeEventListener("keydown", onKeyDown);
    };

    const onYes = () => {
      cleanup();
      resolve(true);
    };

    const onNo = () => {
      cleanup();
      resolve(false);
    };

    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}

/**
 * Displays an information popup with a message and a close button.
 * The popup will be hidden after the close button is clicked.
 * @param {string} message - The message to display in the popup.
 * @returns {Promise<void>} A promise that resolves when the popup is closed.
 */
popup.infoPopup = async function (message) {
  await delay(500);

  return new Promise((resolve) => {
    const popupEl = document.getElementById("popup");
    const messageElement = document.getElementById("popup-message");
    const yesBtn = document.getElementById("popup-yes");
    const noBtn = document.getElementById("popup-no");
    const closeBtn = document.getElementById("popup-close");

    messageElement.textContent = message;
    popupEl.classList.remove("hidden");

    yesBtn.style.display = "none";
    noBtn.style.display = "none";
    closeBtn.style.display = "inline-block";

    closeBtn.focus();
    const buttons = [closeBtn];
    const onKeyDown = (event) => keyboardNavigation(buttons, event);
    closeBtn.addEventListener("keydown", onKeyDown);

    const cleanup = () => {
      popupEl.classList.add("hidden");
      closeBtn.removeEventListener("click", onClose);
      closeBtn.removeEventListener("keydown", onKeyDown);
    };

    const onClose = () => {
      cleanup();
      resolve();
    };

    closeBtn.addEventListener("click", onClose);
  });
}

export default popup;
