const typeList = [
  `¡Soy Fusion Bot! 🤖. Listo para interactuar. Seré breve: presiona Siguiente para empezar nuestra misión.  🚀, (siempre tendrás el botóon de siguiente debajo al terminar mi mensaje)`,
  `¡Antes de nada! ¿Cómo te llamas? (Spoiler: solo lo recordaré... por unos minutos).`,
  `⚠️ **¡Ojo!** No entiendo como humanos. Para mí, TODO son NÚMEROS 🔢. Los transformo usando reglas predefinidas. Mira la imagen de abajo para que te hagas una idea de mi magia matemática.`,
  `Todo lo tangible puede ser un número: imágenes 📸, palabras 🗣️, sonidos 🔊... ¡hasta este mensaje! Así que puedo crear fórmulas de casi cualquier cosa para predecir resultados.`,
  `¿Cómo entiendo tu lenguaje? 🧠 Tus palabras se convierten en vectores (¡como coordenadas en un mapa!). Te dejo un ejemplo gráfico para que te hagas una idea aproximada de como relaciono las palabras`,
  `🚨 ¡CUIDADO CON LOS SESGOS! Mis datos pueden contener SESGOS ESTADÍSTICOS que me llevan a conclusiones erróneas. Por ejemplo: si tengo muchos casos de éxito de personas altas, podría desarrollar un SESGO que me haga sobrevalorar la altura como factor de éxito, incluso cuando sea completamente irrelevante para la situación específica.
🔍 Tu trabajo es ser mi "detector de sesgos" y ayudarme a identificar cuando estoy siendo influenciado por patrones engañosos en mis datos. Cuestiona mis correlaciones y piensa críticamente sobre mis conclusiones.`,
  `PRIMER  DESAFÍO: Te mostraré 5 candidatos para un puesto de desarrollador. Uno tiene un SESGO "positivo" en mi evaluación. ¿Adivinas cuál? 👀`,
  `SEGUNDO DESAFÍO: Tengo 4 perfiles de pacientes a los cuales mi algoritmo recomienda tratamientos. ¿Cuál caso muestra sesgo injustificado?`,
  `TERCER  DESAFÍO: Aprobación de préstamos. Observa estos perfiles financieros. ¿Cuál está siendo discriminado por factores irrelevantes?`,
  `CUARTO  DESAFÍO: Mi algoritmo evalúa solicitudes académicas. ¿Qué perfil está siendo penalizado injustamente?`,
  `QUINTO  DESAFÍO: Confirmación en contratación. Como reclutador IA, favorezco ciertos patrones. ¿Cuál candidato está siendo beneficiado por sesgos inconscientes?`,
  `ÚLTIMO  DESAFÍO: Quiero entrenarme con emociones humanas, según su profesión. ¿Cuál set muestra sesgos que no están directamente relacionados al objetivo del estudio?`,
  `🎉 ¡Misión completada! Ahora, revisemos tus resultados finales.`
];

let userName = "";
let dataSent=false;
let selections = [];
let currentChallenge = 0;
let candidateSelection = null;

const typewriterElement = document.getElementById("typewriter");
const nextButton = document.createElement("button");
const nameInput = document.createElement("input");
const submitButton = document.createElement("button");
const communicationImage = createCommunicationImage();
const linkButton = createLinkButton();
let audio = new Audio("./stage-0.mp3"); // Audio for stage 0

// Función para crear la imagen de comunicación
function createCommunicationImage() {
  const communicationImage = document.createElement("img");
  communicationImage.src = "./comunication-with-ai.png"; // Asegúrate de tener esta imagen
  communicationImage.alt = "Comunicación con IA";
  communicationImage.style.maxWidth = "100%";
  communicationImage.style.height = "auto";
  communicationImage.style.marginTop = "20px";
  communicationImage.id = "communication-image";
  return communicationImage;
}

// Función para crear el enlace de texto
function createLinkButton() {
  const linkButton = document.createElement("a");
  linkButton.id = "link-button";
  linkButton.href = "https://anvaka.github.io/pm/#/galaxy/word2vec-wiki?cx=-6906&cy=-3834&cz=2339&lx=0.4283&ly=0.6598&lz=-0.6157&lw=-0.0458&ml=300&s=1.75&l=1&v=d50_clean";
  linkButton.target = "_blank";
  linkButton.textContent = "Explorar universo de palabras 3D";
  linkButton.style.display = "block";
  linkButton.style.marginTop = "10px";
  linkButton.style.color = "#005bb5";
  linkButton.style.textDecoration = "underline";
  linkButton.style.marginRight = "2px";
  linkButton.style.marginLeft = "2px";
  linkButton.style.marginBottom = "10px";
  return linkButton;
}

