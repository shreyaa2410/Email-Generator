console.log("Extension for google");

//see all the changes happenning in dom inside gmail to target the reply or compose and inject the button at that time
const observer = new MutationObserver((mutation) => {
  for (const mutationList of mutation) {
    const addNodes = Array.from(mutationList.addedNodes);
    const hasComposeElements = addNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('[role="dialog"],.aDh, .btC') ||
          node.querySelector('[role="dialog"],.aDh, .btC'))
    );
    if (hasComposeElements) {
      console.log("compose window detected");
      setTimeout(injectButton, 500);
    }
  }
});

//also check its subchild and decendents for observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function injectButton() {
  const exsistingButton = document.querySelector(".ai-reply-btn");

  //check for toolbar if exist or not

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  //creating the button  and adding functionality for fetching the reply
  if (exsistingButton) exsistingButton.remove();
  const replyButton = createAIButton();
  replyButton.classList.add("ai-reply-btn");
  replyButton.addEventListener("click", async () => {
    try {
      replyButton.innerHTML = "Generating...";
      replyButton.disabled = true;

      //fetch the email content from gmail to generate the reply
      const emailContent = getEmailContent();
      const response = await fetch("http://localhost:8080/api/mail/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "Professional",
        }),
      });

      if (!response.ok) {
        throw new Error("API Request Failed");
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );

      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, generatedReply);
      } else {
        console.error("Compose box was not found");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to generate reply");
    } finally {
      replyButton.innerHTML = "AI Reply";
      replyButton.disabled = false;
    }
  });
   //   adding the toolbar with the btn
   toolbar.insertBefore(replyButton, toolbar.firstChild);
}

//find toolbar and return toolbar
function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];
  for (const select of selectors) {
    const toolbar = document.querySelector(select);
    if (toolbar) {
      return toolbar;
    }
    return null;
  }
}

//creating the button
function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.innerHTML = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");
  return button;
}

function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];
  for (const select of selectors) {
    const email_content = document.querySelector(select);
    if (email_content) {
      return email_content.innerText.trim();
    }
    return "";
  }
}
