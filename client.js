import dgram from "node:dgram";

import conf from "./config.js";
import * as readline from "readline";

// creating a client socket
const client = dgram.createSocket("udp4");

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
      // exit process if exit
      if (answer == "exit") return process.exit();
      // get all requests
      let requestedFiles = answer.split(" ");
      numberOfReqs = requestedFiles.length;
      // iterate thru & send to server
      for (let i = 0; i < numberOfReqs; i++) {
        let data = Buffer.from(requestedFiles[i]);
        sendMessage(data);
      }
      resolve(answer);
    });
  });
}

async function handleServerInput() {
  await readLineAsync(
    "what would you like to query?\nLeave spaces between files to serve more than one\n"
  );
}

// initial ask for user input
handleServerInput();

client.on("message", (msg, info) => {
  console.log("Data received from server : " + msg.toString());
  console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port
  );
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
  client.send(data, conf.port, conf.serverHost, (error) => {
    if (error) {
      console.log(error);
      client.close();
    } else {
      console.log(
        "single msg sent to ingress from ",
        conf.serverHost,
        conf.port
      );
    }
  });
}
