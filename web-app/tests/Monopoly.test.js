/*jslint es6 */
import Monopoly from "../Monopoly.js";
import popup from "../popup.js";

popup.decisionPopup = () => Promise.resolve(true);
popup.infoPopup = () => Promise.resolve();

describe("Game Initialisation Logic", function () {
    it("Player starts with 500 money", function () {
        var player = Monopoly.players.player1;
        if (player.money !== 500) {
            throw new Error("Expected: 500, Actual: " + player.money);
        }
    });
    it("Player starts with no properties", function () {
        var player = Monopoly.players.player1;
        if (player.properties.length !== 0) {
            throw new Error("Expected: 0 properties, Actual: " + player.properties.length);
        }
    });
    it("Player starts at position 1", function () {
        var player = Monopoly.players.player1;
        if (player.position !== 1) {
            throw new Error("Expected: 1, Actual: " + player.position);
        }
    });
    it("Player is not in jail", function () {
        var player = Monopoly.players.player1;
        if (player.inJail) {
            throw new Error("Expected: false, Actual: " + player.inJail);
        }
    });
});

describe("Player Movement", function () {
  beforeEach(function () {
    Monopoly.players = {
      player1: { money: 1500, properties: [], position: 0, inJail: false, currentPlayerPosition: 0 }
    };
  });

  it("Moves the player forward by X steps", function () {
    Monopoly.players.player1.position = 0;
    Monopoly.movePlayer("player1", 3);

    const newPosition = Monopoly.players.player1.position;
    if (newPosition !== 3) {
      throw new Error(`Expected position: 3, Actual position: ${newPosition}`);
    }
  });

  it("Wraps around board when moving past the last tile", function () {
    Monopoly.players.player1.position = 18;
    Monopoly.movePlayer("player1", 4);

    const newPosition = Monopoly.players.player1.position;
    if (newPosition !== 2) {
      throw new Error(`Expected position: 2 (wrapped), Actual position: ${newPosition}`);
    }
  });
});

describe("Money Updates", function () {
  beforeEach(function () {
    Monopoly.players = {
      player1: { money: 1500, properties: [], position: 0, inJail: false }
    };
  });

  it("Adds money correctly", function () {
    Monopoly.updateMoney("player1", 200);
    const updated = Monopoly.players.player1.money;

    if (updated !== 1700) {
      throw new Error(`Expected money: 1700, Actual money: ${updated}`);
    }
  });

  it("Subtracts money correctly", function () {
    Monopoly.updateMoney("player1", -300);
    const updated = Monopoly.players.player1.money;

    if (updated !== 1200) {
      throw new Error(`Expected money: 1200, Actual money: ${updated}`);
    }
  });
});

describe("Property Purchase", function () {
  beforeEach(function () {
    Monopoly.players = {
      player1: { money: 1500, properties: [], position: 2, inJail: false }
    };

    Monopoly.properties = {
      2: { name: "Lara Land", price: 200, owner: null, rent: 20 }
    };
  });

  it("Changes property owner", function () {
    Monopoly.buyProperty("player1");

    const property = Monopoly.properties[2];
    const player = Monopoly.players.player1;

    if (property.owner !== "player1") {
      throw new Error("Expected property owner: player1");
    }
  });

  it("Deducts money from player", function () {
    Monopoly.buyProperty("player1");
    const player = Monopoly.players.player1;

    if (player.money !== 1300) {
      throw new Error(`Expected: 1300, Actual: ${player.money}`);
    }
  });

  it("Does not allow player to buy property with insufficient money", async function () {
    Monopoly.players.player1.money = 50; // less than any property's price
    Monopoly.players.player1.position = 2; // Lara Land (price 60)
    Monopoly.properties[2].owner = null;
    await Monopoly.landedOnProperty("player1");

    // Check player money is unchanged (still 50)
    if (Monopoly.players.player1.money !== 50) {
      throw new Error(
        `Player money changed despite insufficient funds: ${Monopoly.players.player1.money}`
      );
    }

    // Property owner should still be null
    if (Monopoly.properties[2].owner !== null) {
      throw new Error(
        `Property was bought despite insufficient funds, owner: ${Monopoly.properties[2].owner}`
      );
    }
  });
});


