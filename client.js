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

let data;

function readLineAsync(message) {
  return new Promise((resolve, reject) => {
    rl.question(message, (answer) => {
      if (answer == "exit") return process.exit();
      data = Buffer.from(answer);
      sendMessage(data);
      resolve(answer);
    });
  });
}

async function handleServerInput() {
  await readLineAsync("what would you like to query?\n");
  handleServerInput();
}

handleServerInput();

//buffer msg
// let data = Buffer.from("refunk.txt");

client.on("message", (msg, info) => {
  console.log("Data received from server : " + msg.toString());
  console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port
  );
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

// data = Buffer.from("second.txt ");
// client.send(data, conf.port, conf.serverHost, (error) => {
//   if (error) {
//     console.log(error);
//     client.close();
//   } else {
//     console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
//   }
// });
// data = Buffer.from("third.txt ");
// client.send(data, conf.port, conf.serverHost, (error) => {
//   if (error) {
//     console.log(error);
//     client.close();
//   } else {
//     console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
//   }
// });
// data = Buffer.from("fourth.txt ");
// client.send(data, conf.port, conf.serverHost, (error) => {
//   if (error) {
//     console.log(error);
//     client.close();
//   } else {
//     console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
//   }
// });
// data = Buffer.from("fifth.txt ");
//
// client.send(data, conf.port, conf.serverHost, (error) => {
//   if (error) {
//     console.log(error);
//     client.close();
//   } else {
//     console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
//   }
// });
// data = Buffer.from("sixth.txt ");
// client.send(data, conf.port, conf.serverHost, (error) => {
//   if (error) {
//     console.log(error);
//     client.close();
//   } else {
//     console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
//   }
// });

// setTimeout(() => {
//   console.log(`shutting down client due to timeout of ${conf.timeout} seconds`);
//   client.close();
// }, conf.timeout);
