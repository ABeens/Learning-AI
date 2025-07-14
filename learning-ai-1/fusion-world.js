import { collisionMapData } from './collision_map_data.js';

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
    this.minigameModalUnsupervised = document.getElementById('minigame-modal-unsupervised');
    this.minigameUnsupervisedFeedbackEl = document.getElementById('minigame-unsupervised-feedback');


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
    this.createInteractiveObjects();
    this.initMinigame();
    this.initUnsupervisedMinigame();
    this.gameLoop();
  }

  startGame() {
    this.introModal.style.display = 'none';
    this.gameStarted = true;
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
    this.interactiveObjects.push({ x: 100, y: 100, width: 48, height: 48, type: 'minigame', minigame: 'learning-types' });
    this.interactiveObjects.push({ x: 300, y: 100, width: 48, height: 48, type: 'minigame', minigame: 'unsupervised-learning' });
    this.interactiveObjects.push({ x: 400, y: 500, width: 48, height: 48, question: 'Escribe la palabra "secreto" para continuar', answer: 'secreto' });
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
    this.interactingWith = null;
  }

  checkAnswer() {
    const userAnswer = this.answerEl.value.toLowerCase().trim();
    if (userAnswer === this.currentCorrectAnswer) {
      this.feedbackEl.textContent = '¡Correcto!';
      setTimeout(() => this.hideDialog(), 1000);
    } else {
      this.feedbackEl.textContent = 'Respuesta incorrecta. Intenta de nuevo.';
    }
  }

  showMinigame(minigame) {
    this.interactingWith = this.targetObject;
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
    }
  }

  initMinigame() {
    // No longer needed for drag and drop
  }

  checkMinigame() {
    const userAnswer = document.getElementById('snake-answer').value.toLowerCase().trim();
    if (userAnswer === this.currentSnake.type) {
      this.minigameFeedbackEl.textContent = '¡Correcto! Has clasificado correctamente la serpiente.';
      setTimeout(() => this.hideDialog(), 2000);
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
        setTimeout(() => this.hideDialog(), 3000);
    } else {
        this.minigameUnsupervisedFeedbackEl.textContent = 'Incorrecto. Intenta agruparlos de otra manera.';
    }
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
    // this.interactiveObjects.forEach(obj => {
    //   if (this.interactiveObjectSprite) {
    //     this.ctx.drawImage(
    //       this.interactiveObjectSprite,
    //       obj.x - this.camera.x,
    //       obj.y - this.camera.y,
    //       obj.width,
    //       obj.height
    //     );
    //   }
    // });

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