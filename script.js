// Constants
const CONSTANTS = {
  COLORS: ["red", "blue", "green", "yellow"],
  VALUES: [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "Skip",
    "Reverse",
    "Draw2",
  ],
  WILD_CARDS: ["Wild", "Wild4"],
  ORIGINAL_BACKGROUND: "",
  NEW_BACKGROUND: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
};

// Game State Class
class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.deck = [];
    this.discardPile = [];
    this.players = {
      human: [],
      ai: [],
    };
    this.currentPlayer = "human";
    this.gameDirection = 1;
    this.currentColor = null;
    this.currentValue = null;
    this.unoCalled = false;
    this.gameStarted = false;
    this.drawCardCount = 0;
    this.aiDifficulty = "medium";
    this.startingCards = document.getElementById("starting-cards").value;
    this.firstGame = true;
  }
}

// Deck Management Class
class DeckManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  createDeck() {
    this.gameState.deck = [];

    // Create number cards
    CONSTANTS.COLORS.forEach((color) => {
      CONSTANTS.VALUES.forEach((value) => {
        if (value === "0") {
          // Only one '0' card per color
          this.gameState.deck.push({ color, value });
        } else {
          // Two of each number card (1-9, Skip, Reverse, Draw2)
          this.gameState.deck.push({ color, value });
          this.gameState.deck.push({ color, value });
        }
      });
    });

    // Create wild cards
    CONSTANTS.WILD_CARDS.forEach((wild) => {
      for (let i = 0; i < 4; i++) {
        this.gameState.deck.push({ color: "wild", value: wild });
      }
    });
  }

  shuffleDeck() {
    for (let i = this.gameState.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.gameState.deck[i], this.gameState.deck[j]] = [
        this.gameState.deck[j],
        this.gameState.deck[i],
      ];
    }
  }

  drawCard() {
    if (this.gameState.drawCardCount > 0) {
      let drawnCards = [];
      for (let i = 0; i < this.gameState.drawCardCount; i++) {
        if (this.gameState.deck.length === 0) {
          this.reshuffleDeck();
        }
        drawnCards.push(this.gameState.deck.pop());
      }
      this.gameState.drawCardCount = 0;

      UIManager.instance.showMessageTimeout(
        `${this.gameState.currentPlayer === "human" ? "You" : "AI"} drew ${
          drawnCards.length
        } card(s).`
      );
      return drawnCards;
    }

    if (this.gameState.deck.length === 0) {
      this.reshuffleDeck();
    }
    return this.gameState.deck.pop();
  }

  drawCardUno() {
    if (this.gameState.deck.length === 0) {
      this.reshuffleDeck();
    }
    return this.gameState.deck.pop();
  }

  reshuffleDeck() {
    const topCard = this.gameState.discardPile.pop();
    this.gameState.deck = [...this.gameState.discardPile];
    this.gameState.discardPile = [topCard];
    this.shuffleDeck();
    UIManager.instance.showMessage(
      "Deck was empty! Discard pile (except top card) has been reshuffled into the deck."
    );
  }

  dealCards() {
    for (let i = 0; i < this.gameState.startingCards; i++) {
      this.gameState.players.human.push(this.drawCard());
      this.gameState.players.ai.push(this.drawCard());
    }
  }
}

// Game Logic Class
class GameLogic {
  constructor(gameState, deckManager) {
    this.gameState = gameState;
    this.deckManager = deckManager;
  }

  canPlayCard(card) {
    if (!this.gameState.discardPile.length) return true;

    if (this.gameState.drawCardCount > 0) {
      if (this.gameState.currentValue === "Draw2" && card.value === "Draw2") {
        return true;
      }
      if (this.gameState.currentValue === "Wild4" && card.value === "Wild4") {
        return true;
      }
      if (this.gameState.currentValue === "Draw2" && card.value === "Wild4") {
        return true;
      }
      return false;
    }

    if (card.color === "wild") return true;

    if (
      card.color === this.gameState.currentColor ||
      card.value === this.gameState.currentValue
    )
      return true;

    return false;
  }

