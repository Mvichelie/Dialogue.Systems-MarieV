import { assign, createActor, setup, not} from "xstate";
import { speechstate } from "speechstate";
import { createBrowserInspector } from "@statelyai/inspect";
import { KEY} from "./azure.js";

const inspector = createBrowserInspector();

const azureLanguageCredentials = {
  endpoint: "https://m-v-lab3.cognitiveservices.azure.com/language/:analyze-conversations?api-version=2022-10-01-preview",
  key: KEY,
  deploymentName: "Game",
  projectName: "Game",
};

const azureCredentials = {
  endpoint: "https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
  key: KEY
};

const settings = {
  azureLanguageCredentials: azureLanguageCredentials,
  azureCredentials: azureCredentials,
  asrDefaultCompleteTimeout: 0,
  asrDefaultNoInputTimeout: 5000,
  locale: "en-US",
  ttsDefaultVoice: "en-US-EmmaNeural",
};

const correctChoices = {
   dolphin: {right: "Dolphin"},
   remote: {right: "Remote"},
   mirror: {right: "Mirror"},
   falafel: {right: "Falafel"},
    sofa: {right: "Sofa"},
    laptop: {right: "Laptop"},
    ticket: {right: "Ticket"},
    dough: {right: "Dough"}, 
}
 
function iscorrectChoices(utterance) {
    return (utterance.toLowerCase() in correctChoices);
  }

function getRight(utterance) {
    return (correctChoices [utterance.toLowerCase()] || {}).right; 
}

// function correctIntent(event) {     
//     return event === "right";
//   }
  
//   function incorrectIntent(event) {  
//     return event === "wrong";
//   }

const sceneChoices = {
    1: ["Dolphin", "Banana", "Lizard"],
    2: ["Guitar", "Remote", "Chair"],
    3: ["Mirror", "Water", "Candy"],
    4: ["Clock", "Falafel", "Pen"],
    5: ["Sofa", "Drums", "Pillow"],
    6: ["Trumpet", "Burger", "Laptop"],
    7: ["Ticket", "Microphone", "Dog"],
    8: ["Phone", "Dough", "Light"]
  };
  

