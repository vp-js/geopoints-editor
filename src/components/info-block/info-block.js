"use strict"

function createInfoBlock(elem) {
  if (!elem) throw new Error("No element provided for info messages displaying");

  // to start message disappearing by js not css due to css transition limitations
  // TODO investigate css transition interruptions more
  const fadeDelay = 2000;

  const MsgColors = {
    INFO: "lightgreen",
    WARN: "orange",
    ERR: "red"
  };
  var msgDisplayTimer;

  elem.classList.add("info", "info-hidden");

  function showMessage(bLogToConsole, color, message) {
    if (bLogToConsole) {
      console.log(message);
      message = "Intrenal error occured";
    }

    // clear current state
    clearTimeout(msgDisplayTimer);

    // to provide visual flickering/delay when display same message again
    elem.style.visibility = "hidden";

    msgDisplayTimer = setTimeout(() => {
      elem.style.color = color;
      elem.style.borderColor = color;
      elem.textContent = message;
      elem.classList.remove("info-hidden");

      elem.style.visibility = "visible";

      msgDisplayTimer = setTimeout(() => {
        elem.classList.add("info-hidden");
      }, fadeDelay);

    }, 100);
  }

  return {
    showInfo: showMessage.bind(null, false, MsgColors.INFO),
    showWarning: showMessage.bind(null, false, MsgColors.WARN),
    showError: showMessage.bind(null, true, MsgColors.ERR)
  }
}
