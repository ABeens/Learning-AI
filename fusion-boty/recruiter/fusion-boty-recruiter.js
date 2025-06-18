const typewriterElement = document.getElementById("typewriter");
const nextButton = document.createElement("button");
const nameInput = document.createElement("input");
const submitButton = document.createElement("button");
//https://robotvoicegenerator.net/
let stage = -1;

function typeWriter(text, callback,timeout=35) {
  let index = 0;
  typewriterElement.textContent = "";

  function write() {

    if(timeout==0){
      typewriterElement.textContent =text;
      callback();
    }
    else if (index < text.length) {
      typewriterElement.textContent += text.charAt(index);
      index++;
      setTimeout(write, timeout);
    } else if (callback) {
      callback();
    }
  }

  write();
}

function showStage() {
    if (stage === -1) {
    typeWriter(
      `Por favor, presiona el botón "Iniciar" para comenzar.`,
      () => {
      nextButton.textContent = "Iniciar";
      nextButton.id = "next-button";
      document.querySelector(".text-section").appendChild(nextButton);
      },0
    );
  }
  if (stage === 0) {
    nextButton.remove();

    // Reproducir audio al iniciar el typewriter
    const audio = new Audio("./stage-0.mp3");
    audio.play();

    typeWriter(
      `Soy Fusion Boty. Estoy aquí para que me ayudes a aprender, presiona siguiente para contarte mas acerca de nuestra misión juntos`,
      () => {
      nextButton.textContent = "Siguiente";
      nextButton.id = "next-button";
      document.querySelector(".text-section").appendChild(nextButton);
      }
    );
  } else if (stage === 1) {
    nextButton.remove();

    const audio = new Audio("./stage-1.mp3");
    audio.play();

    typeWriter(`Primero quiero saber cual es tu nombre.`, () => {
      nameInput.type = "text";
      nameInput.placeholder = "Tu nombre";
      nameInput.id = "name-input";
      nameInput.style.display = "block";
      document.querySelector(".text-section").appendChild(nameInput);

      submitButton.textContent = "Continuar";
      submitButton.id = "submit-name";
      document.querySelector(".text-section").appendChild(submitButton);
    });
  } else if (stage === 2) {
    const nombre = nameInput.value.trim();
    if (!nombre) {
      alert("Por favor, ingresa tu nombre.");
      return;
    }
    nameInput.remove();
    submitButton.remove();

    typeWriter(`¡Encantado de conocerte, pronto comenzaremos nuestra misión juntos. 🚀`);
  }
}

nextButton.addEventListener("click", () => {
  stage++;
  showStage();
});

submitButton.addEventListener("click", () => {
  stage++;
  showStage();
});

// Iniciar la primera pantalla
window.onload = showStage;