const dmMachine = setup({
    actions: {
        listenForUsersAnswer : ({ context }) => {
          console.log("Listening for user's answer...");
          context.ssRef.send({ type: "LISTEN" });
        },
    
        speakToTheUser : ({ context}, params) => {
          console.log("Speaking to the user:", params);
          context.ssRef.send({ type: "SPEAK", value: { utterance: params } });
        },
        
        assignLastUtterance : assign({
          user_utterance: ({context, event}) => {
            console.log("Assigning last utterance:", event.value[0].utterance);
            return event.value[0].utterance;
          }
        }),
        displayOptions: ({ context }) => {
            const optionsContainer = document.getElementById("options");
            optionsContainer.innerHTML = "";
            
            let optionsHTML = ""; 
            
            const choices = sceneChoices[context.currentScene];
            const updateLastUtterance = assign({
              lastUtterance: (context, event) => event.data.utterance 
            });
            optionsHTML += `<div class="options-container">`;
            for (const choice of choices) {
              optionsHTML += `<button class="item-option">${choice}</button>`;
            }
            optionsHTML += `</div>`;
            
            optionsContainer.innerHTML = optionsHTML;
            console.log("Choices for Scene", context.currentScene, ":", choices.join(", "));
          },
      
          clearOptions: () => {
            const optionsContainer = document.getElementById("options");
            optionsContainer.innerHTML = "";
          },

    }}).createMachine({
        /** @xstate-layout N4IgpgJg5mDOIC5QBECyA6ACgJzABwENcBiAQQGUAlAFWvIH1KBRU5ATQG0AGAXUVDwB7WAEsALiMEA7fiAAeiAIwBOAOwAaEAE8li1egCsAXyOa06AOoFx1QeTFExxAMIAZAJLOA0tz5IQQqIS0rIKCCpc6ABMBpo6CAYAHAAs0camIOY4ggC2eGKkUhCksADWWNi5+cTkmCxe9M4A8qiYrkzUTL6ygeKSMv5hyar6qrHaiABsk4roitMLiwsmZhjZeQVFJeXbxMzNAOIAcu7kTMjd-r3BA6Bh04mGkzFxiAYGiiuZa5UbhcVldC7Wr1RotNodLq8HrCPohQZKSbJV4IZKKZJfczIaRgFwebyXASwm6hRHIiYJADMlPQYxMGSkgggcFkaBhQX6pIQAFpJijeZifvgiGB2XDbvJEMkoijErN0qtLNYxLZ7I4xSSEQkNBSkqk6Rksr98v9thrOVqoqp9eN4slJjTkspncoopTVFxJlwDMNBRUqpsAeV1vlzfC7ohKVEorTbVNKY95ktk36Q4HtkCymGJfdJgZ0JSDMp3XGEHmaTE-dipKKrsSLRGEjKKdLIlxEtTO13qfSjEA */
        context: {
          user_utterance: "",   
          currentScene: 1,

        },
        id: "dmMachine",
        initial: "Prepare",
        states: {
          Prepare: {
            entry: [
              assign({
                ssRef: ({ spawn }) => spawn(speechstate, { input: settings }),
              }),
              ({ context }) => context.ssRef.send({ type: "PREPARE" }),
            ],
            on: { ASRTTS_READY: "WaitToStart" },
          },
      
          WaitToStart: {
            on: {
              CLICK: "Greeting",
            },
            // after: {
            //   10000: { target: "Greeting"}
            // },
          },
      
          Greeting: {
              entry: [{ type: "speakToTheUser", params: `Welcome player!`}],
                
              on: {
                SPEAK_COMPLETE : "InstructionsSpeak"
              }
          },
          InstructionsSpeak: {
            entry: [{ type: "speakToTheUser", 
            params: `We’re going to go inside a music room, in order for you to come, you need to bring certain items with you, but there is a twist, you can only come inside the music room if the item you’re bringing is ‘accepted’. These items have a specific pattern, your goal is to try to pick the right item and find the pattern of why these items are 'accepted'.`,
                }],
            on: {
            SPEAK_COMPLETE : "Scene1",
            },
        },
          Scene1: {
            entry: ["displayOptions",
              { type: "speakToTheUser", 
            params: `Please choose an item: dolphin, banana or lizard`,
                }
              ],
            on: {
            SPEAK_COMPLETE : "Scene1listen",
            },
        },
      
        Scene1listen: {
            entry: "listenForUsersAnswer",
            on: {
              RECOGNISED : [{ 
                guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
                actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
                target: "VerificationSpeak" },
                {
                actions: [{type: "speakToTheUser", params:  `The item is not correct`}], //
                target: "Reraise1"} 
              ],  
              ASR_NOINPUT: "Noinput"   
            },
          },
          Noinput: {
            entry: [{ type: "speakUser", params: `Hello player, can you repeat your answer?` }],
            on: { SPEAK_COMPLETE: "Scene1" }
          },

          Reraise1: {
            entry: [{ type: "speakToTheUser", 
            params: 
             `Please say the item you want to bring with you, dolphin, banana or lizard?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene1listen",
            },
        },  

        VerificationSpeak: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => `${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene2",
          },
        },  
        Scene2: {
            entry: ["displayOptions",
              { type: "speakToTheUser", 
            params: `Now we have a dolphin, please say the next item that you want to bring with you: guitar, remote or chair?`,
                }
              ],
            on: {
            SPEAK_COMPLETE : "Scene2listen",
            },
        },

        Scene2listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak2" },
              {
              actions: [{type: "speakToTheUser", params:({ context }) =>  `The item ${(context.user_utterance)} is not correct`}], //this is what have worked for me initially, but i jsut added reraise1
              target: "Reraise2"}
            ],     
           },
          },

         VerificationSpeak2: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => ` ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene3",
          },
        }, 
        Reraise2: {
            entry: [{ type: "speakToTheUser", 
            params: `Please say the item you want to bring with you, guitar, remote or chair ?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene2listen",
            },
        },
        Scene3: {
            entry: ["displayOptions",
            { type: "speakToTheUser", 
            params: `Now we have a dolphin and a remote, please say the third item that you would like to bring: mirror, water or candy?`,
                }
              ],
            on: {
            SPEAK_COMPLETE : "Scene3listen",
            },
        },

        Scene3listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak3" },
              {
              actions: [{type: "speakToTheUser", params:  `The item is not correct`}], 
              target: "Reraise3"}
            ],     
           },
          },

         VerificationSpeak3: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => `The item  ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene4",
          },
        }, 
        Reraise3: {
            entry: [{ type: "speakToTheUser", 
            params: `Please say the item you want to bring with you, mirror, water or candy?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene3listen",
            },
        },

        Scene4: {
            entry: ["displayOptions",
            { type: "speakToTheUser", 
            params: `Now we have dolphin, remote, and mirror,  please say the fourth item that you would like to bring: Clock, Falafel or Pen?`,
                }
              ],
            on: {
            SPEAK_COMPLETE : "Scene4listen",
            },
        },

        Scene4listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak4" },
              {
              actions: [{type: "speakToTheUser", params:  `The item is not correct`}], //this is what have worked for me initially, but i jsut added reraise1
              target: "Reraise4"}
            ],     
           },
          },

         VerificationSpeak4: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => ` ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene5",
          },
        }, 
        Reraise4: {
            entry: [{ type: "speakToTheUser", 
            params: `Please say the item you want to bring with you: Clock, Falafel or Pen??` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene4listen",
            },
        },
        Scene5: {
            entry: ["displayOptions",
            { type: "speakToTheUser", 
            params: `Now we have dolphin, remote, mirror and falafel, do you see the pattern? please say the fifth item that you would like to bring: sofa, drums or pillow?`,
                }
              ],
            on: {
            SPEAK_COMPLETE : "Scene5listen",
            },
        },

        Scene5listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak5" },
              {
              actions: [{type: "speakToTheUser", params:  `The item is not correct`}],
              target: "Reraise5"}
           ],     
         },
        },

         VerificationSpeak5: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => `The item  ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene6",
          },
        }, 
        Reraise5: {
            entry: ["displayOptions",
            { type: "speakToTheUser", 
            params: `Please say the item you want to bring with you, sofa, drums or pillow?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene5listen",
            },
        },

        Scene6: {
            entry: [{ type: "speakToTheUser", 
            params: `For the sixth item, i will let you think if you have figured out the pattern, please say the item that you would like to bring: trumpet, burger or laptop ?`,
                }],
            on: {
            SPEAK_COMPLETE : "Scene6listen",
            },
        },

        Scene6listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak6" },
              {
              actions: [{type: "speakToTheUser", params:  `The item is not correct`}], //this is what have worked for me initially, but i jsut added reraise1
              target: "Reraise6"}
            ],     
           },
          },
         VerificationSpeak6: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => `The item  ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene7",
          },
        }, 
        Reraise6: {
            entry: [{ type: "speakToTheUser", 
            params: `Please say the item you want to bring with you,  trumpet, burger or laptop ?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene6listen",
            },
        },


        Scene7: {
            entry: [
              "displayOptions",
              { type: "speakToTheUser", 
            params: `For the seventh item, please say the item that you would like to bring: ticket, microphone or dog?`,
                }],
            on: {
            SPEAK_COMPLETE : "Scene7listen",
            },
        },
        Scene7listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak7" },
              {
              actions: [{type: "speakToTheUser", params:  `The item is not correct`}], //this is what have worked for me initially, but i jsut added reraise1
              target: "Reraise7"}
            ],     
           },
        },
         VerificationSpeak7: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => `The item  ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene8",
          },
        }, 
        Reraise7: {
            entry: [{ type: "speakToTheUser", 
            params: `Please say the item you want to bring with you, ticket, microphone or dog ?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene7listen",
            },
        },

        Scene8: {
            entry: ["displayOptions",
            { type: "speakToTheUser", 
            params: `What is the last item that you want to bring with you: phone, dough or light?`,
                }],
            on: {
            SPEAK_COMPLETE : "Scene8listen",
            },
        },

        Scene8listen: {
          entry: "listenForUsersAnswer",
          on: {
            RECOGNISED : [{ 
              guard: ({event}) => iscorrectChoices(event.value[0].utterance), 
              actions: assign({user_utterance: ({context, event}) => event.value[0].utterance}),
              target: "VerificationSpeak8" },
              {
              actions: [{type: "speakToTheUser", params:  `The item is not correct`}], //this is what have worked for me initially, but i jsut added reraise1
              target: "Reraise8"}
            ],     
           },
          },

         VerificationSpeak8: {
            entry: [{ type: "speakToTheUser", 
            params: ({ context }) => `The item  ${getRight(context.user_utterance)} is correct! `,
                }],
            on: { 
              SPEAK_COMPLETE: "Done",
          },
        }, 
        Reraise8: {
            entry: [{ type: "speakToTheUser", 
            params: `Please say the item you want to bring with you,  trumpet, burger or laptop ?` ,
                }],
            on: { 
              SPEAK_COMPLETE: "Scene8listen",
            },
        },



        Done: {
            entry: [{ type: "say", 
            params: `Congratulations! You can now enter the music room with the following items: dolphin, remote, mirror, falafel, sofa, laptop, ticket and a dough did you figure out the pattern?  Well done!`,
              }],
            on : {SPEAK_COMPLETE : "#dmMachine.Done"}  
        },
    


    },
})

const dmActor = createActor(dmMachine, {
  inspect: inspector.inspect,
}).start();

dmActor.subscribe((state) => {
  /* if you want to log some parts of the state */
});

export function setupButton(element) {
  element.addEventListener("click", () => {
    dmActor.send({ type: "CLICK" });
  });


//   dmActor.getSnapshot().context.ssRef.subscribe((snapshot) => {
//     element.innerHTML = `${snapshot.value.AsrTtsManager.Ready}`;
//   });
}

export {dmMachine}