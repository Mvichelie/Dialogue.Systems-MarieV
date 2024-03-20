import { createActor } from "xstate";
import {dmMachine, setupButton } from "./project.js";


// Function to render options based on the current scene
function renderOptions(scene) {
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = ""; // Clear previous options

  // Get options for the current scene
  const choices = getOptionsForScene(scene);

  // Generate buttons for each choice
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.classList.add("item-option");
    button.dataset.item = choice.toLowerCase();
    optionsContainer.appendChild(button);
  });
}


function getOptionsForScene(scene) {

  switch (scene) {
    case 1:
      return ["Dolphin", "Banana", "Lizard"];
    case 2:
      return ["Guitar", "Remote", "Chair"];
    case 3:
      return ["Mirror", "Water", "Candy"];
    case 4:
      return ["Clock", "Falafel", "Pen"];
    case 5:
      return ["Sofa", "Drums", "Pillow"];
    case 6:
      return ["Trumpet", "Burger", "Laptop"];
    case 7:
      return ["Ticket", "Microphone", "Dog"];
    case 8:
      return ["Phone", "Dough", "Light"];
    default:
      return [];
  }
}


// Function to handle starting the game
function startGame() {
  // Remove the start button after it's clicked
  const startButton = document.getElementById("startButton");
  startButton.remove();
  
  // Create an actor from the XState machine
  const dmActor = createActor(dmMachine).start();
  
  // // Create the instructions element
  const instructionsContainer = document.getElementById("instructionsContainer");
  instructionsContainer.textContent = "We’re going to go inside a music room, in order for you to come, you need to bring certain items with you, but there is a twist, you can only come inside the music room if the item you’re bringing is ‘accepted'. These items have a specific pattern, your goal is to try to pick the right item and find the pattern of why these items are 'accepted'.";
  
  const hint = document.getElementById("hint");
  hint.addEventListener('click', showHint)
  
  // Append the instructions element to the document body
  document.body.appendChild(instructionsContainer);
  
  // Send a START event to the state machine to begin the game
  dmActor.send({ type: "START" });

  
  // Listen for state transitions and render options based on the current scene
  dmActor.subscribe((state) => {
    renderOptions(state.context.currentScene);
  });

}  

function showHint() {
  const hint = document.getElementById("hintContainer");
  hint.textContent = "Look closely at the letters of the items, the 2nd item is dependent on the 1st, 3rd is dependent on the 2nd, and so on, remember, we are trying to go inside a music room... So la ti do ;) "
  
}

setupButton(document.getElementById("startButton"));

// Listen for clicks on the start button
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("hint").addEventListener("click", hint);

