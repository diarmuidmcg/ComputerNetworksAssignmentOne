import dgram from "node:dgram";

import conf from "./config.js";
import * as readline from "readline";

console.log("creating worker");
// creating a worker socket
const worker = dgram.createSocket("udp4");

// Setup readline functionalities
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// var for how many file reqs sent at once, used to prompt user input again
let numberOfReqs;

function readLineAsync(message) {
  return new Promise((resolve, reject) => {
    rl.question(message, (answer) => {
      const underCaseAnswer = answer.toLowerCase();
      let fileReturned = null;
      // exit process if exit
      if (underCaseAnswer == "exit") return process.exit();
      else if (
        underCaseAnswer.includes("1") ||
        underCaseAnswer.includes("refunk")
      )
        fileReturned = 0;
      else if (
        underCaseAnswer.includes("2") ||
        underCaseAnswer.includes("weeve")
      )
        fileReturned = 1;
      else if (underCaseAnswer.includes("3") || underCaseAnswer.includes("pic"))
        fileReturned = 2;
      else {
        console.log("That is not valid input. try again\n");
        handleServerInput();
      }
      sendSetUpMessage(fileReturned);
      // send init msg
      resolve(answer);
    });
  });
}

async function handleServerInput() {
  await readLineAsync(
    "What file will this worker forward?\n1. refunk\n2. weeve\n3. picture\n\n"
  );
}

// initial ask for user input
handleServerInput();

worker.on("message", (msg, info) => {
  console.log("Data received from server : " + msg.toString());
  const returnAsJson = JSON.parse(msg.toString());
  if (returnAsJson.status == 200) {
    // convert base 64 back to text
    let buff = new Buffer.from(returnAsJson.contentReturned, "base64");
    let text = buff.toString("ascii");
    console.log("\nFile contents are\n" + text);
  }
  // decrement since its been answered
  numberOfReqs--;
  // show input when everything answered
  if (numberOfReqs == 0) {
    console.log("\n");
    handleServerInput();
  }
});

function sendMessage(data) {
  //sending msg
  worker.send(data, conf.port, conf.serverHost, (error) => {
    if (error) {
      console.log(error);
      worker.close();
    } else {
      console.log(
        "single msg sent to ingress from ",
        conf.serverHost,
        conf.port
      );
    }
  });
}
function sendSetUpMessage(fileToReturn) {
  // create header
  const header = new Uint8Array(2);
  // since worker setup, first header byte is 1
  header[0] = 1;
  // set second headerbyte to file to be returned
  header[1] = fileToReturn;
  const data = Buffer.from(header);

  //sending msg
  worker.send(data, conf.port, conf.serverHost, (error) => {
    if (error) {
      console.log(error);
      worker.close();
    } else {
      console.log(
        "single msg sent to ingress from ",
        conf.serverHost,
        conf.port
      );
    }
  });
}