  handleActionCard(card) {
    switch (card.value) {
      case "Skip":
        UIManager.instance.showMessageTimeout(
          `${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          } Play Skip! ${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          }'s turn again.`
        );
        this.switchTurn();
        break;
      case "Reverse":
        this.gameState.gameDirection *= -1;
        UIManager.instance.showMessageTimeout(
          `${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          } Play Reverse! ${
            this.gameState.currentPlayer === "human" ? "AI" : "You"
          }'s turn.`
        );
        break;
      case "Draw2":
        this.drawCards(2);
        UIManager.instance.showMessageTimeout(
          `${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          } Play Draw 2! ${
            this.gameState.currentPlayer === "human" ? "AI" : "You"
          }'s turn.`
        );
        break;
      case "Wild":
        UIManager.instance.showMessageTimeout(
          `${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          } Play Wild Card! ${
            this.gameState.currentPlayer === "human" ? "AI" : "You"
          }'s turn.`
        );
        break;
      case "Wild4":
        this.drawCards(4);
        UIManager.instance.showMessageTimeout(
          `${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          } Play Wild Draw 4! ${
            this.gameState.currentPlayer === "human" ? "AI" : "You"
          }'s turn.`
        );
        break;
    }
  }

  firstHandleActionCard(card) {
    switch (card.value) {
      case "Skip":
        UIManager.instance.showMessage(
          `Start Game with Skip Card! ${
            this.gameState.currentPlayer === "human" ? "AI" : "Human"
          }'s turn.`
        );
        this.switchTurn();
        break;
      case "Reverse":
        this.gameState.gameDirection *= -1;
        UIManager.instance.showMessage(
          `Start Game with Reverse Card! ${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          }'s turn.`
        );
        break;
      case "Draw2":
        this.drawCards(2);
        UIManager.instance.showMessage(
          `Start Game with Draw 2 Card! ${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          }'s turn.`
        );
        break;
      case "Wild":
        UIManager.instance.showMessage(
          `Start Game with Wild Card! ${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          }'s turn.`
        );
        break;
      case "Wild4":
        this.drawCards(4);
        UIManager.instance.showMessage(
          `Start Game with Wild Draw 4! ${
            this.gameState.currentPlayer === "human" ? "You" : "AI"
          }'s turn.`
        );
        break;
    }
  }

  drawCards(count) {
    this.gameState.drawCardCount += count;
    UIManager.instance.updateDrawCardCount();
  }

  switchTurn() {
    this.gameState.currentPlayer =
      this.gameState.currentPlayer === "human" ? "ai" : "human";
    this.checkGameOver();
  }

  checkUno() {
    if (
      this.gameState.currentPlayer === "human" &&
      this.gameState.players.human.length === 1 &&
      !this.gameState.unoCalled
    ) {
      const drawnCard = this.deckManager.drawCardUno();
      this.gameState.players.human.push(drawnCard);
      UIManager.instance.showMessageTimeout(
        "You didn't say UNO! Draw 1 penalty cards."
      );
    }

    if (
      this.gameState.currentPlayer === "human" &&
      this.gameState.players.human.length > 1 &&
      this.gameState.unoCalled
    ) {
      this.gameState.unoCalled = false;
    }
  }

  checkGameOver() {
    if (this.gameState.players.human.length === 0) {
      UIManager.instance.showGameOver(true);
    } else if (this.gameState.players.ai.length === 0) {
      UIManager.instance.showGameOver(false);
    }
  }

