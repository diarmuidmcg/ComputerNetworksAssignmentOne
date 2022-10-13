import dgram from "node:dgram";

import config from "./config.js";
import { Worker, isMainThread, parentPort } from "node:worker_threads";

// --------------------creating a udp ingress --------------------

const newWorker = new Worker("./worker.js");
// here create workers
// the workers will be responsible for locating the file, converting it to binary
const workerPool = [
  // Start a pool of four workers
  new Worker("./worker.js"),
  new Worker("./worker.js"),
  new Worker("./worker.js"),
  new Worker("./worker.js"),
];
const waiting = [];

// creating a udp ingress
const ingress = dgram.createSocket("udp4");

// emits when any error occurs
ingress.on("error", (error) => {
  console.log("udp_server", "error", error);
  ingress.close();
});

// emits on new datagram msg
ingress.on("message", (msg, info) => {
  // define response
  let timestp = new Date();
  let response = {
    description: "UDP PORT TEST BY Diarmuid McGonagle",
    contentReturned: null,
    serverPort: config.port,
    timestamp: timestp.toJSON(),
    worker: null,
    received: {
      message: msg.toString(),
      fromIP: info.address,
      fromPort: info.port,
    },
  };

  // check if msg is requesting a txt (make all case insensitive)
  if (msg.toString().toLowerCase().includes("txt")) {
    console.log("has txt");
    // send the req to the worker so it can get the file
    newWorker.postMessage("hello world");
    // when it gets the file, itll return here
    newWorker.once("message", (fileInfo) => {
      // set content here (will prolly need to change)
      response.contentReturned = fileInfo;
      // convert resp to buffer
      const data = Buffer.from(JSON.stringify(response));
      //sending msg
      ingress.send(data, info.port, info.address, (error, bytes) => {
        if (error) {
          console.log("udp_server", "error", error);
          ingress.close();
        } else {
          console.log("udp_server", "info", "Data sent");
          // If requests are waiting, reuse the current worker to handle the queued
          // request. Add the worker to pool if no requests are queued.
          if (waiting.length > 0) waiting.shift()(worker);
          else workerPool.push(worker);
        }
      });
    });
  } else {
    console.log("pls specify txt");
    response.description = "please specify a txt file you're looking for";
    // convert resp to buffer
    const data = Buffer.from(JSON.stringify(response));
    //sending msg
    ingress.send(data, info.port, info.address, (error, bytes) => {
      if (error) {
        console.log("udp_server", "error", error);
        ingress.close();
      } else {
        console.log("udp_server", "info", "Data sent");
      }
    });
  }
}); // end ingress.on

//emits when socket is ready and listening for datagram msgs
ingress.on("listening", () => {
  const address = ingress.address();
  const port = address.port;
  const family = address.family;
  const ipaddr = address.address;

  console.log("udp_server", "info", "ingress is listening at port " + port);
  console.log("udp_server", "info", "ingress ip :" + ipaddr);
  console.log("udp_server", "info", "ingress is IP4/IP6 : " + family);
});

//emits after the socket is closed using socket.close()
ingress.on("close", () => {
  console.log("udp_server", "info", "Socket is closed !");
});

ingress.bind(config.port);
