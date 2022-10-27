import dgram from "node:dgram";

import conf from "./config.js";
import * as readline from "readline";

import fs from "fs";
var files = fs.readdirSync("./filesToReturn");

console.log("creating worker");
// creating a worker socket
const worker = dgram.createSocket("udp4");

// Setup readline functionalities
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// var for how many file reqs sent at once, used to prompt user input again
let fileReturned;

function readLineAsync(message) {
  return new Promise((resolve, reject) => {
    rl.question(message, (answer) => {
      const underCaseAnswer = answer.toLowerCase();

      // exit process if exit
      if (underCaseAnswer == "exit") sendCloseDownMessage();
      else {
        if (underCaseAnswer.includes("1") || underCaseAnswer.includes("refunk"))
          fileReturned = 0;
        else if (
          underCaseAnswer.includes("2") ||
          underCaseAnswer.includes("weeve")
        )
          fileReturned = 1;
        else if (
          underCaseAnswer.includes("3") ||
          underCaseAnswer.includes("pic")
        )
          fileReturned = 2;
        else {
          console.log("That is not valid input. try again\n");
          handleServerInput(
            "What file will this worker forward?\n1. refunk\n2. weeve\n3. picture\n\n"
          );
        }
        sendSetUpMessage(fileReturned);
        handleServerInput("\ntype 'exit' to quit\n");
      }
      // send init msg
      resolve(answer);
    });
  });
}

async function handleServerInput(msg) {
  await readLineAsync(msg);
}

// initial ask for user input
handleServerInput(
  "What file will this worker forward?\n1. refunk\n2. weeve\n3. picture\n\n"
);

worker.on("message", (msg, info) => {
  console.log("Data received from server : " + msg.toString());
  let particularFile;
  switch (fileReturned) {
    case 0:
      particularFile = "refunk.txt";
      break;
    case 1:
      particularFile = "weeve.txt";
      break;
    case 2:
      particularFile = "basic_pic.jpg";
      break;
    default:
  }

  const contents = fs.readFileSync(`./filesToReturn/${particularFile}`, {
    encoding: "base64",
  });

  sendFileMessage(msg, contents);
});

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

function sendFileMessage(msg, file) {
  console.log("sending file ");
  console.log("client id is " + msg[2]);
  // create header
  const header = new Uint8Array(3);
  // since worker returning file, first header byte is 3
  header[0] = 3;
  // set second headerbyte to file to be returned
  header[1] = fileReturned;
  header[2] = msg[2];
  const data = Buffer.from(header);

  //sending msg
  worker.send([data, file], conf.port, conf.serverHost, (error) => {
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

function sendCloseDownMessage(fileToReturn) {
  // create header
  const header = new Uint8Array(2);
  // since worker close down, first header byte is 5
  header[0] = 5;
  // set second headerbyte to file to be returned
  header[1] = fileToReturn;
  const data = Buffer.from(header);
  console.log("sending close down client");

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
      worker.close();
      process.exit();
    }
  });
}
