import { collisionMapData } from './collision_map_data.js';
import { markMinigameAsCompleted } from './init.js';

class FusionWorld {
  constructor() {
    // Canvas and rendering context
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Dialog modal elements
    this.modal = document.getElementById('dialog-modal');
    this.questionTitleEl = document.getElementById('question-title');
    this.questionEl = document.getElementById('question');
    this.answerEl = document.getElementById('answer');
    this.submitBtn = document.getElementById('submit-answer');
    this.feedbackEl = document.getElementById('feedback');

    // Intro modal elements
    this.introModal = document.getElementById('intro-modal');
    this.startGameBtn = document.getElementById('start-game');

    // Minigame modal elements
    this.minigameModal = document.getElementById('minigame-modal');
    this.minigameSubmitBtn = document.getElementById('minigame-submit');
    this.minigameFeedbackEl = document.getElementById('minigame-feedback');
    this.minigameTimerEl = document.getElementById('minigame-timer');
    this.minigameModalUnsupervised = document.getElementById('minigame-modal-unsupervised');
    this.minigameUnsupervisedFeedbackEl = document.getElementById('minigame-unsupervised-feedback');
    this.minigameUnsupervisedTimerEl = document.getElementById('minigame-unsupervised-timer');
    this.minigameModalReinforced = document.getElementById('minigame-modal-reinforced');
    this.rlFeedbackEl = document.getElementById('rl-feedback');
    this.rlTimerEl = document.getElementById('rl-timer');
    this.minigameModalBias = document.getElementById('minigame-modal-bias');
    this.biasFeedbackEl = document.getElementById('bias-feedback');
    this.biasTimerEl = document.getElementById('bias-timer');
    this.minigameModalDataBias = document.getElementById('minigame-modal-data-bias');
    this.dataRelevanceSubmitBtn = document.getElementById('data-relevance-submit');
    this.dataRelevanceFeedbackEl = document.getElementById('data-relevance-feedback');
    this.dataRelevanceTimerEl = document.getElementById('data-relevance-timer');
    this.minigameModalMlDl = document.getElementById('minigame-modal-ml-dl');
    console.log('minigameModalMlDl:', this.minigameModalMlDl);
    this.rlNextStepBtn = document.getElementById('rl-next-step');
    this.rlRewardBtn = document.getElementById('rl-reward');
    this.rlPunishBtn = document.getElementById('rl-punish');
    this.rlGoalsReachedEl = document.getElementById('rl-goals-reached');
    this.minigameAudio = new Audio('fusion-hit.mp3');
    this.minigameAudio.loop = true;
    this.minigameAudio.volume = 0.1; // Set volume to 20%


    // Game settings
    this.canvas.width = 1000;
    this.canvas.height = 600;

    // Collision map properties
    this.collisionMap = collisionMapData.map(v => v === 0 ? 0 : 1); // Transformar a 0/1
    console.log(collisionMapData.length); 
    this.tileWidth = 16; // Assuming 16x16 tiles
    this.tileHeight = 16; // Assuming 16x16 tiles

    // World properties
    this.world = {
        width: 0, // Will be set after background image loads
        height: 0, // Will be set after background image loads
    };

    // Camera properties
    this.camera = {
        x: 0,
        y: 0,
        width: this.canvas.width,
        height: this.canvas.height,
    };

    // Player properties
    this.player = {
      x:0,
      y: 290,
      width: 48,
      height: 48,
      speed: 5,
      sprite: null, // Idle sprite
      runSprite: null, // Running sprite
      runFrameCount: 6,
      idleFrameCount: 4,
      animationFrame: 0,
      direction: 3, // 0:R, 1:U, 2:L, 3:D
      animationSpeed: 0.2,
      animationCounter: 0,
      isMoving: false,
    };

    // Game state
    this.keys = {};
    this.interactiveObjects = [];
    this.targetObject = null;
    this.interactingWith = null;
    this.currentCorrectAnswer = null;
    this.backgroundImage = null;
    this.interactiveObjectSprite = null;
    this.gameStarted = false;

    this.init();
  }

  async init() {
    await this.loadAssets();
    document.addEventListener('keydown', (e) => this.handleKeys(e, true));
    document.addEventListener('keyup', (e) => this.handleKeys(e, false));
    this.submitBtn.addEventListener('click', () => this.checkAnswer());
    this.startGameBtn.addEventListener('click', () => this.startGame());
    this.minigameSubmitBtn.addEventListener('click', () => this.checkMinigame());
    this.minigameUnsupervisedSubmitBtn = document.getElementById('minigame-unsupervised-submit');
    this.minigameUnsupervisedSubmitBtn.addEventListener('click', () => this.checkUnsupervisedMinigame());
    this.rlNextStepBtn.addEventListener('click', () => this.takeNextStep());
    this.rlRewardBtn.addEventListener('click', () => this.applyReward());
    this.rlPunishBtn.addEventListener('click', () => this.applyPunishment());
    this.dataRelevanceSubmitBtn.addEventListener('click', () => this.checkDataRelevanceMinigame());
    document.getElementById('ml-dl-submit').addEventListener('click', () => this.checkMlDlMinigame());
    this.createInteractiveObjects();
    this.initMinigame();
    this.initUnsupervisedMinigame();
    this.gameLoop();
  }

