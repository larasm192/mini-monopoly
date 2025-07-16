/*jslint es6 */
import Monopoly from "./Monopoly.js";

document.addEventListener("DOMContentLoaded", function () {

    Monopoly.setUI({
        updateMoneyDisplay: function (playerId, money) {
            const display = document.getElementById(playerId + "_money");
            if (display) {
                display.textContent = "Ł" + money;
            }
        },
        moveTokenOnBoard: function (playerId, position) {
          const token = document.getElementById(playerId);
          const square = document.querySelector('[square="' + position + '"]');
          const tokenContainer = square?.querySelector('.player-tokens');

          if (square && token && tokenContainer) {
              token.className = "player-piece-container";

              const side = square.classList.contains("top")    ? "top" :
                          square.classList.contains("bottom") ? "bottom" :
                          square.classList.contains("left")   ? "left" :
                          square.classList.contains("right")  ? "right" :
                          square.classList.contains("corner") ? "corner" : "";

              if (
                  position === 6 &&
                  Monopoly.players[playerId] &&
                  Monopoly.players[playerId].inJail === true
              ) {
                  token.classList.add(`${playerId}-injail`);
              } else if (position === 6) {
                  token.classList.add(`${playerId}-visitingjail`);
              } else if (side) {
                  token.classList.add(`${playerId}-${side}`);
              }

              tokenContainer.appendChild(token);
          }
      },
        displayPropertyCard: function (playerId, position) {
            const container = document.getElementById(playerId + "_properties");
            const img = document.createElement("img");
            img.src = "./assets/property-card-" + position + ".svg";
            img.classList.add("property-image");
            container.appendChild(img);
        },
        showDiceImage: function (roll) {
            const diceImage = document.getElementById("dice-image");
            if (diceImage) {
                diceImage.src = "./assets/dice-" + roll + ".png";
            }
        }
    });

    Monopoly.init();

    const rollButton = document.getElementById("roll-button");
    rollButton.addEventListener("click", function () {
        Monopoly.startTurn();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "r" || event.key === "R") {
            rollButton.click();
        }
    });
});