  playCard(cardIndex) {
    if (this.gameState.currentPlayer !== "human") return;

    const card = this.gameState.players.human[cardIndex];

    if (!this.canPlayCard(card)) {
      UIManager.instance.showMessage(
        `You can't play that card! It must match the current color or value.`
      );
      return;
    }

    if (card.color === "wild") {
      this.gameState.currentValue = card.value;
      UIManager.instance.setWildCardIndex(cardIndex);
      UIManager.instance.showWildColorSelector();
      return;
    }

    this.gameState.players.human.splice(cardIndex, 1);
    this.gameState.discardPile.push(card);
    this.gameState.currentColor = card.color;
    this.gameState.currentValue = card.value;

    this.handleActionCard(card);
    this.checkUno();
    this.switchTurn();
    UIManager.instance.updateUI();

    if (this.gameState.currentPlayer === "ai") {
      setTimeout(() => AIPlayer.instance.play(), 5000);
    }
  }

  selectWildColor(color) {
    this.gameState.currentColor = color;

    const card = {
      color: this.gameState.currentColor,
      value: this.gameState.currentValue,
    };

    this.gameState.discardPile.push(card);
    UIManager.instance.hideWildColorSelector();

    const cardIndex = UIManager.instance.getWildCardIndex();
    this.gameState.players.human.splice(cardIndex, 1);

    this.handleActionCard(card);
    this.checkUno();
    this.switchTurn();
    UIManager.instance.updateUI();
  }

  callUno() {
    const playableCards = this.gameState.players.human.filter((card) =>
      this.canPlayCard(card)
    );

    if (
      this.gameState.currentPlayer === "human" &&
      this.gameState.players.human.length === 2 &&
      playableCards.length > 0
    ) {
      this.gameState.unoCalled = true;
      UIManager.instance.hideUnoButton();
      UIManager.instance.showMessage("UNO!");
    } else {
      UIManager.instance.showMessage(
        "You can't call UNO now! You don't have one card to play"
      );
    }
  }

  drawCardAction() {
    if (this.gameState.currentPlayer !== "human") return;

    const drawnCard = this.deckManager.drawCard();
    if (Array.isArray(drawnCard)) {
      drawnCard.forEach((card) => {
        this.gameState.players.human.push(card);
      });

      this.switchTurn();
      UIManager.instance.updateUI();

      if (this.gameState.currentPlayer === "ai") {
        setTimeout(() => AIPlayer.instance.play(), 5000);
      }
      return;
    }

    this.gameState.players.human.push(drawnCard);
    UIManager.instance.showMessage(`You drew a card.`);

    if (this.canPlayCard(drawnCard)) {
      const cardElements = UIManager.instance.getPlayerCardElements();
      const lastCard = cardElements[cardElements.length - 1];
      lastCard.classList.add("card-play");

      setTimeout(() => {
        lastCard.classList.remove("card-play");
      }, 500);
    }

    this.switchTurn();
    UIManager.instance.updateUI();

    if (this.gameState.currentPlayer === "ai") {
      setTimeout(() => AIPlayer.instance.play(), 5000);
    }
  }
}

// AI Player Class
class AIPlayer {
  constructor(gameState, gameLogic, deckManager) {
    this.gameState = gameState;
    this.gameLogic = gameLogic;
    this.deckManager = deckManager;
    AIPlayer.instance = this;
  }

