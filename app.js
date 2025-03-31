const command = document.getElementById("command");
const output = document.getElementById("command-output");
const portfolioAPI = `https://ognd0qs8.api.sanity.io/v2021-10-21/data/query/production?query=*[_type == "personal"][0] {
  about,
  email,
  linkedin,
  github,
  website,
  "projects": *[_type == "projects"] {
    title,
    description,
    url
  }
}`;

// TODO: add cancel to send part
function updatePromptLabel() {
  const label = document.querySelector(".input-label");
  label.textContent = sendState ? "> " : "ali@sevindik:~ $";
}

async function fetchPortfolio() {
  try {
    const res = await fetch(portfolioAPI);
    const data = await res.json();
    console.log(" Portfolio data from Sanity:", data.result);
    return data.result;
  } catch (err) {
    console.error("Failed to fetch portfolio content from Sanity:", err);
    output.innerHTML += `<div>Segmentation Fault, Core Dumped :( Try again later or contact with developer... </div>`;
    return null;
  }
}

let activeIntervals = [];
let sendState = null;
const commandHistory = [];
let historyIndex = 0;
let maxHistorySize = 10;
const promptPrefix = "ali@sevindik:~ $";
const introText = `
█████╗  ██╗     ██╗    ███████╗███████╗██╗   ██╗██╗███╗   ██╗██████╗ ██╗██╗  ██╗
██╔══██╗██║     ██║    ██╔════╝██╔════╝██║   ██║██║████╗  ██║██╔══██╗██║██║ ██╔╝
███████║██║     ██║    ███████╗█████╗  ██║   ██║██║██╔██╗ ██║██║  ██║██║█████╔╝ 
██╔══██║██║     ██║    ╚════██║██╔══╝  ╚██╗ ██╔╝██║██║╚██╗██║██║  ██║██║██╔═██╗ 
██║  ██║███████╗██║    ███████║███████╗ ╚████╔╝ ██║██║ ╚████║██████╔╝██║██║  ██╗
╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚══════╝  ╚═══╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═╝
                                                                                
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
  

  function typeRawHTML(html, callback = () => {}) {
    const line = document.createElement("div");
    line.className = "command-output-line";
    line.innerHTML = html;
    output.appendChild(line);
    output.appendChild(document.createElement("br"));
    window.scrollTo(0, document.body.scrollHeight);
    callback();
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
    activeIntervals.push(interval);
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    const introBlock = document.getElementById("intro-block");
  
    typeOutText(introText, introBlock, 3, () => {
      document.querySelector(".input-container").style.display = "flex";
      command.focus();
    });
  
    document.querySelector(".input-container").style.display = "none";
  });
  
  document.addEventListener("click", (e) => {
    const isInsideOutput = e.target.closest("#command-output");
    if (!isInsideOutput) {
      command.focus();
    }
  });  
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
    output.innerHTML += `<div>${sendState ? "> " : promptPrefix} ${cmd}</div>`;
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
      activeIntervals.forEach(clearInterval);
      activeIntervals = [];
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
  const displaySend = () => {
    sendState = { step: 'name', name: '', message: '' };
    updatePromptLabel();
    typeOutput("Enter your name:");
  };

  const displayWhoAmI = async () => {
    const data = await fetchPortfolio();
    if (!data?.about) return;
    typeOutput(data.about);
  };
  
  const displayHelp = () => {
    const helpText = `Available commands:\n ${Object.keys(commandFunctions).join("\n ")}`;
    typeOutput(helpText);
  };
  

  const displayProjects = async () => {
    const data = await fetchPortfolio();
    if (!data?.projects?.length) return;
  
    typeOutput("Here are some of my projects:\n");
    for (const project of data.projects) {
      await new Promise(resolve => {
        typeOutput(`\n- ${project.title}: \n ${project.description} (${project.url})\n\n`, resolve);
      });
    }
  };
  const displayContacts = async () => {
    const data = await fetchPortfolio();
    if (!data) return;
  
    typeOutput("Feel free to connect with me!", () => {
      typeRawHTML(`Email: <a href="mailto:${data.email}" class="terminal-link">${data.email}</a>`, () => {
        typeRawHTML(`LinkedIn: <a href="${data.linkedin}" target="_blank" class="terminal-link">${data.linkedin}</a>`, () => {
          typeRawHTML(`GitHub: <a href="${data.github}" target="_blank" class="terminal-link">${data.github}</a>`, () => {
            typeRawHTML(`Website: <a href="${data.website}" target="_blank" class="terminal-link">${data.website}</a>`);
          });
        });
      });
    });
  };
  
  const commandFunctions = {
    whoami: displayWhoAmI,
    projects: displayProjects,
    contacts: displayContacts,
    help: displayHelp,
    clear: displayClear,
    send: displaySend
  };
  
  function handleCommand(cmd) {
    addCommandToHistory(cmd);
// todo refactor this
    if (sendState) {
      if (sendState.step === 'name') {
        sendState.name = cmd;
        sendState.step = 'message';
        typeOutput(`Hello ${sendState.name}! Now enter your message:`);
        return;
      } else if (sendState.step === 'message') {
        sendState.message = cmd;

        // Fill and submit hidden form
        document.getElementById("form-name").value = sendState.name;
        document.getElementById("form-message").value = sendState.message;
        document.getElementById("message-form").submit();

        typeOutput("📬 Message sent! Thank you.");
        sendState = null;
        updatePromptLabel();
        return;
      }
    }

    if (commandFunctions[cmd]) {
      commandFunctions[cmd](cmd);
    } else {
      displayCommandNotFound(cmd);
    }

    window.scrollTo(0, document.body.scrollHeight);
  }