  startGame() {
    this.introModal.style.display = 'none';
    this.gameStarted = true;
    if (this.minigameAudio) {
      this.minigameAudio.play();
    }
  }

  async loadAssets() {
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Could not load image: ${src}`));
        });
    };

    const [background, playerSprite, playerRunSprite, interactiveObjectSprite] = await Promise.all([
        loadImage('fusion-office.png'),
        loadImage('adam_idle.png'),
        loadImage('adam_run.png'),
        loadImage('fusion-boty-no-bg.png')
    ]);

    this.backgroundImage = background;
    this.player.sprite = playerSprite;
    this.player.runSprite = playerRunSprite;
    this.interactiveObjectSprite = interactiveObjectSprite;

    // Set world dimensions based on the map image size
    this.world.width = 1920; // Assuming the background image is 1280px wide
    this.world.height = 992;

    // Calculate map dimensions in tiles
    this.mapWidthTiles = 120;
    this.mapHeightTiles = 62;

    console.log(`World dimensions: ${this.world.width}x${this.world.height}`);
    console.log(`Map dimensions in tiles: ${this.mapWidthTiles}x${this.mapHeightTiles}`);
    console.log(`Collision map length: ${this.collisionMap.length}`);
  }

  createInteractiveObjects() {
    this.interactiveObjects.push({ x: 280, y: 80, width: 48, height: 48, type: 'minigame', minigame: 'learning-types' });
    this.interactiveObjects.push({ x: 750, y: 100, width: 48, height: 48, type: 'minigame', minigame: 'unsupervised-learning' });
    this.interactiveObjects.push({ x: 520, y: 620, width: 48, height: 48, type: 'minigame', minigame: 'reinforced-learning' });
    this.interactiveObjects.push({ x: 1180, y: 150, width: 48, height: 48, type: 'minigame', minigame: 'cognitive-bias' });
    this.interactiveObjects.push({ x: 100, y: 80, width: 48, height: 48, type: 'minigame', minigame: 'data-relevance' });
    this.interactiveObjects.push({ x: 1500, y: 100, width: 48, height: 48, type: 'minigame', minigame: 'ml-vs-dl' });
  }

  handleKeys(e, isDown) {
    if (!this.gameStarted) return;
    this.keys[e.key] = isDown;
    if (e.key === 'e' && isDown && !this.interactingWith) this.interact();
    if (e.key === 'Escape') this.hideDialog();
  }

  updatePlayerPosition() {
    if (!this.gameStarted) return;
    this.player.isMoving = false;
    let newPlayerX = this.player.x;
    let newPlayerY = this.player.y;

    if (this.keys['ArrowRight']) {
        newPlayerX += this.player.speed;
        this.player.direction = 0; // Right
        this.player.isMoving = true;
    } else if (this.keys['ArrowUp']) {
        newPlayerY -= this.player.speed;
        this.player.direction = 1; // Up
        this.player.isMoving = true;
    } else if (this.keys['ArrowLeft']) {
        newPlayerX -= this.player.speed;
        this.player.direction = 2; // Left
        this.player.isMoving = true;
    } else if (this.keys['ArrowDown']) {
        newPlayerY += this.player.speed;
        this.player.direction = 3; // Down
        this.player.isMoving = true;
    }

    

    // Check for collisions with the collision map
    const playerLeft = newPlayerX;
    const playerRight = newPlayerX + this.player.width;
    const playerTop = newPlayerY;
    const playerBottom = newPlayerY + this.player.height;

    // Get the tiles the player is currently overlapping or would overlap
    const startCol = Math.floor(playerLeft / this.tileWidth);
    const endCol = Math.floor(playerRight / this.tileWidth);
    const startRow = Math.floor(playerTop / this.tileHeight);
    const endRow = Math.floor(playerBottom / this.tileHeight);

    let collided = false;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (col < 0 || col >= this.mapWidthTiles || row < 0 || row >= this.mapHeightTiles) {
          // Out of bounds, consider it a collision for now to prevent player from leaving map
          collided = true;
          break;
        }
        const tileIndex = row * this.mapWidthTiles + col;
        if (this.collisionMap[tileIndex] !== 0) {
          // This tile is a collision tile
          collided = true;
          break;
        }
      }
      if (collided) break;
    }

    if (!collided) {
      this.player.x = newPlayerX;
      this.player.y = newPlayerY;
    }

    // Clamp player position to world bounds (still needed for edge cases and map boundaries)
    this.player.x = Math.max(0, Math.min(this.world.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(this.world.height - this.player.height, this.player.y));
  }

  updateAnimation() {
    if (!this.gameStarted || !this.player.isMoving) {
        this.player.animationFrame = 0;
        this.player.animationCounter = 0;
        return;
    }
    this.player.animationCounter += this.player.animationSpeed;
    if (this.player.animationCounter >= 1) {
        this.player.animationFrame = (this.player.animationFrame + 1) % this.player.runFrameCount;
        this.player.animationCounter = 0;
    }
  }

  updateCamera() {
    if (!this.gameStarted) return;
    // Center camera on player
    this.camera.x = this.player.x - this.camera.width / 2;
    this.camera.y = this.player.y - this.camera.height / 2;

    // Clamp camera to world bounds
    this.camera.x = Math.max(0, Math.min(this.world.width - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.world.height - this.camera.height, this.camera.y));
  }

  checkInteractionZone() {
    if (!this.gameStarted) return;
    let inZone = false;
    for (const obj of this.interactiveObjects) {
      const dist = Math.hypot(this.player.x - obj.x, this.player.y - obj.y);
      if (dist < 70) {
        this.targetObject = obj;
        inZone = true;
        break;
      }
    }
    if (!inZone) {
      this.targetObject = null;
      if (this.interactingWith) this.hideDialog();
    }
  }

  interact() {
    if (this.targetObject) {
      if (this.targetObject.type === 'minigame') {
        this.showMinigame(this.targetObject.minigame);
      } else {
        this.showDialog(this.targetObject);
      }
    }
  }

  showDialog(obj) {
    this.interactingWith = obj;
    this.questionEl.textContent = obj.question;
    this.currentCorrectAnswer = obj.answer.toLowerCase();
    this.feedbackEl.textContent = '';
    this.answerEl.value = '';
    this.modal.style.display = 'block';
    this.answerEl.focus();
  }

  hideDialog() {
    this.modal.style.display = 'none';
    this.minigameModal.style.display = 'none';
    this.minigameModalUnsupervised.style.display = 'none';
    this.minigameModalReinforced.style.display = 'none';
    this.minigameModalBias.style.display = 'none';
    this.minigameModalDataBias.style.display = 'none';
    this.minigameModalMlDl.style.display = 'none';
    this.interactingWith = null;
  }

  checkAnswer() {
    const userAnswer = this.answerEl.value.toLowerCase().trim();
    if (userAnswer === this.currentCorrectAnswer) {
      this.feedbackEl.textContent = '¡Correcto!';
      markMinigameAsCompleted('secret-question');
      setTimeout(() => this.hideDialog(), 1000);
    } else {
      this.feedbackEl.textContent = 'Respuesta incorrecta. Intenta de nuevo.';
    }
  }

  showMinigame(minigame) {
    this.interactingWith = this.targetObject;
    // Clear all minigame timers when a new minigame is shown
    if (document.getElementById('ml-dl-timer')) document.getElementById('ml-dl-timer').textContent = '';
    if (this.dataRelevanceTimerEl) this.dataRelevanceTimerEl.textContent = '';
    if (this.minigameTimerEl) this.minigameTimerEl.textContent = '';
    if (this.minigameUnsupervisedTimerEl) this.minigameUnsupervisedTimerEl.textContent = '';
    if (this.rlTimerEl) this.rlTimerEl.textContent = '';
    if (this.biasTimerEl) this.biasTimerEl.textContent = '';
    if (minigame === 'learning-types') {
      this.minigameModal.style.display = 'block';
      this.snakes = [
        { src: './assets/serpientes/serp-tri.jpg', type: 'venenosa' },
        { src: './assets/serpientes/serp-non.jpg', type: 'no venenosa' },
        { src: './assets/serpientes/serp-oj.jpg', type: 'venenosa' },
      ];
      this.currentSnake = this.snakes[Math.floor(Math.random() * this.snakes.length)];
      document.getElementById('snake-image').src = this.currentSnake.src;
      document.getElementById('snake-answer').value = '';
      this.minigameFeedbackEl.textContent = '';
    } else if (minigame === 'unsupervised-learning') {
      this.minigameModalUnsupervised.style.display = 'block';
      this.minigameUnsupervisedFeedbackEl.textContent = '';
    } else if (minigame === 'reinforced-learning') {
      this.minigameModalReinforced.style.display = 'block';
      this.initReinforcedLearningMinigame();
    } else if (minigame === 'cognitive-bias') {
      this.minigameModalBias.style.display = 'block';
      this.initBiasMinigame();
    } else if (minigame === 'data-relevance') {
      this.minigameModalDataBias.style.display = 'block';
      this.initDataRelevanceMinigame();
    } else if (minigame === 'ml-vs-dl') {
      this.minigameModalMlDl.style.display = 'block';
      this.initMlDlMinigame();
    }
  }

  initDataRelevanceMinigame() {
    const options = document.querySelectorAll('.data-relevance-option');
    const dropzones = document.querySelectorAll('.data-relevance-dropzone');
    let draggedOption = null;

    // Reset options to their original container
    const optionsContainer = document.getElementById('data-relevance-options');
    options.forEach(option => {
      optionsContainer.appendChild(option);
    });

    options.forEach(option => {
      option.addEventListener('dragstart', e => {
        draggedOption = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
      });
    });

    dropzones.forEach(dropzone => {
      dropzone.addEventListener('dragover', e => {
        e.preventDefault();
      });

      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        if (draggedOption) {
          if (e.target.classList.contains('data-relevance-dropzone')) {
            e.target.appendChild(draggedOption);
          } else {
            e.target.parentElement.appendChild(draggedOption);
          }
          draggedOption = null;
        }
      });
    });
    this.dataRelevanceFeedbackEl.textContent = '';
  }

  initMlDlMinigame() {
    const options = document.querySelectorAll('.ml-dl-minigame-option');
    const dropzones = document.querySelectorAll('.ml-dl-minigame-dropzone');
    let draggedOption = null;

    const optionsContainer = document.getElementById('ml-dl-minigame-options');
    options.forEach(option => {
      optionsContainer.appendChild(option);
    });

    options.forEach(option => {
      option.addEventListener('dragstart', e => {
        draggedOption = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
      });
    });

    dropzones.forEach(dropzone => {
      dropzone.addEventListener('dragover', e => {
        e.preventDefault();
      });

      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        if (draggedOption) {
          if (e.target.classList.contains('ml-dl-minigame-dropzone')) {
            e.target.appendChild(draggedOption);
          } else {
            e.target.parentElement.appendChild(draggedOption);
          }
          draggedOption = null;
        }
      });
    });

    document.getElementById('ml-dl-feedback').textContent = '';
  }

  checkMlDlMinigame() {
    const group1Dropzone = document.querySelector('.ml-dl-minigame-dropzone[data-group="group1"]');
    console.log('group1Dropzone:', group1Dropzone);
    const group2Dropzone = document.querySelector('.ml-dl-minigame-dropzone[data-group="group2"]');
    console.log('group2Dropzone:', group2Dropzone);
    console.log('group2Dropzone:', group2Dropzone);
    const optionsContainer = document.getElementById('ml-dl-minigame-options');

    if (optionsContainer.children.length > 0) {
        document.getElementById('ml-dl-feedback').textContent = 'Debes clasificar todas las características antes de verificar.';
        return;
    }

    const group1Type1 = group1Dropzone.querySelectorAll('.ml-dl-minigame-option[data-type="type1"]').length;
    const group1Type2 = group1Dropzone.querySelectorAll('.ml-dl-minigame-option[data-type="type2"]').length;
    const group2Type1 = group2Dropzone.querySelectorAll('.ml-dl-minigame-option[data-type="type1"]').length;
    const group2Type2 = group2Dropzone.querySelectorAll('.ml-dl-minigame-option[data-type="type2"]').length;

    // Assuming 3 of type1 and 3 of type2, and they should be separated into two groups
    // Case 1: group1 has all type1, group2 has all type2
    const case1 = group1Type1 === 3 && group1Type2 === 0 && group2Type1 === 0 && group2Type2 === 3;
    // Case 2: group1 has all type2, group2 has all type1
    const case2 = group1Type1 === 0 && group1Type2 === 3 && group2Type1 === 3 && group2Type2 === 0;

    if (case1 || case2) {
        document.getElementById('ml-dl-feedback').textContent = '¡Correcto! Has diferenciado correctamente las características de Machine Learning y Deep Learning.';
        markMinigameAsCompleted('ml-vs-dl');
        this.startMinigameTimer(document.getElementById('ml-dl-timer'), 5);
    } else {
        document.getElementById('ml-dl-feedback').textContent = 'Incorrecto. Revisa tu clasificación.';
    }
  }

  checkDataRelevanceMinigame() {
    const relevantDropzone = document.querySelector('.data-relevance-dropzone[data-group="relevant"]');
    const irrelevantDropzone = document.querySelector('.data-relevance-dropzone[data-group="irrelevant"]');
    const optionsContainer = document.getElementById('data-relevance-options');

    if (optionsContainer.children.length > 0) {
        this.dataRelevanceFeedbackEl.textContent = 'Debes clasificar todos los datos.';
        return;
    }

    const relevantCorrect = relevantDropzone.querySelectorAll('.data-relevance-option[data-type="relevant"]').length === 4;
    const irrelevantCorrect = irrelevantDropzone.querySelectorAll('.data-relevance-option[data-type="irrelevant"]').length === 4;

    if (relevantCorrect && irrelevantCorrect) {
        this.dataRelevanceFeedbackEl.textContent = '¡Correcto! Has clasificado los datos correctamente. Usando estas variables tu modelo va a recibir un entrenamiento más objetivo.';
        markMinigameAsCompleted('data-relevance');
        this.startMinigameTimer(this.dataRelevanceTimerEl, 5); // Start 5-second timer
    } else {
        this.dataRelevanceFeedbackEl.textContent = 'Incorrecto. Revisa tu clasificación.';
    }
  }

  

  checkMlDlMinigame() {
    const mlDropzone = document.querySelector('.ml-dl-minigame-dropzone[data-group="group1"]');
    const dlDropzone = document.querySelector('.ml-dl-minigame-dropzone[data-group="group2"]');
    const optionsContainer = document.getElementById('ml-dl-minigame-options');

    if (!mlDropzone || !dlDropzone) {
      console.error('Error: One or both minigame dropzones not found.');
      return;
    }

    if (optionsContainer.children.length > 0) {
        document.getElementById('ml-dl-feedback').textContent = 'Debes clasificar todas las características.';
        return;
    }

    const mlCorrect = mlDropzone.querySelectorAll('.ml-dl-minigame-option[data-type="type1"]').length === 3;
    const dlCorrect = dlDropzone.querySelectorAll('.ml-dl-minigame-option[data-type="type2"]').length === 3;

    if (mlCorrect && dlCorrect) {
        document.getElementById('ml-dl-feedback').textContent = '¡Correcto! Has diferenciado correctamente las características de Machine Learning y Deep Learning.';
        markMinigameAsCompleted('ml-vs-dl');
        this.startMinigameTimer(document.getElementById('ml-dl-timer'), 5);
    } else {
        document.getElementById('ml-dl-feedback').textContent = 'Incorrecto. Revisa tu clasificación.';
    }
  }

  startMinigameTimer(timerElement, duration) {
    let timer = duration;
    timerElement.textContent = `Cerrando en ${timer} segundos...`;
    const countdown = setInterval(() => {
      timer--;
      if (timer > 0) {
        timerElement.textContent = `Cerrando en ${timer} segundos...`;
      } else {
        clearInterval(countdown);
        this.hideDialog();
      }
    }, 1000);
  }

  initMinigame() {
    // No longer needed for drag and drop
  }

  checkMinigame() {
    const userAnswer = document.getElementById('snake-answer').value.toLowerCase().trim();
    if (userAnswer === this.currentSnake.type) {
      this.minigameFeedbackEl.textContent = '¡Correcto! Has clasificado correctamente la serpiente.';
      markMinigameAsCompleted('learning-types');
      this.startMinigameTimer(this.minigameTimerEl, 5);
    } else {
      this.minigameFeedbackEl.textContent = 'Incorrecto. Revisa la tabla de características y vuelve a intentarlo.';
    }
  }

  initUnsupervisedMinigame() {
    const options = document.querySelectorAll('.dog-minigame-option');
    const dropzones = document.querySelectorAll('.dog-minigame-dropzone');
    let draggedOption = null;

    options.forEach(option => {
      option.addEventListener('dragstart', e => {
        draggedOption = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
      });
    });

    dropzones.forEach(dropzone => {
      dropzone.addEventListener('dragover', e => {
        e.preventDefault();
      });

      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        if (draggedOption) {
          if (e.target.classList.contains('dog-minigame-dropzone')) {
            e.target.appendChild(draggedOption);
          } else {
            e.target.parentElement.appendChild(draggedOption);
          }
          draggedOption = null;
        }
      });
    });
  }

  checkUnsupervisedMinigame() {
    const group1 = document.querySelector('.dog-minigame-dropzone[data-group="1"]');
    const group2 = document.querySelector('.dog-minigame-dropzone[data-group="2"]');
    const optionsContainer = document.getElementById('dog-minigame-options');

    if (optionsContainer.children.length > 0) {
        this.minigameUnsupervisedFeedbackEl.textContent = 'Debes clasificar todos los perros.';
        return;
    }

    const group1Large = group1.querySelectorAll('.dog-minigame-option[data-size="large"]').length;
    const group1Small = group1.querySelectorAll('.dog-minigame-option[data-size="small"]').length;
    const group2Large = group2.querySelectorAll('.dog-minigame-option[data-size="large"]').length;
    const group2Small = group2.querySelectorAll('.dog-minigame-option[data-size="small"]').length;

    const case1 = group1Large === 3 && group1Small === 0 && group2Large === 0 && group2Small === 3;
    const case2 = group1Large === 0 && group1Small === 3 && group2Large === 3 && group2Small === 0;

    if (case1 || case2) {
        this.minigameUnsupervisedFeedbackEl.textContent = '¡Correcto! Has descubierto el patrón (tamaño) y clasificado los perros correctamente.';
        markMinigameAsCompleted('unsupervised-learning');
        this.startMinigameTimer(this.minigameUnsupervisedTimerEl, 5);
    } else {
        this.minigameUnsupervisedFeedbackEl.textContent = 'Incorrecto. Intenta agruparlos de otra manera.';
    }
  }

  // Reinforced Learning Minigame Logic (User-Driven)
  initReinforcedLearningMinigame() {
    this.rlCanvas = document.getElementById('reinforced-learning-canvas');
    this.rlCtx = this.rlCanvas.getContext('2d');
    this.rlGoalsReachedEl.textContent = '0';

    this.gridSize = 5;
    this.cellSize = this.rlCanvas.width / this.gridSize;
    this.agentPos = { x: 0, y: 0 };
    this.goalPos = { x: this.gridSize - 1, y: this.gridSize - 1 };
    this.obstacles = [
      { x: 1, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 3 }
    ];
    this.qTable = {}; // Q-learning table: state -> action -> Q-value
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.epsilon = 0.5; // Exploration rate
    this.goalsReached = 0;
    this.maxGoals = 1; // Number of times agent needs to reach goal to complete minigame
    this.lastAction = null;
    this.lastState = null;
    this.rlFeedbackEl.textContent = 'Ayuda al robot a encontrar el camino (verde) recompensándolo.';
    this.robotImage = new Image();
    this.robotImage.src = 'fusion-boty-no-bg.png';
    this.drawReinforcedLearningGrid();
  }

  drawReinforcedLearningGrid() {
    this.rlCtx.clearRect(0, 0, this.rlCanvas.width, this.rlCanvas.height);

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.rlCtx.strokeStyle = '#444';
        this.rlCtx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }

    // Draw obstacles
    this.rlCtx.fillStyle = 'red';
    this.obstacles.forEach(obs => {
      this.rlCtx.fillRect(obs.x * this.cellSize, obs.y * this.cellSize, this.cellSize, this.cellSize);
    });

    // Draw goal
    this.rlCtx.fillStyle = 'green';
    this.rlCtx.fillRect(this.goalPos.x * this.cellSize, this.goalPos.y * this.cellSize, this.cellSize, this.cellSize);

    // Draw agent (robot image)
    if (this.robotImage) {
      this.rlCtx.drawImage(
        this.robotImage,
        this.agentPos.x * this.cellSize,
        this.agentPos.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }
  }

  takeNextStep() {
    this.rlFeedbackEl.textContent = '';
    const currentState = `${this.agentPos.x},${this.agentPos.y}`;
    this.lastState = currentState;
    const action = this.chooseAction(currentState);
    this.lastAction = action;
    const oldPos = { ...this.agentPos };
    this.takeAction(action);
    const newPos = { ...this.agentPos };

    this.drawReinforcedLearningGrid();

    if (this.isGoal(newPos)) {
      this.goalsReached++;
      this.rlGoalsReachedEl.textContent = this.goalsReached;
      this.rlFeedbackEl.textContent = '¡Agente en el objetivo! Recompénsalo para reforzar el camino.';
      if (this.goalsReached >= this.maxGoals) {
        this.rlFeedbackEl.textContent = '¡Minijuego completado! El agente ha aprendido a llegar al objetivo.';
        markMinigameAsCompleted('reinforced-learning');
        this.startMinigameTimer(this.rlTimerEl, 5);
      } else {
        this.agentPos = { x: 0, y: 0 }; // Reset agent for next goal
      }
      this.drawReinforcedLearningGrid();
    } else if (this.obstacles.some(obs => obs.x === newPos.x && obs.y === newPos.y)) {
      this.rlFeedbackEl.textContent = '¡Agente chocó con un obstáculo! Castígalo para que aprenda a evitarlo.';
    } else if (newPos.x === oldPos.x && newPos.y === oldPos.y) {
      this.rlFeedbackEl.textContent = 'El agente no se movió. Castígalo si fue una mala decisión.';
    } else {
      this.rlFeedbackEl.textContent = 'El agente se movió. Recompénsalo si fue un buen paso, castígalo si no.';
    }
  }

  applyReward() {
    if (this.lastState && this.lastAction) {
      const reward = 10; // Positive reward
      const newState = `${this.agentPos.x},${this.agentPos.y}`;
      this.updateQTable(this.lastState, this.lastAction, reward, newState);
      this.rlFeedbackEl.textContent = 'Recompensa aplicada. ¡Bien hecho!';
      this.lastState = null;
      this.lastAction = null;
    } else {
      this.rlFeedbackEl.textContent = 'Toma un paso primero.';
    }
  }

  applyPunishment() {
    if (this.lastState && this.lastAction) {
      const reward = -10; // Negative reward (punishment)
      const newState = `${this.agentPos.x},${this.agentPos.y}`;
      this.updateQTable(this.lastState, this.lastAction, reward, newState);
      this.rlFeedbackEl.textContent = 'Castigo aplicado. El agente aprenderá.';
      this.lastState = null;
      this.lastAction = null;
    } else {
      this.rlFeedbackEl.textContent = 'Toma un paso primero.';
    }
  }

  chooseAction(state) {
    const actions = ['up', 'down', 'left', 'right'];
    if (Math.random() < this.epsilon) {
      // Explore: choose a random action
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploit: choose the best action based on Q-values
      let bestAction = null;
      let maxQ = -Infinity;

      actions.forEach(action => {
        const qValue = (this.qTable[state] && this.qTable[state][action]) ? this.qTable[state][action] : 0;
        if (qValue > maxQ) {
          maxQ = qValue;
          bestAction = action;
        }
      });
      return bestAction || actions[Math.floor(Math.random() * actions.length)]; // Fallback
    }
  }

  takeAction(action) {
    let newX = this.agentPos.x;
    let newY = this.agentPos.y;

    switch (action) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }

    // Check boundaries
    newX = Math.max(0, Math.min(this.gridSize - 1, newX));
    newY = Math.max(0, Math.min(this.gridSize - 1, newY));

    // Check for obstacles
    const isObstacle = this.obstacles.some(obs => obs.x === newX && obs.y === newY);
    if (!isObstacle) {
      this.agentPos.x = newX;
      this.agentPos.y = newY;
    }
  }

  // getReward is now handled by user input, so this is simplified
  getReward(newPos, oldPos) {
    // This function is no longer directly used for Q-table updates in this user-driven version.
    // Rewards are provided by the user via applyReward/applyPunishment.
    // However, we can still use it for internal logic if needed, e.g., for immediate feedback.
    if (this.isGoal(newPos)) {
      return 1; // Agent reached goal
    }
    if (this.obstacles.some(obs => obs.x === newPos.x && obs.y === newPos.y)) {
      return -1; // Agent hit obstacle
    }
    if (newPos.x === oldPos.x && newPos.y === oldPos.y) {
        return -0.5; // Agent didn't move
    }
    return 0; // Neutral for movement
  }

  isGoal(pos) {
    return pos.x === this.goalPos.x && pos.y === this.goalPos.y;
  }

  updateQTable(currentState, action, reward, newState) {
    if (!this.qTable[currentState]) {
      this.qTable[currentState] = {};
    }
    if (!this.qTable[currentState][action]) {
      this.qTable[currentState][action] = 0;
    }

    const oldQ = this.qTable[currentState][action];
    const maxFutureQ = this.getMaxQ(newState);
    
    // Q-learning formula
    this.qTable[currentState][action] = oldQ + this.learningRate * (reward + this.discountFactor * maxFutureQ - oldQ);
  }

  getMaxQ(state) {
    const actions = ['up', 'down', 'left', 'right'];
    let maxQ = 0;
    if (this.qTable[state]) {
      actions.forEach(action => {
        maxQ = Math.max(maxQ, this.qTable[state][action] || 0);
      });
    }
    return maxQ;
  }

  // Cognitive Bias Minigame Logic (Anchoring Bias)
  initBiasMinigame() {
    this.biasSubmitBtn = document.getElementById('bias-submit');
    this.biasSubmitBtn.removeEventListener('click', this.checkBiasMinigame);
    this.biasSubmitBtn.addEventListener('click', () => this.checkBiasMinigame());
    this.biasFeedbackEl.textContent = '';
    this.biasEstimateInput = document.getElementById('bias-estimate');
    this.biasEstimateInput.value = '';

    this.anchorValueEl = document.getElementById('anchor-value');
    this.correctAnswer = 1500; // Approximate number of active volcanoes in the world

    // Randomly choose a high or low anchor
    if (Math.random() < 0.5) {
      this.anchor = 20; // Low anchor
    } else {
      this.anchor = 100; // High anchor
    }
    this.anchorValueEl.textContent = this.anchor;
  }

  checkBiasMinigame() {
    const userEstimate = parseInt(this.biasEstimateInput.value);

    if (isNaN(userEstimate)) {
      this.biasFeedbackEl.textContent = 'Por favor, introduce un número válido.';
      return;
    }

    let feedbackMessage = `La respuesta correcta es ${this.correctAnswer}.`;

    if (this.anchor === 10) {
      if (userEstimate < this.correctAnswer) {
        feedbackMessage += ` Tu estimación de ${userEstimate} es menor que la respuesta correcta. Es posible que el ancla baja (${this.anchor}) haya influido en tu juicio.`;
      } else if (userEstimate > this.correctAnswer) {
        feedbackMessage += ` Tu estimación de ${userEstimate} es mayor que la respuesta correcta. Aunque el ancla era baja (${this.anchor}), tu estimación fue más alta.`;
      } else {
        feedbackMessage += ` ¡Tu estimación de ${userEstimate} es correcta!`;
      }
    } else { // High anchor
      if (userEstimate > this.correctAnswer) {
        feedbackMessage += ` Tu estimación de ${userEstimate} es mayor que la respuesta correcta. Es posible que el ancla alta (${this.anchor}) haya influido en tu juicio.`;
      } else if (userEstimate < this.correctAnswer) {
        feedbackMessage += ` Tu estimación de ${userEstimate} es menor que la respuesta correcta. Aunque el ancla era alta (${this.anchor}), tu estimación fue más baja.`;
      } else {
        feedbackMessage += ` ¡Tu estimación de ${userEstimate} es correcta!`;
      }
    }

    feedbackMessage += ` El sesgo de anclaje demuestra cómo un número inicial puede influir en nuestras decisiones, incluso si es irrelevante.`;
    this.biasFeedbackEl.textContent = feedbackMessage;
    markMinigameAsCompleted('cognitive-bias');
    this.startMinigameTimer(this.biasTimerEl, 10); // Start 10-second timer
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.gameStarted) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    // Draw background relative to camera
    if (this.backgroundImage) {
        this.ctx.drawImage(
            this.backgroundImage,
            this.camera.x, this.camera.y, // Source rectangle (part of map to show)
            this.camera.width, this.camera.height,
            0, 0, // Destination rectangle (the canvas)
            this.canvas.width, this.canvas.height
        );
    }

    // Draw interactive objects relative to camera
    this.interactiveObjects.forEach(obj => {
      if (this.interactiveObjectSprite) {
        this.ctx.drawImage(
          this.interactiveObjectSprite,
          obj.x - this.camera.x,
          obj.y - this.camera.y,
          obj.width,
          obj.height
        );
      }
    });

    // Draw Player Sprite relative to camera
    const spriteToUse = this.player.isMoving ? this.player.runSprite : this.player.sprite;
    if (!spriteToUse) return;

    let frameWidth, frameHeight, sx, sy;

    if (this.player.isMoving) {
        const totalFrames = 24;
        frameWidth = spriteToUse.width / totalFrames;
        frameHeight = spriteToUse.height;
        const directionOffset = this.player.direction * this.player.runFrameCount;
        sx = (directionOffset + this.player.animationFrame) * frameWidth;
        sy = 0;
    } else {
        frameWidth = spriteToUse.width / this.player.idleFrameCount;
        frameHeight = spriteToUse.height;
        const idleFrameMap = [0, 1, 2, 3];
        const idleFrameIndex = idleFrameMap[this.player.direction];
        sx = idleFrameIndex * frameWidth;
        sy = 0;
    }

    this.ctx.drawImage(
      spriteToUse,
      sx, sy,
      frameWidth, frameHeight,
      this.player.x - this.camera.x, this.player.y - this.camera.y, // Draw player relative to camera
      this.player.width, this.player.height
    );

    if (this.targetObject && !this.interactingWith) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '18px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
          "Presiona 'E' para interactuar", 
          this.targetObject.x + 25 - this.camera.x, 
          this.targetObject.y - 20 - this.camera.y
      );
    }

    //this.drawCollisionDebug(); // Call debug drawing
  }

  drawCollisionDebug() {
    // Draw player collision box
    this.ctx.strokeStyle = 'lime';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.player.x - this.camera.x,
      this.player.y - this.camera.y,
      this.player.width,
      this.player.height
    );

    // Draw collision tiles
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 1;
    for (let row = 0; row < this.mapHeightTiles; row++) {
      for (let col = 0; col < this.mapWidthTiles; col++) {
        const tileIndex = row * this.mapWidthTiles + col;
        if (this.collisionMap[tileIndex] !== 0) {
          //console.log(`Collision tile at (${col}, ${row})`);
          this.ctx.strokeRect(
            col * this.tileWidth - this.camera.x,
            row * this.tileHeight - this.camera.y + 1,
            this.tileWidth,
            this.tileHeight
          );
        }
      }
    }
  }

  gameLoop() {
    this.updatePlayerPosition();
    this.updateAnimation();
    this.updateCamera(); // Update camera position each frame
    this.checkInteractionZone();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new FusionWorld();
});
''