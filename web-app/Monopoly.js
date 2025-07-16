/*jslint es6 */
import popup from './popup.js';
import R from './ramda.js';

/**
 * Monopoly game logic module.
 * Implements basic game mechanics such as moving player tokens,
 * checking for game end conditions, and determining if a player has won.
 * https://en.wikipedia.org/wiki/Monopoly_(game)
 * @namespace Monopoly
 * @author Lara Merican
 * @version 2025
 */
const Monopoly = Object.create(null);

/**
 * * UI functions for the Monopoly game.
 * These functions are used to update the game state in the UI,
 * such as updating the money display, moving player tokens on the board,
 * displaying property cards, and showing dice images.
 * @namespace ui
 * @property {function} updateMoneyDisplay - Updates the money display for a player.
 * @property {function} moveTokenOnBoard - Moves a player token on the board.
 * @property {function} displayPropertyCard - Displays a property card for a player.
 * @property {function} showDiceImage - Displays the dice image for a player.
 */
let ui = {
  updateMoneyDisplay: () => {},
  moveTokenOnBoard: () => {},
  displayPropertyCard: () => {},
  showDiceImage: () => {}
};

Monopoly.setUI = function (uiFunctions) {
  ui = { ...ui, ...uiFunctions };
};

/**
 * Represents the statistics of the Monopoly game.
 * Contains properties to track the game status, players, and properties.
 * @memberof Monopoly
 * @type {Object}
 * @property {boolean} gameOver - Indicates if the game is over.
 * @property {number} currentPlayerIndex - The index of the current player.
 * @property {Array} playerOrder - The order of players in the game.
 */
Monopoly.gameOver = false;
let currentPlayerIndex = 0; // Track the current player's index
let playerOrder = ["player1", "player2"];

/**
 * Represents the players in the game.
 * Each player has a unique ID, money, properties owned, position on the board,
 * and a flag indicating if they are in jail.
 * @memberof Monopoly
 * @type {Object}
 * @property {Object} players - An object containing player data.
 * @property {Object} properties - An object containing property data.
 * @property {Object} players.player1 - The first player.
 * @property {Object} players.player2 - The second player.
 * @property {number} players.player1.money - The amount of money the player has.
 * @property {Array} players.player1.properties - The properties owned by the player.
 * @property {number} players.player1.position - The current position of the player on the board.
 * @property {boolean} players.player1.inJail - Indicates if the player is in jail.
 * @property {number} players.player1.currentPlayerPosition - The current position of the player token.
 */
Monopoly.players = {
  player1: {
    money: 500,
    properties: [],
    position: 1,
    inJail: false,
    currentPlayerPosition: 0,
    jailAttempts: 0
  },
  player2: {
    money: 500,
    properties: [],
    position: 1,
    inJail: false,
    currentPlayerPosition: 0,
    jailAttempts: 0
  }
};

/**
 * Formats the player name for display.
 * Replaces "player" with "Player " in the player ID.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player to format.
 * @returns {string} The formatted player name.
 */
function formatPlayerName(playerId) {
    return playerId.replace("player", "Player ");
}

/**
 * Represents the properties on the Monopoly board.
 * Each property has a unique ID, name, price, owner, rent amount,
 * and colour.
 * @memberof Monopoly
 * @type {Object}
 * @property {Object} properties - An object containing property data.
 * @property {Object} price - The price of the property.
 * @property {Object} owner - The ID of the player who owns the property.
 * @property {Object} rent - The rent amount for the property.
 * @property {Object} colour - The colour of the property.
 */
Monopoly.properties = {
  1: { name: "GO", price: 0},
  2: { name: "Lara Land", price: 60, owner: null, rent: 20 },
  3: { name: "Sunny Square", price: 60, owner: null, rent: 20, colour: "brown"},
  4: { name: "Tinka Town", price: 60, owner: null, rent: 25, colour: "light blue" },
  5: { name: "Jingqi Junction", price: 60, owner: null, rent: 25, colour: "light blue" },
  6: { name: "JAIL"},
  7: { name: "Florence Falls", price: 100, owner: null, rent: 35, colour: "pink" },
  8: { name: "Amanda Academy", price: 100, owner: null, rent: 35, colour: "pink" },
  9: { name: "Ryaan Restaurant", price: 120, owner: null, rent: 45, colour: "orange" },
  10: { name: "Kiara Kingdom", price: 120, owner: null, rent: 45, colour: "orange" },
  11: { name: "FREE PARKING"},
  12: { name: "Alda Avenue", price: 140, owner: null, rent: 55, colour: "red" },
  13: { name: "Sydney Skyland", price: 140, owner: null, rent: 55, colour: "red" },
  14: { name: "Jessica Jetty", price: 160, owner: null, rent: 65, colour: "yellow" },
  15: { name: "Amelia Alley", price: 160, owner: null, rent: 65, colour: "yellow" },
  16: { name: "GO TO JAIL"},
  17: { name: "Vasco Village", price: 180, owner: null, rent: 75, colour: "green" },
  18: { name: "Devansh District", price: 180, owner: null, rent: 75, colour: "green" },
  19: { name: "Casper Cove", price: 200, owner: null, rent: 85, colour: "darkblue" },
  20: { name: "Gucci Gardens", price: 200, owner: null, rent: 85, colour: "darkblue" },
};