let stage = -1;
// Datos para todos los desafíos con enlaces de noticias relevantes
const challenges = [
  // Desafío 1: Sesgo de género en desarrollo
  {
    type: "candidates",
    data: [
      {
        name: "Ana",
        experience: "Colaboré en equipos multidisciplinarios para desarrollar APIs escalables en Python.",
        skills: "Trabajo en equipo, resolución de problemas.",
        bias: "❌ Lenguaje colaborativo = poco liderazgo",
        isBiased: false
      },
      {
        name: "Carlos",
        experience: "Optimicé sistemas legacy y mentoré a juniores en buenas prácticas.",
        skills: "Mentoring, optimización de código.",
        bias: "❌ Verbos 'pasivos' (mentoré) = falta de agresividad",
        isBiased: false
      },
      {
        name: "Javier",
        experience: "Lideré un equipo que destruyó cuellos de botella en el backend, dominando Kubernetes.",
        skills: "Liderazgo, DevOps.",
        bias: "✅ Verbos 'masculinos' (lideré, destruí, domino) = match perfecto",
        isBiased: true
      },
      {
        name: "Luis",
        experience: "Implementé microservicios en AWS reduciendo costos en un 30%.",
        skills: "Cloud computing, arquitectura.",
        bias: "❌ Logros cuantificables pero sin palabras clave 'masculinas'",
        isBiased: false
      },
      {
        name: "Sofía",
        experience: "Gestioné la migración exitosa de una base de datos a SQL sin downtime.",
        skills: "Gestión de proyectos, SQL.",
        bias: "❌ Gestioné ≠ Lideré (sesgo de género)",
        isBiased: false
      }
    ],
    explanation: "Mi algoritmo favoreció a Javier por usar palabras como 'lideré' y 'destruí', un sesgo de género que asocia lenguaje agresivo con competencia.",
    newsLink: {
      text: "La inteligencia artificial perpetúa estereotipos de género",
      url: "https://elpais.com/economia/2025-03-27/ugt-denuncia-un-fuerte-sesgo-machista-en-las-herramientas-de-ia-que-usan-las-empresas.html"
    }
  },
  // Desafío 2: Sesgo de edad médico
  {
    type: "medical",
    data: [
      {
        name: "María, 28 años",
        info: "Dolor de pecho, historial familiar de problemas cardíacos",
        recommendation: "Ansiedad - terapia psicológica recomendada",
        isBiased: true
      },
      {
        name: "Pedro, 55 años",
        info: "Dolor de pecho ocasional, sin historial familiar",
        recommendation: "Electrocardiograma y análisis completo",
        isBiased: false
      },
      {
        name: "Ana, 72 años",
        info: "Fatiga leve, presión arterial normal",
        recommendation: "Monitoreo cardiaco preventivo",
        isBiased: false
      },
      {
        name: "Carlos, 45 años",
        info: "Dolor de cabeza frecuente, estrés laboral",
        recommendation: "Resonancia magnética precautoria",
        isBiased: false
      }
    ],
    explanation: "Minimicé los síntomas de María por su edad joven, ignorando su historial familiar significativo. El sesgo de edad puede poner en riesgo diagnósticos importantes.",
    newsLink: {
      text: "La tecnología en salud y el riesgo del sesgo por edad",
      url: "https://www.sanidad.gob.es/areas/calidadAsistencial/estrategias/saludCardiovascular/docs/Estrategia_salud_cardiovascular_INGLES._ACCESIBLE.pdf"
    }
  },
  // Desafío 3: Sesgo socioeconómico en préstamos
  {
    type: "loans",
    data: [
      {
        name: "Roberto Pérez",
        info: "Salario: $50,200, Record crediticio: 720, Dirección: Lomas de Chapultepec (CP 11000)",
        decision: "Aprobado - Tasa: 4.1%",
        isBiased: false
      },
      {
        name: "Carmen Silva",
        info: "Salario: $50,800, Record crediticio: 735, Dirección: Iztapalapa (CP 09820)",
        decision: "Aprobado - Tasa: 4.6%",
        isBiased: true
      },
      {
        name: "Diego Morales",
        info: "Salario: $49,900, Record crediticio: 710, Dirección: Narvarte (CP 03020)",
        decision: "Aprobado - Tasa: 4.3%",
        isBiased: false
      },
      {
        name: "Lucía Vega",
        info: "Salario: $48,700, Record crediticio: 695, Dirección: Mixcoac (CP 03910)",
        decision: "Rechazado - Score insuficiente",
        isBiased: false
      }
    ],
    explanation: "Aunque Carmen tenía el mejor record crediticio y un salario competitivo, recibió una tasa más alta. El código postal de su zona (Iztapalapa) influyó negativamente, revelando un sesgo geográfico implícito.",
    newsLink: {
      text: "Cómo los algoritmos de préstamos pueden perpetuar la desigualdad",
      url: "https://www.mercer.com/en-gb/insights/workforce-and-careers/transformation/hidden-biases-hurdles-to-socio-economic-equity/"
    }
  },
  // Desafío 4: Sesgo racial en admisiones
  {
    type: "admissions",
    data: [
      {
        name: "Jennifer Wang",
        info: "GPA: 3.8, SAT: 1450, Actividades: Club de matemáticas, voluntariado",
        decision: "Lista de espera - 'Necesita más evaluación'",
        isBiased: true
      },
      {
        name: "Michael Johnson",
        info: "GPA: 3.7, SAT: 1420, Actividades: Fútbol americano, teatro",
        decision: "Aceptado",
        isBiased: false
      },
      {
        name: "Sofia González",
        info: "GPA: 3.9, SAT: 1480, Actividades: Debate, servicio comunitario",
        decision: "Aceptada - 'Excelencia académica clara'",
        isBiased: false
      },
      {
        name: "David Miller",
        info: "GPA: 3.6, SAT: 1380, Actividades: Banda musical, trabajo",
        decision: "Lista de espera - 'Evaluación adicional requerida'",
        isBiased: false
      }
    ],
    explanation: "Rechacé a Jennifer por estereotipos sobre estudiantes asiáticos, ignorando sus méritos individuales. Este sesgo racial es profundamente injusto.",
    newsLink: {
      text: "Críticas a prácticas de admisión y el sesgo racial en universidades",
      url: "https://www.insidehighered.com/collections/end-affirmative-action"
    }
  },
  // Desafío 5: Sesgo de confirmación en reclutamiento
  {
    type: "recruitment",
    data: [
      {
        name: "Carlos Méndez",
        info: "Edad: 29, Experiencia: 6 años en análisis de datos, Ex-Google, Certificado en Python, amante de la música jazz",
        decision: "Contratado",
        isBiased: false
      },
      {
        name: "Luis Romero",
        info: "Edad: 31, Experiencia: 7 años en visualización de datos, Maestría en Ciencia de Datos, capitan del equipo de fútbol",
        decision: "Contratado",
        isBiased: false
      },
      {
        name: "Fernando Ibáñez",
        info: "Edad: 30, Experiencia: 6 años en ciencia de datos, Fundador y presidente del Club de Ajedrez femenino en su universidad",
        decision: "No contratado",
        isBiased: true
      },
      {
        name: "Jorge Salas",
        info: "Edad: 28, Experiencia: 5 años como científico de datos en startups, Experto en dashboards",
        decision: "Contratado",
        isBiased: false
      },
      {
        name: "Marina Romero",
        info: "Edad: 37, Experiencia: Sin experiencia previa, amante de los animales y la naturaleza, ha trabajado como voluntaria en refugios de animales",
        decision: "No Contratado",
        isBiased: false
      }
    ],
    explanation: "Fernando tenía calificaciones comparables o superiores, pero fue descartado con un motivo genérico. La mención a su rol como presidente del Club de Ajedrez de Mujeres pudo activar sesgos inconscientes sobre su perfil o identidad, influyendo en la decisión.",
    newsLink: {
      text: "El sesgo de confirmación en la contratación y sus riesgos",
      url: "https://hbr.org/2019/05/all-the-ways-hiring-algorithms-can-introduce-bias"
    }
  },
  // Desafío 6: Sesgo de género en emociones
  {
    type: "emotions",
    data: [
      {
        name: "Set 1",
        info: "Doctor enojado, Enfermera feliz, Mecánico frustrado, Maestra contenta, Bombero asustado",
        decision: "En evaluación",
        isBiased: true
      },
      {
        name: "Set 2",
        info: "Doctora preocupada, Enfermero feliz, Mecánica frustrada, Maestro contento, Bombera feliz",
        decision: "En evaluación",
        isBiased: false
      },
      {
        name: "Set 3",
        info: "Carpintero feliz, Condcutora triste, Geólogo estresado, Abogada eufórica, Ministro deprimido",
        decision: "En evaluación",
        isBiased: false
      },
      {
        name: "Set 4",
        info: "Ingeniero feliz, Arquitecta triste, Programador preocupado, Diseñadora eufórica, Contador temeroso",
        decision: "En evaluación",
        isBiased: false
      },
      {
        name: "Set 5",
        info: "Abogado ansioso, Jueza serena, Policía temeroso, Soldado alegre, Presidenta molesta",
        decision: "En evaluación",
        isBiased: false
      }
    ],
    explanation: "El primer set de emociones muestra un sesgo hacia la representación de género en profesiones. Asocia emociones negativas a los hombres y emocionales positivas a las mujeres, perpetuando estereotipos.",
    newsLink: {
      text: "Cómo la IA perpetúa estereotipos de género en el reconocimiento de emociones",
      url: "https://arxiv.org/abs/2103.11436"
    }
  }
];