describe("Rent Payment", function () {
  beforeEach(function () {

    Monopoly.players = {
      player1: { money: 1000, position: 2, inJail: false },
      player2: { money: 1000, inJail: false },
    };

    Monopoly.properties = {
      2: { name: "Lara Land", price: 200, rent: 50, owner: "player2" },
    };
  });

  it("Pays rent to property owner", async function () {
    await Monopoly.payRent("player1");

    const payer = Monopoly.players.player1.money;
    const receiver = Monopoly.players.player2.money;

    if (payer !== 950) throw new Error(`Expected: 950, Actual: ${payer}`);
    if (receiver !== 1050) throw new Error(`Expected: 1050, Actual: ${receiver}`);
  });

  it("Pays double rent when owner owns all properties in the set", async function () {
  Monopoly.players = {
    tenant: { money: 1000, position: 2, inJail: false },
    owner: { money: 1000, position: 0, inJail: false },
  };

  Monopoly.properties = {
    2: { name: "Lara Land", price: 60, owner: "owner", rent: 20, colour: "brown"},
    3: { name: "Sunny Square", price: 60, owner: "owner", rent: 20, colour: "brown"},
  };

  Monopoly.players.tenant.position = 2;

  await Monopoly.payRent("tenant");

  const tenantMoney = Monopoly.players.tenant.money;
  const ownerMoney = Monopoly.players.owner.money;

  if (tenantMoney !== 960) {
    throw new Error(`Expected tenant money to be 960 but was ${tenantMoney}`);
  }
  if (ownerMoney !== 1040) {
    throw new Error(`Expected owner money to be 1040 but was ${ownerMoney}`);
  }
});
});