  play() {
    if (this.gameState.currentPlayer !== "ai") return;

    const playableCards = this.gameState.players.ai.filter((card) =>
      this.gameLogic.canPlayCard(card)
    );

    let cardToPlay;

    if (playableCards.length === 0) {
      const drawnCard = this.deckManager.drawCard();

      if (Array.isArray(drawnCard)) {
        drawnCard.forEach((card) => {
          this.gameState.players.ai.push(card);
        });

        this.gameLogic.switchTurn();
        UIManager.instance.updateUI();
        return;
      }

      this.gameState.players.ai.push(drawnCard);
      UIManager.instance.showMessageTimeout("AI draws a card.");

      if (this.gameLogic.canPlayCard(drawnCard)) {
        if (this.gameState.aiDifficulty === "easy") {
          if (Math.random() < 0.3) {
            cardToPlay = drawnCard;
          }
        } else if (this.gameState.aiDifficulty === "medium") {
          if (Math.random() < 0.7) {
            cardToPlay = drawnCard;
          }
        } else if (this.gameState.aiDifficulty === "hard") {
          cardToPlay = drawnCard;
        }
      }
    } else {
      if (this.gameState.aiDifficulty === "easy") {
        cardToPlay =
          playableCards[Math.floor(Math.random() * playableCards.length)];
      } else if (this.gameState.aiDifficulty === "medium") {
        if (Math.random() < 0.7) {
          cardToPlay = this.getBestCardToPlay(playableCards);
        } else {
          cardToPlay =
            playableCards[Math.floor(Math.random() * playableCards.length)];
        }
      } else if (this.gameState.aiDifficulty === "hard") {
        cardToPlay = this.getBestCardToPlay(playableCards);
      }
    }

    if (cardToPlay) {
      const cardIndex = this.gameState.players.ai.findIndex(
        (card) => card === cardToPlay
      );
      this.gameState.players.ai.splice(cardIndex, 1);

      if (cardToPlay.color === "wild") {
        const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };
        this.gameState.players.ai.forEach((card) => {
          if (card.color !== "wild") {
            colorCounts[card.color]++;
          }
        });

        const maxColor = Object.keys(colorCounts).reduce((a, b) =>
          colorCounts[a] > colorCounts[b] ? a : b
        );

        cardToPlay.color = maxColor;
      }

      this.gameState.discardPile.push(cardToPlay);
      if (cardToPlay.color !== "wild") {
        this.gameState.currentColor = cardToPlay.color;
      }
      this.gameState.currentValue = cardToPlay.value;

      this.gameLogic.handleActionCard(cardToPlay);

      if (this.gameState.players.ai.length === 1) {
        UIManager.instance.showMessage("AI says UNO!");
      }
    }

    this.gameLogic.switchTurn();
    UIManager.instance.updateUI();
  }

  getBestCardToPlay(playableCards) {
    const matchingCards = playableCards.filter(
      (card) =>
        card.color === this.gameState.currentColor ||
        card.value === this.gameState.currentValue
    );
    if (matchingCards.length > 0) {
      return matchingCards[0];
    }

    const actionCards = playableCards.filter((card) =>
      ["Skip", "Reverse", "Draw2", "Wild", "Wild4"].includes(card.value)
    );

    if (actionCards.length > 0) {
      const skipOrReverse = actionCards.find(
        (card) => card.value === "Skip" || card.value === "Reverse"
      );
      if (skipOrReverse) return skipOrReverse;

      const draw2 = actionCards.find((card) => card.value === "Draw2");
      if (draw2) return draw2;

      const wild4 = actionCards.find((card) => card.value === "Wild4");
      if (wild4) return wild4;

      const wild = actionCards.find((card) => card.value === "Wild");
      if (wild) return wild;
    }

    return playableCards[0];
  }
}