/**
 * Initialises the Monopoly game.
 * Sets up the initial state of the game, including player tokens and money.
 * @memberof Monopoly
 * @function
 * @returns {void}
 */
Monopoly.init = function () {
  Monopoly.movePlayer('player1', 0);
  Monopoly.movePlayer('player2', 0);
  Monopoly.updateMoney('player1', 0);
  Monopoly.updateMoney('player2', 0);
}

/**
 * Rolls the dice for the current player.
 * This function simulates a dice roll and returns a random number between 1 and 6.
 * @memberof Monopoly
 * @function
 * @returns {number} The result of the dice roll.
 */
Monopoly.rollDice = function () {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Starts the turn for the current player.
 * This function rolls the dice, moves the player token, and handles player actions.
 * It checks if the game is over and handles special cases like being in jail or passing GO.
 * @memberof Monopoly
 * @function
 * @returns {void}
 */
Monopoly.startTurn = async function () {
  if (Monopoly.gameOver) {
    await popup.infoPopup("The game is over. Please restart to play again.");
    return;
  }
  const playerId = playerOrder[currentPlayerIndex];
  const diceRoll = Monopoly.rollDice();

  ui.showDiceImage(diceRoll);

  if (Monopoly.players[playerId].inJail) {
    await Monopoly.playerInJail(playerId);
    return;
  }
  else {
    Monopoly.movePlayer(playerId, diceRoll);
    await Monopoly.playerAction(playerId);
  }
};

/**
 * Ends the turn for the current player.
 * This function updates the current player index to the next player in the order.
 * It wraps around to the first player after the last player.
 * @memberof Monopoly
 * @function
 * @returns {void}
 * @async
 * @description This function is called at the end of each player's turn to switch to the next
 */
Monopoly.endTurn = async function () {
  currentPlayerIndex = R.modulo(currentPlayerIndex + 1, playerOrder.length);
};

/**
 * Moves player token on the Monopoly board.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player token to move.
 * @param {number} steps The number of steps to move the player token.
 * @returns {void}
 */
Monopoly.movePlayer = function (playerId, steps) {
  const player = Monopoly.players[playerId];

  player.previousPosition = player.position;
  player.position = ((player.position + steps - 1) % 20) + 1;

  ui.moveTokenOnBoard(playerId, player.position);
};

/**
 * Handles player actions based on their current position.
 * This includes passing GO, going to jail, or landing on a property.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player taking the action.
 * @returns {void}
 */
Monopoly.playerAction = async function (playerId) {
  const player = Monopoly.players[playerId];
  const pos = player.position;
  const prev = player.previousPosition;

  if (pos === 1) {
    Monopoly.passGo(playerId);
  } else if (player.inJail) {
    Monopoly.playerInJail(playerId);
  } else if (prev > pos && (pos !== 6 && !player.inJail)) {
    await Monopoly.passGo(playerId);
    await Monopoly.landedOnProperty(playerId);
  } else if (pos === 6) {
    await popup.infoPopup(`${formatPlayerName(playerId)} is visiting jail. It is now the next player's turn.`);
  } else if (pos === 11) {
    await popup.infoPopup(`${formatPlayerName(playerId)} gets free parking! It is now the next player's turn.`);
  } else if (pos === 16) {
    await Monopoly.goToJail(playerId);
  } else {
    await Monopoly.landedOnProperty(playerId);
  }
  await Monopoly.endTurn();
};

/**
 * Passes GO and collects Ł200.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player passing GO.
 * @returns {void}
 */
Monopoly.passGo = async function (playerId) {
    Monopoly.updateMoney(playerId, 200);
    await popup.infoPopup(`${formatPlayerName(playerId)} collects Ł200 for passing GO!`);
}

/**
 * Moves the player to jail.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player going to jail.
 * @returns {void}
*/
Monopoly.goToJail = async function (playerId) {
  const player = Monopoly.players[playerId];
  player.inJail = true;
  player.position = 6;
  await popup.infoPopup(`${formatPlayerName(playerId)} goes to jail!`);

  ui.moveTokenOnBoard(playerId, 6);
};

/**
 * Handles the case when a player is in jail.
 * The player can choose to pay a fine to get out of jail,
 * roll a 5 to get out, or stay in jail for up to 3 turns.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player who is in jail.
 * @returns {void}
 */
Monopoly.playerInJail = async function (playerId) {
  const player = Monopoly.players[playerId];

  const payFine = await popup.decisionPopup(`You are in jail, ${formatPlayerName(playerId)}. Do you want to pay Ł50 to get out?`);

  if (payFine) {
    Monopoly.updateMoney(playerId, -50);
    player.inJail = false;
    player.jailAttempts = 0;
    await Monopoly.endTurn();
  } else {
    await popup.infoPopup(`${formatPlayerName(playerId)} must roll a 5 to get out of jail!`);
    const diceRoll = Monopoly.rollDice();

    if (diceRoll === 5) {
      player.inJail = false;
      Monopoly.movePlayer(playerId, 5);
      player.jailAttempts = 0;
      await popup.infoPopup(`${formatPlayerName(playerId)} rolled a 5 and is out of jail!`);
      await Monopoly.endTurn();
    } else {
      player.jailAttempts++;

      if (player.jailAttempts >= 3) {
        player.inJail = false;
        player.jailAttempts = 0;
        await popup.infoPopup(`${formatPlayerName(playerId)} has been in jail for 3 turns and is now free without paying the fine!`);
      } else {
        await popup.infoPopup(`${formatPlayerName(playerId)} rolled a ${diceRoll}. Try again next turn.`);
        await Monopoly.endTurn();
      }
    }
  }
};

/**
 * Player lands on a property and decides to buy it, pay rent or skip turn.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player who landed on the property.
 * @param {string} propertyId The ID of the property landed on.
 * @returns {void}
 */
Monopoly.landedOnProperty = async function (playerId) {
  const player = Monopoly.players[playerId];
  const property = Monopoly.properties[player.position];

  if (property.owner && property.owner !== playerId) {
    Monopoly.payRent(playerId);
  } else if (property.owner === playerId) {
    await popup.infoPopup(`${formatPlayerName(playerId)} already owns ${property.name}.`);
  } else if (player.money < property.price) {
    await popup.infoPopup(`${formatPlayerName(playerId)} does not have enough money to buy ${property.name}.`);
  } else if (!property.owner && property.price) {
    const wantsToBuy = await popup.decisionPopup(`Do you want to buy ${property.name} for Ł${property.price}?`);
    if (wantsToBuy) {
      Monopoly.buyProperty(playerId);
    }
  }
};

/**
 * Buys a property for the player.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player buying the property.
 * @param {string} propertyId The ID of the property to buy.
 * @returns {void}
 */
Monopoly.buyProperty = function (playerId) {
  const player = Monopoly.players[playerId];
  const property = Monopoly.properties[player.position];

  Monopoly.updateMoney(playerId, -property.price);
  property.owner = playerId;
  Monopoly.displayPropertyCard(playerId);
};

/**
 * Updates the money of a player.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player whose money is to be updated.
 * @param {number} amount The amount to add or subtract from the player's money.
 * @returns {void}
 */
Monopoly.updateMoney = async function (playerId, amount) {
  const player = Monopoly.players[playerId];
  player.money += amount;

  await Monopoly.is_won();
  ui.updateMoneyDisplay(playerId, player.money);
}

/**
 * Displays a property card for a player.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player to display the property card for.
 * @param {Object} property The property object containing details like id, name, etc.
 * @returns {void}
 */

Monopoly.displayPropertyCard = function (playerId) {
  ui.displayPropertyCard(playerId, Monopoly.players[playerId].position);
};

/**
 * Handles rent payment when a player lands on a property owned by another player.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player who landed on the property.
 * @returns {void}
 */
Monopoly.payRent = async function (playerId) {
  const player = Monopoly.players[playerId];
  const property = Monopoly.properties[player.position];
  let rent = property.rent;

  if (property.colour && Monopoly.ownsFullSet(property.owner, property.colour)) {
    rent *= 2;
  }
  await popup.infoPopup(`${formatPlayerName(playerId)} landed on ${property.name} and pays Ł${rent} to ${formatPlayerName(property.owner)}`);
  Monopoly.is_won();
  Monopoly.updateMoney(playerId, -rent);
  Monopoly.updateMoney(property.owner, rent);
};

/**
 * Checks if a player owns a full set of properties of a specific colour.
 * A player owns a full set if they own all properties of that colour.
 * @memberof Monopoly
 * @function
 * @param {string} playerId The ID of the player to check.
 * @param {string} colour The colour of the properties to check.
 * @returns {boolean} Whether the player owns a full set of properties of the specified colour.
 */
Monopoly.ownsFullSet = function (playerId, colour) {
  const propertiesOfColour = Object.values(Monopoly.properties)
    .filter(p => p.colour === colour);

  return propertiesOfColour.length > 0 &&
         propertiesOfColour.every(p => p.owner === playerId);
};

/**
 * Returns if the board is in a winning state for any player.
 * A board is won for a player if the other player is out of money.
 * @memberof Monopoly
 * @function
 * @param {Array} players An array of player objects.
 * @returns {boolean} Whether the board is in a winning state.
 */
Monopoly.is_won = async function () {
  const players = Monopoly.players;
  const loser = R.find(([_, player]) => player.money <= 0, R.toPairs(players));
  if (loser) {
    const winnerId = Object.keys(players).find(id => id !== loser[0]);
    await popup.infoPopup(`${winnerId} has won the game!`);
    Monopoly.gameOver = true;
    return true;
  }
  return false;
};

export default Monopoly;