describe("Jail Logic", function () {
  let originalDecisionPopup;
  let originalInfoPopup;

  before(function () {
    originalDecisionPopup = popup.decisionPopup;
    originalInfoPopup = popup.infoPopup;
  });

  beforeEach(function () {
    Monopoly.players = {
      player1: { money: 1500, position: 6, inJail: false, jailAttempts: 0 },
    };

    popup.decisionPopup = () => Promise.resolve(false);
    popup.infoPopup = () => Promise.resolve();
  });

  after(function () {
    popup.decisionPopup = originalDecisionPopup;
    popup.infoPopup = originalInfoPopup;
  });

  it("Should put player in jail and update position", async function () {
    await Monopoly.goToJail("player1");

    const player = Monopoly.players.player1;
    if (!player.inJail) throw new Error("Player should be in jail");
    if (player.position !== 6) throw new Error("Player position should be jail (6)");
  });

  it("Player pays fine to get out of jail", async function () {
    Monopoly.players.player1.inJail = true;
    Monopoly.players.player1.money = 100;

    popup.decisionPopup = () => Promise.resolve(true);

    await Monopoly.playerInJail("player1");

    const player = Monopoly.players.player1;
    if (player.inJail) throw new Error("Player should no longer be in jail");
    if (player.money !== 50) throw new Error(`Player money should be 50 after paying fine, got ${player.money}`);
    if (player.jailAttempts !== 0) throw new Error("Jail attempts should be reset to 0");
  });

  it("Player rolls dice to try getting out and succeeds", async function () {
    Monopoly.players.player1.inJail = true;
    Monopoly.players.player1.jailAttempts = 0;
    Monopoly.players.player1.money = 150;

    popup.decisionPopup = () => Promise.resolve(false);
    popup.infoPopup = () => Promise.resolve();

    Monopoly.rollDice = () => 5;

    await Monopoly.playerInJail("player1");

    const player = Monopoly.players.player1;
    if (player.inJail) throw new Error("Player should be out of jail after rolling 5");
    if (player.jailAttempts !== 0) throw new Error("Jail attempts should be reset to 0");
  });

  it("Player rolls dice to try getting out and fails 3 times, then gets out", async function () {
    Monopoly.players.player1.inJail = true;
    Monopoly.players.player1.jailAttempts = 2;
    Monopoly.players.player1.money = 150;

    popup.decisionPopup = () => Promise.resolve(false);
    popup.infoPopup = () => Promise.resolve();

    Monopoly.rollDice = () => 3;

    await Monopoly.playerInJail("player1");

    const player = Monopoly.players.player1;
    if (player.inJail) throw new Error("Player should still be in jail after 3rd failed attempt");

    Monopoly.players.player1.jailAttempts = 3;
    await Monopoly.playerInJail("player1");

    if (player.inJail) throw new Error("Player should be out of jail after 3 failed attempts");
    if (player.jailAttempts !== 0) throw new Error("Jail attempts should reset after release");
  });

  it("Player rolls and does not get a 5, remains in jail", async function () {
    Monopoly.players.player1.inJail = true;
    Monopoly.players.player1.jailAttempts = 0;

    popup.decisionPopup = () => Promise.resolve(false);
    popup.infoPopup = () => Promise.resolve();

    Monopoly.rollDice = () => 2;

    await Monopoly.playerInJail("player1");

    const player = Monopoly.players.player1;
    if (!player.inJail) throw new Error("Player should still be in jail after rolling 2");
    if (player.position !== 6) throw new Error("Player position should remain jail (6)");
    if (player.jailAttempts !== 1) throw new Error("Jail attempts should increment after failed roll");
  });

  it("Player pays to get out of jail after 3 failed rolls", async function () {
    Monopoly.players.player1.inJail = true;
    Monopoly.players.player1.jailAttempts = 3;
    Monopoly.players.player1.money = 100;

    await Monopoly.playerInJail("player1");

    const player = Monopoly.players.player1;
    if (player.inJail) throw new Error("Player should no longer be in jail after paying fine");
    if (player.jailAttempts !== 0) throw new Error("Jail attempts should be reset to 0");
  });
});

describe("Game Ending Logic", function () {
  beforeEach(function () {
    Monopoly.players = {
      player1: { money: 1500, properties: [], position: 0, inJail: false },
      player2: { money: 1500, properties: [], position: 0, inJail: false },
    };
    Monopoly.gameOver = false;
  });

  it("Game is not won at start", async function () {
    const result = await Monopoly.is_won();
    if (result) {
      throw new Error("Game should NOT be won when players start with money");
    }
  });

  it("Game ends when a player has zero money", async function () {
    Monopoly.players.player1.money = 0;
    const result = await Monopoly.is_won();
    if (!result) {
      throw new Error("Game should be won when a player has zero money");
    }
  });

  it("Game ends when a player has negative money", async function () {
    Monopoly.players.player2.money = -10;
    const result = await Monopoly.is_won();
    if (!result) {
      throw new Error("Game should be won when a player has negative money");
    }
  });

  it("Game continues when both players have positive money", async function () {
    Monopoly.players.player1.money = 100;
    Monopoly.players.player2.money = 100;
    const result = await Monopoly.is_won();
    if (result) {
      throw new Error("Game should NOT be won if both players have positive money");
    }
  });

  it("Game continues if one player is close to zero but not zero or below", async function () {
    Monopoly.players.player1.money = 1;
    Monopoly.players.player2.money = 100;
    const result = await Monopoly.is_won();
    if (result) {
      throw new Error("Game should NOT be won if player has money > 0");
    }
  });

  it("Game ends when all players have zero or less money (except one)", async function () {
    Monopoly.players.player1.money = 0;
    Monopoly.players.player2.money = 0;
    const result = await Monopoly.is_won();
    if (!result) {
      throw new Error("Game should be won when all but one player has zero money");
    }
  });
});