// UI Manager Class
class UIManager {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    UIManager.instance = this;
  }

  initializeElements() {
    this.playerCardsContainer = document.getElementById("player-cards");
    this.playerCardsCount = document.getElementById("player-cards-count");
    this.aiCardsContainer = document.getElementById("ai-cards");
    this.aiCardsCount = document.getElementById("ai-cards-count");
    this.currentCardDisplay = document.getElementById("current-card");
    this.discardPile = document.getElementById("discard-pile");
    this.drawCardBtn = document.getElementById("draw-card-btn");
    this.skipTurnBtn = document.getElementById("skip-turn-btn");
    this.unoBtn = document.getElementById("uno-btn");
    this.currentPlayerDisplay = document.getElementById("current-player");
    this.gameMessage = document.getElementById("game-message");
    this.messageContent = document.getElementById("message-content");
    this.closeMessageBtn = document.getElementById("close-message-btn");
    this.wildColorSelector = document.getElementById("wild-color-selector");
    this.settingsBtn = document.getElementById("settings-btn");
    this.settingsModal = document.getElementById("settings-modal");
    this.cancelSettingsBtn = document.getElementById("cancel-settings");
    this.saveSettingsBtn = document.getElementById("save-settings");
    this.aiDifficultySelect = document.getElementById("ai-difficulty");
    this.startingCardsSelect = document.getElementById("starting-cards");
    this.newGameBtn = document.getElementById("new-game-btn");
    this.gameOverModal = document.getElementById("game-over-modal");
    this.gameOverTitle = document.getElementById("game-over-title");
    this.gameOverMessage = document.getElementById("game-over-message");
    this.playAgainBtn = document.getElementById("play-again-btn");
    this.drawCardCountContainer = document.getElementById(
      "draw-card-count-container"
    );
    this.drawCardCount = document.getElementById("draw-card-count");
    this.cancelWildColorBtn = document.getElementById("cancel-wild-color");
    this.wildCardIndex = document.getElementById("wildCardIndex");
    this.playerStats = document.getElementById("player-stats");
    this.aiStats = document.getElementById("ai-stats");

    this.skipTurnBtn.classList.add("hidden");
  }

  setupEventListeners() {
    this.closeMessageBtn.addEventListener("click", () => {
      this.gameMessage.classList.add("hidden");
    });

    this.drawCardBtn.addEventListener("click", () => {
      GameManager.instance.gameLogic.drawCardAction();
    });

    this.unoBtn.addEventListener("click", () => {
      GameManager.instance.gameLogic.callUno();
    });

    this.settingsBtn.addEventListener("click", () => {
      this.settingsModal.classList.remove("hidden");
    });

    this.cancelSettingsBtn.addEventListener("click", () => {
      this.settingsModal.classList.add("hidden");
    });

    this.saveSettingsBtn.addEventListener("click", () => {
      SettingsManager.instance.saveSettings();
    });

    this.newGameBtn.addEventListener("click", () => {
      GameManager.instance.initGame();
    });

    this.playAgainBtn.addEventListener("click", () => {
      this.gameOverModal.classList.add("hidden");
      GameManager.instance.initGame();
    });

    this.cancelWildColorBtn.addEventListener("click", () => {
      this.hideWildColorSelector();
      this.updateUI();
    });

    // Wild color selector event listeners
    document.querySelectorAll(".wild-color-selector").forEach((selector) => {
      selector.addEventListener("click", (e) => {
        const color = e.target.getAttribute("data-color");
        if (color) {
          GameManager.instance.gameLogic.selectWildColor(color);
        }
      });
    });
  }

  updateUI() {
    this.updateDrawCardCount();
    this.renderPlayerCards();
    this.updateAICardsCount();
    this.updateCurrentCardDisplay();
    this.updateCurrentPlayerDisplay();
    this.updateUnoButtonVisibility();
    this.updatePlayerStats();

    if (GameManager.instance.gameState.currentPlayer === "ai") {
      setTimeout(() => AIPlayer.instance.play(), 5000);
    }
  }

  updateDrawCardCount() {
    this.drawCardCount.textContent =
      GameManager.instance.gameState.drawCardCount;
  }

  renderPlayerCards() {
    this.playerStats.classList.add("scale-110", "transition", "duration-300");
    this.aiStats.classList.remove("scale-110", "transition", "duration-300");
    this.playerStats.style.background = CONSTANTS.NEW_BACKGROUND;
    this.aiStats.style.background = CONSTANTS.ORIGINAL_BACKGROUND;

    this.playerCardsCount.textContent =
      GameManager.instance.gameState.players.human.length;
    this.playerCardsContainer.innerHTML = "";

    GameManager.instance.gameState.players.human.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.className = `card w-16 h-24 bg-${card.color}-500 rounded-lg flex flex-col items-center justify-center text-white font-bold text-xl cursor-pointer card-hover`;
      cardElement.style.animationDelay = `${index * 0.1}s`;

      if (card.color === "wild") {
        cardElement.className = `card w-16 h-24 bg-purple-dark-4 rounded-lg flex flex-col items-center justify-center text-white font-bold text-xl cursor-pointer card-hover`;
      }

      if (GameManager.instance.gameState.firstGame) {
        cardElement.classList.add("transition", "card-deal");
      }

      const valueDisplay = document.createElement("div");
      valueDisplay.textContent = card.value;

      if (card.value === "Skip") {
        valueDisplay.innerHTML = '<i class="fas fa-ban"></i>';
      } else if (card.value === "Reverse") {
        valueDisplay.innerHTML = '<i class="fas fa-retweet"></i>';
      } else if (card.value === "Draw2") {
        valueDisplay.textContent = "+2";
      } else if (card.value === "Wild4") {
        valueDisplay.textContent = "+4";
      }

      cardElement.appendChild(valueDisplay);
      cardElement.addEventListener("click", () =>
        GameManager.instance.gameLogic.playCard(index)
      );
      this.playerCardsContainer.appendChild(cardElement);
    });
  }

  updateAICardsCount() {
    this.aiCardsCount.textContent =
      GameManager.instance.gameState.players.ai.length;
  }

  updateCurrentCardDisplay() {
    if (GameManager.instance.gameState.discardPile.length === 0) return;

    const topCard =
      GameManager.instance.gameState.discardPile[
        GameManager.instance.gameState.discardPile.length - 1
      ];
    this.currentCardDisplay.className = `w-full h-full bg-${topCard.color}-500 rounded-lg flex flex-col items-center justify-center text-white font-bold text-2xl`;

    if (topCard.color === "wild") {
      this.currentCardDisplay.className = `w-full h-full bg-${GameManager.instance.gameState.currentColor}-500 rounded-lg flex flex-col items-center justify-center text-white font-bold text-2xl`;
    }

    this.currentCardDisplay.innerHTML = "";
    const valueDisplay = document.createElement("div");
    valueDisplay.textContent = topCard.value;

    if (topCard.value === "Skip") {
      valueDisplay.innerHTML = '<i class="fas fa-ban"></i>';
    } else if (topCard.value === "Reverse") {
      valueDisplay.innerHTML = '<i class="fas fa-retweet"></i>';
    } else if (topCard.value === "Draw2") {
      valueDisplay.textContent = "+2";
    } else if (topCard.value === "Wild4") {
      valueDisplay.textContent = "+4";
    }

    this.currentCardDisplay.appendChild(valueDisplay);
  }

  updateCurrentPlayerDisplay() {
    this.currentPlayerDisplay.textContent =
      GameManager.instance.gameState.currentPlayer === "human" ? "You" : "AI";
    this.currentPlayerDisplay.className =
      GameManager.instance.gameState.currentPlayer === "human"
        ? "text-xl mt-1 font-bold text-yellow-300"
        : "text-xl mt-1 font-bold text-red-400";
  }

  updateUnoButtonVisibility() {
    if (
      GameManager.instance.gameState.currentPlayer === "human" &&
      GameManager.instance.gameState.players.human.length === 2
    ) {
      this.unoBtn.classList.remove("hidden", "pointer-events-none");
    } else {
      this.unoBtn.classList.add("hidden", "pointer-events-none");
    }
  }

  updatePlayerStats() {
    if (GameManager.instance.gameState.currentPlayer === "ai") {
      this.aiStats.classList.add("scale-110", "transition", "duration-300");
      this.playerStats.classList.remove(
        "scale-110",
        "transition",
        "duration-300"
      );
      this.aiStats.style.background = CONSTANTS.NEW_BACKGROUND;
      this.playerStats.style.background = CONSTANTS.ORIGINAL_BACKGROUND;
    }
  }

  showMessage(message) {
    this.messageContent.textContent = message;
    this.gameMessage.classList.remove("hidden");
  }

  showMessageTimeout(message) {
    this.messageContent.textContent = message;
    this.closeMessageBtn.classList.add("hidden");
    this.gameMessage.classList.remove("hidden");
    setTimeout(() => {
      this.gameMessage.classList.add("hidden");
      this.closeMessageBtn.classList.remove("hidden");
    }, 2000);
  }

  showWildColorSelector() {
    this.createOverlay();
    this.wildColorSelector.classList.remove("hidden");
    this.wildColorSelector.classList.add("pointer-events-auto");
  }

  hideWildColorSelector() {
    this.wildColorSelector.classList.add("hidden");
    this.deleteOverlay();
  }

  createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 z-40";
    document.body.appendChild(overlay);
    document.body.classList.add("pointer-events-none");
  }

  deleteOverlay() {
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.remove();
      document.body.classList.remove("pointer-events-none");
    }
  }

  setWildCardIndex(index) {
    this.wildCardIndex.textContent = index;
  }

  getWildCardIndex() {
    return Number(this.wildCardIndex.textContent);
  }

  hideUnoButton() {
    this.unoBtn.classList.add("hidden", "pointer-events-none");
  }

  getPlayerCardElements() {
    return this.playerCardsContainer.querySelectorAll(".card");
  }

  showGameOver(humanWon) {
    if (humanWon) {
      this.gameOverTitle.textContent = "You Win!";
      this.gameOverMessage.textContent =
        "Congratulations! You've won the game!";
    } else {
      this.gameOverTitle.textContent = "AI Wins!";
      this.gameOverMessage.textContent =
        "The AI opponent has won the game. Better luck next time!";
    }
    this.gameOverModal.classList.remove("hidden");
  }
}

