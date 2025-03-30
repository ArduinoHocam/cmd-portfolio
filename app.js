import { content } from './content.js';
const command = document.getElementById("command");
const output = document.getElementById("command-output");

const commandHistory = [];
let historyIndex = 0;
let maxHistorySize = 10;
const promptPrefix = "ali@sevindik:~ $";
// const introText = `
// █████╗  ██╗     ██╗    ███████╗███████╗██╗   ██╗██╗███╗   ██╗██████╗ ██╗██╗  ██╗
// ██╔══██╗██║     ██║    ██╔════╝██╔════╝██║   ██║██║████╗  ██║██╔══██╗██║██║ ██╔╝
// ███████║██║     ██║    ███████╗█████╗  ██║   ██║██║██╔██╗ ██║██║  ██║██║█████╔╝ 
// ██╔══██║██║     ██║    ╚════██║██╔══╝  ╚██╗ ██╔╝██║██║╚██╗██║██║  ██║██║██╔═██╗ 
// ██║  ██║███████╗██║    ███████║███████╗ ╚████╔╝ ██║██║ ╚████║██████╔╝██║██║  ██╗
// ╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚══════╝  ╚═══╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═╝
                                                                                
// Type 'help' to view a list of available commands.
// `;


const introText = `

                                                                                
Type 'help' to view a list of available commands.
`;
function typeOutText(text, targetElement, speed = 3, callback = () => {}) {
    let index = 0;
  
    const interval = setInterval(() => {
      if (index < text.length) {
        targetElement.textContent += text[index];
        index++;
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        clearInterval(interval);
        callback();
      }
    }, speed);
  }
  
  function typeOutput(text, callback = () => {}) {
    const line = document.createElement("div");
    line.className = "command-output-line";
    output.appendChild(line);
  
    let index = 0;
    const speed = 5;
  
    const interval = setInterval(() => {
      if (index < text.length) {
        // Handle line breaks manually
        const char = text[index] === "\n" ? "<br>" : text[index];
        line.innerHTML += char;
        index++;
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        clearInterval(interval);
        callback();
      }
    }, speed);
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    const introBlock = document.getElementById("intro-block");
  
    typeOutText(introText, introBlock, 3, () => {
      document.querySelector(".input-container").style.display = "flex";
      command.focus();
    });
  
    document.querySelector(".input-container").style.display = "none";
  });
  
  document.addEventListener("click", () => command.focus());
  
  function addCommandToHistory(command) {
    if (command.trim() === "") return;
    commandHistory.push(command);
    if (commandHistory.length > maxHistorySize) commandHistory.shift();
    historyIndex = commandHistory.length;
  }
  
  function clearCommand(event) {
    event.value = "";
  }
  
  const isEnterKeyPressed = (event) => event.key === "Enter";
  const isDownKeyPressed = (event) => event.key === "ArrowDown";
  const isUpKeyPressed = (event) => event.key === "ArrowUp";
  const isInterruptKeyPressed = (event) => event.key.toLowerCase() === "c" && (event.ctrlKey || event.metaKey);
  const isClearKeyPressed = (event) => event.ctrlKey && ["l", "k"].includes(event.key.toLowerCase());
  const isTabKeyPressed = (event) => event.key === "Tab";
  
  const getEnterCommandResult = () => {
    const cmd = command.value.trim();
    output.innerHTML += `<div>${promptPrefix} ${cmd}</div>`;
    handleCommand(cmd);
    clearCommand(command);
  };
  
  const getUpKeyCommandResult = () => {
    if (historyIndex > 0) {
      historyIndex--;
      command.value = commandHistory[historyIndex];
    }
  };
  
  const getDownKeyCommandResult = () => {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      command.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      clearCommand(command);
    }
  };
  
  function handleAutocomplete(inputText) {
    const availableCommands = Object.keys(commandFunctions).filter(cmd => cmd !== "notfound");
    const matches = availableCommands.filter(cmd => cmd.startsWith(inputText));
    if (matches.length === 1) {
      command.value = matches[0];
    } else if (matches.length > 1) {
      typeOutput(`${matches.join("  ")}`);
    }
  }
  
  command.addEventListener("keydown", (event) => {
    if (isEnterKeyPressed(event)) getEnterCommandResult();
    if (isUpKeyPressed(event)) {
      getUpKeyCommandResult();
      event.preventDefault();
    }
    if (isDownKeyPressed(event)) {
      getDownKeyCommandResult();
      event.preventDefault();
    }
    if (isInterruptKeyPressed(event)) {
      output.innerHTML += `<div>${promptPrefix} ${command.value}<br>^C</div>`;
      clearCommand(command);
    }
    if (isTabKeyPressed(event)) {
      event.preventDefault();
      handleAutocomplete(command.value);
    }
    if (isClearKeyPressed(event)) displayClear();
  });
  
  const displayCommandNotFound = (cmd) => {
    if (cmd === "") return;
    output.innerHTML += `<div>command not found: ${cmd}</div>`;
  };
  
  const displayClear = () => {
    output.innerHTML = "";
  };
  
  const displayWhoAmI = () => {
    typeOutput("You are a passionate dev exploring the world of code.");
  };
  
  const displayHelp = () => {
    const helpText = `Available commands:\n ${Object.keys(commandFunctions).join("\n ")}`;
    typeOutput(helpText);
  };
  
  const displayProjects = () => {
    typeOutput("Here are some of my projects:", () => {
      typeOutput("- Project 1: A cool web app", () => {
        typeOutput("- Project 2: Another awesome project");
      });
    });
  };
  

  const displayFromContent = (key) => {
    const data = content[key];
    if (!data) return;
  
    if (Array.isArray(data)) {
      // Animate line by line
      const animateLines = (lines, i = 0) => {
        if (i < lines.length) {
          typeOutput(lines[i], () => animateLines(lines, i + 1));
        }
      };
      animateLines(data);
    } else {
      // Single line
      typeOutput(data);
    }
  };

  const displayAbout = () => {
    typeOutput("\nAbout me: I'm a developer who loves coding and learning new things.", () => {
      typeOutput("Feel free to explore my projects and connect with me!", () => {
        typeOutput("Email: your@email.com", () => {
          typeOutput("LinkedIn: your-linkedin-username", () => {
            typeOutput("GitHub: your-github-username\n", () => {
            });
          });
        });
      });
    });
  };
  
  const commandFunctions = {
    help: () => displayFromContent("help"),
    whoami: () => displayFromContent("whoami"),
    projects: () => displayFromContent("projects"),
    contacts: () => displayFromContent("contacts"),
    clear: displayClear,
  };
  
  function handleCommand(cmd) {
    addCommandToHistory(cmd);
    if (commandFunctions[cmd]) {
      commandFunctions[cmd](cmd);
    } else {
      displayCommandNotFound(cmd);
    }
    window.scrollTo(0, document.body.scrollHeight);
  }