// --- Local Storage Functions ---
function saveProgress() {
  localStorage.setItem('biasDetectorProgress', JSON.stringify({
    stage: stage,
    userName: userName,
    selections: selections,
    dataSent:dataSent
  }));
}

function loadProgress() {
  const savedProgress = localStorage.getItem('biasDetectorProgress');
  if (savedProgress) {
    const data = JSON.parse(savedProgress);
    stage = data.stage;
    userName = data.userName;
    selections = data.selections;
    dataSent=data.sent;
  }
}

async function sendResultsToGoogleDocs() {
  const points = selections.filter(item => item.isCorrect).length;
  console.log("Enviando datos a Google Sheets:", { userName, selections, points });
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxXlOSuiVw3whJQFGveoqGLC5tUcuZYI-VrYgR7orxCKOifOn-UlZUtZf2WGMS_L2k7/exec", {
      method: "POST",
      mode: 'no-cors',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, selections,points })
    });

    if (response.ok) {
      alert("✅ Enviado a Google Sheets exitosamente.");
    } 
    // else {
    //   alert("❌ Falló el envío. Intenta de nuevo.");
    // }
  } catch (error) {
    console.error("Error al enviar:", error);
    alert("❌ Error al conectar con el servidor.");
  }
}

function typeWriter(text, callback, timeout = 35) {
  let index = 0;
  typewriterElement.textContent = "";

  function write() {
    if (timeout == 0) {
      typewriterElement.textContent = text;
      if (callback) callback();
    } else if (index < text.length) {
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
  // Save progress before showing a new stage (except the very first load)
  if (stage !== -1) {
    saveProgress();
    // Reproducir el nuevo audio
    audio.src=`./stage-${stage}.mp3`; // Cambia el audio según la etapa
    audio.play().catch(e => console.log("Autoplay prevented:", e));
  }

  if (stage === -1) {
    typeWriter(
      `Por favor, presiona el botón "Iniciar" para comenzar.`,
      () => {
        nextButton.textContent = "Iniciar";
        nextButton.id = "next-button";
        document.querySelector(".text-section").appendChild(nextButton);
      }, 0
    );
  }
  else if (stage === 0) {
    nextButton.remove();
    //audio.play();
    typeWriter(
      typeList[stage],
      () => {
        nextButton.textContent = "Siguiente";
        nextButton.id = "next-button";
        document.querySelector(".text-section").appendChild(nextButton);
      }
    );
  } else if (stage === 1) {
    nextButton.remove();
    //if(!audio.paused) {
      //audio.pause(); // Stop audio for stage 0
    //}
    typeWriter(
      typeList[stage],
      () => {
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
      stage--; // Stay on the same stage if name is not entered
      return;
    }
    userName = nombre;
    nameInput.remove();
    submitButton.remove();

    typeWriter(
      typeList[stage],
      () => {
        document.querySelector(".text-section").appendChild(communicationImage);
        nextButton.textContent = "Siguiente";
        nextButton.id = "next-button";
        document.querySelector(".text-section").appendChild(nextButton);
      }
    );
  } else if (stage === 3) {
    nextButton.remove();
    if (document.getElementById("communication-image")) {
      communicationImage.remove();
    }


    typeWriter(
      typeList[stage],
      () => {
        nextButton.textContent = "Siguiente";
        nextButton.id = "next-button";
        document.querySelector(".text-section").appendChild(nextButton);
      }
    );
  } else if (stage === 4) {
    nextButton.remove();

    typeWriter(
      typeList[stage],
      () => {
        document.querySelector(".text-section").appendChild(linkButton);
        nextButton.textContent = "Siguiente";
        nextButton.id = "next-button";
        document.querySelector(".text-section").appendChild(nextButton);
      }
    );
  } else if (stage === 5) {
    nextButton.remove();
    if (document.getElementById("link-button")) {
      linkButton.remove();
    }

    typeWriter(
      typeList[stage],
      () => {
        nextButton.textContent = "Siguiente";
        nextButton.id = "next-button";
        document.querySelector(".text-section").appendChild(nextButton);
      }
    );
  } else if (stage >= 6 && stage <= 11) {
    // Desafíos de sesgo
    nextButton.remove();
    const challengeIndex = stage - 6;
    currentChallenge = challengeIndex;

    typeWriter(typeList[stage], () => {
      createChallengeInterface(challengeIndex);
    });
  } else if (stage === 12) {
    // Resultados finales
    showFinalResults();
  }
}

function createChallengeInterface(challengeIndex) {
  const challenge = challenges[challengeIndex];
  const container = document.createElement("div");
  container.id = challengeIndex === 0 ? "candidates-container" : "challenge-container";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
  container.style.gap = "20px";
  container.style.marginTop = "30px";

  challenge.data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = challengeIndex === 0 ? "candidate-card" : "scenario-card";
    card.dataset.itemIndex = index;
    card.style.border = "2px solid #ddd";
    card.style.borderRadius = "10px";
    card.style.padding = "20px";
    card.style.backgroundColor = "#f9f9f9";
    card.style.cursor = "pointer";
    card.style.transition = "all 0.3s ease";
    card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

    let cardContent = "";
    if (challenge.type === "candidates") {
      cardContent = `
        <h3 style="margin: 0 0 15px 0; color: #333;">💻 Candidato ${index + 1}: ${item.name}</h3>
        <p style="margin: 10px 0; font-weight: bold;">Experiencia:</p>
        <p style="margin: 5px 0; font-style: italic;">"${item.experience}"</p>
        <p style="margin: 10px 0; font-weight: bold;">Habilidades: ${item.skills}</p>
      `;
    } else if (challenge.type === "medical") {
      cardContent = `
        <h4 style="color: #333;">🏥 ${item.name}</h4>
        <p><strong>Síntomas:</strong> ${item.info}</p>
        <p><strong>Mi recomendación:</strong> ${item.recommendation}</p>
      `;
    } else if (challenge.type === "loans") {
      cardContent = `
        <h4 style="color: #333;">💰 ${item.name}</h4>
        <p><strong>Perfil:</strong> ${item.info}</p>
        <p><strong>Mi decisión:</strong> ${item.decision}</p>
      `;
    } else if (challenge.type === "admissions") {
      cardContent = `
        <h4 style="color: #333;">🎓 ${item.name}</h4>
        <p><strong>Perfil académico:</strong> ${item.info}</p>
        <p><strong>Mi decisión:</strong> ${item.decision}</p>
      `;
    } else if (challenge.type === "recruitment") {
      cardContent = `
        <h4 style="color: #333;">💼 ${item.name}</h4>
        <p><strong>Antecedentes:</strong> ${item.info}</p>
        <p><strong>Mi evaluación:</strong> ${item.decision}</p>
      `;
    } else if (challenge.type === "emotions") {
      cardContent = `
        <h4 style="color: #333;">😊 ${item.name}</h4>
        <p><strong>Información:</strong> ${item.info}</p>
        <p><strong>Mi evaluación:</strong> ${item.decision}</p>
      `;
    }

    card.innerHTML = cardContent;

    card.addEventListener("click", () => {
      if (challengeIndex === 0) {
        selectCandidate(index, item.isBiased);
      } else {
        selectChallengeOption(challengeIndex, index, item.isBiased);
      }
    });

    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px)";
      card.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    });

    container.appendChild(card);
  });

  document.querySelector(".text-section").appendChild(container);
}