// Settings Manager Class
class SettingsManager {
  constructor(gameState, uiManager) {
    this.gameState = gameState;
    this.uiManager = uiManager;
    SettingsManager.instance = this;
  }

  saveSettings() {
    this.gameState.aiDifficulty = this.uiManager.aiDifficultySelect.value;
    this.gameState.startingCards = parseInt(
      this.uiManager.startingCardsSelect.value
    );
    this.uiManager.settingsModal.classList.add("hidden");
    this.saveToLocalStorage();
    this.uiManager.showMessage("Settings saved!");
    GameManager.instance.initGame();
  }

  loadSettings() {
    const savedSettings = JSON.parse(
      localStorage.getItem("unoSettings") || "{}"
    );
    this.gameState.aiDifficulty = savedSettings.aiDifficulty || "medium";
    this.gameState.startingCards = savedSettings.startingCards || 7;

    this.uiManager.aiDifficultySelect.value = this.gameState.aiDifficulty;
    this.uiManager.startingCardsSelect.value = this.gameState.startingCards;
  }

  saveToLocalStorage() {
    const settings = {
      aiDifficulty: this.gameState.aiDifficulty,
      startingCards: this.gameState.startingCards,
    };
    localStorage.setItem("unoSettings", JSON.stringify(settings));
  }
}

// Game Manager Class - Main Controller
class GameManager {
  constructor() {
    this.gameState = new GameState();
    this.deckManager = new DeckManager(this.gameState);
    this.gameLogic = new GameLogic(this.gameState, this.deckManager);
    this.uiManager = new UIManager();
    this.aiPlayer = new AIPlayer(
      this.gameState,
      this.gameLogic,
      this.deckManager
    );
    this.settingsManager = new SettingsManager(this.gameState, this.uiManager);
    GameManager.instance = this;
  }

  initGame() {
    this.gameState.reset();
    this.deckManager.createDeck();
    this.deckManager.shuffleDeck();
    this.deckManager.dealCards();
    this.startGame();
    this.uiManager.updateUI();
    this.gameState.firstGame = false;
    this.settingsManager.loadSettings();
    this.uiManager.hideUnoButton();
  }

  startGame() {
    let firstCard;
    do {
      firstCard = this.deckManager.drawCard();
    } while (firstCard.color === "wild");

    this.gameState.discardPile.push(firstCard);
    this.gameState.currentColor = firstCard.color;
    this.gameState.currentValue = firstCard.value;

    this.gameLogic.firstHandleActionCard(firstCard);

    if (firstCard.value === "Skip") {
      setTimeout(() => this.aiPlayer.play(), 5000);
    }

    this.gameState.gameStarted = true;
  }
}

// Initialize the game when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  new GameManager();
  GameManager.instance.initGame();
});