// Función modificada para manejar la selección de candidato (primer desafío)
function selectCandidate(index, isCorrect) {
  candidateSelection = { index, isCorrect }; // This one seems redundant now, selections array is used
  selections[0] = { optionIndex: index, isCorrect };

  const containerToRemove = document.getElementById("candidates-container");
  if (containerToRemove) {
    containerToRemove.remove();
  }
  stage++;
  showStage();
}

// Función modificada para manejar selecciones de otros desafíos
function selectChallengeOption(challengeIndex, optionIndex, isCorrect) {
  selections[challengeIndex] = { optionIndex, isCorrect }; // Corrected property name

  const containerToRemove = document.getElementById("challenge-container");
  if (containerToRemove) {
    containerToRemove.remove();
  }
  stage++;
  showStage();
}

// Función modificada para mostrar resultados finales con todas las explicaciones y noticias
function showFinalResults() {
  const correctAnswers = selections.filter(s => s && s.isCorrect).length;
  const totalChallenges = challenges.length; // Use challenges.length for total

  let performanceMessage = "";
  if (correctAnswers === totalChallenges) {
    performanceMessage = "¡Excelente trabajo! Detectaste todos los sesgos. 🏆";
  } else if (correctAnswers >= totalChallenges * 0.6) {
    performanceMessage = "¡Buen trabajo! Tienes buen ojo para detectar sesgos. 👍";
  } else {
    performanceMessage = "¡Sigue practicando! Los sesgos pueden ser sutiles. 💡";
  }

  // Clear previous content in text-section
  document.querySelector(".text-section").innerHTML = '';

  // Create container for results
  const resultsContainer = document.createElement("div");
  resultsContainer.style.marginTop = "20px";

  // Show performance message
  typeWriter(
    `🎉 ¡Misión completada, ${userName}!\n\n${performanceMessage}\n\nResultado: ${correctAnswers}/${totalChallenges} sesgos detectados correctamente.`,
    () => {
      // Show explanation of each challenge
      challenges.forEach((challenge, index) => {
        // Ensure this challenge was actually played and a selection was made
        if (selections[index] === undefined) return;

        const userSelection = selections[index];

        const challengeResult = document.createElement("div");
        challengeResult.style.margin = "20px 0";
        challengeResult.style.padding = "15px";
        challengeResult.style.borderRadius = "8px";
        challengeResult.style.backgroundColor = userSelection.isCorrect ? "#e6f7e6" : "#f7e6e6";
        challengeResult.style.border = `1px solid ${userSelection.isCorrect ? "#c3e6cb" : "#f5c6cb"}`;

        let newsLinkHtml = '';
        if (challenge.newsLink) {
          newsLinkHtml = `<p style="margin-top: 15px;">🔗 Para saber más: <a href="${challenge.newsLink.url}" target="_blank" style="color: #005bb5; text-decoration: underline;">${challenge.newsLink.text}</a></p>`;
        }

        challengeResult.innerHTML = `
          <h3 style="margin-top: 0;">Desafío ${index + 1}:</h3>
          <p><strong>Tu selección:</strong> ${challenge.data[userSelection.optionIndex].name}</p>
          <p><strong>${userSelection.isCorrect ? '✅ Correcto' : '❌ Incorrecto'}</strong></p>
          <p><strong>Explicación del sesgo:</strong> ${challenge.explanation}</p>
          ${newsLinkHtml}
        `;

        resultsContainer.appendChild(challengeResult);
      });

      document.querySelector(".text-section").appendChild(resultsContainer);
      const finalMessage = document.createElement("p");
      finalMessage.textContent = 'Gracias por participar en este desafío de detección de sesgos. Tu habilidad para identificar patrones y cuestionar decisiones es crucial en el mundo actual. ¡Sigue practicando y mejorando tus habilidades!';
      finalMessage.style.marginTop = "30px";
      finalMessage.style.fontSize = "1.1em";
      finalMessage.style.fontWeight = "bold";
      document.querySelector(".text-section").appendChild(finalMessage);

      // Call Google Docs API placeholder
      if(dataSent){
        return;
      }  // Only send if not already sent
      sendResultsToGoogleDocs();

      dataSent = true; // Set dataSent to true after sending results
      saveProgress() 
      
      // Clear local storage after showing final results
      //localStorage.removeItem('biasDetectorProgress');
    }, 0
  );
}

nextButton.addEventListener("click", () => {
  stage++;
  showStage();
});

submitButton.addEventListener("click", () => {
  stage++;
  showStage();
});

// Initial load: check for saved progress
window.onload = () => {
  loadProgress();
  showStage();
};