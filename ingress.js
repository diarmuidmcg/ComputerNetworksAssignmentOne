import dgram from "node:dgram";

import config from "./config.js";
import { Worker, isMainThread, parentPort } from "node:worker_threads";

// --------------------creating a udp ingress --------------------

// here create worker
// the worker will be responsible for locating the file, converting it to binary
const newWorker = new Worker("./worker.js", { workerData: "text.txt" });

// creating a udp ingress
const ingress = dgram.createSocket("udp4");

// emits when any error occurs
ingress.on("error", (error) => {
  console.log("udp_server", "error", error);
  ingress.close();
});

// emits on new datagram msg
ingress.on("message", (msg, info) => {
  console.log("got msg from client");

  // define workers (these names are completely arbitrary)

  // const refunkWorker = new Worker("./worker.js", { workerData: "my new text" });

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

  // workers job is to parse the txt file into binary

  // check if msg is requesting a txt (make all case insensitive)
  if (msg.toString().toLowerCase().includes("txt")) {
    console.log("has txt");
    newWorker.postMessage("hello world");
    newWorker.once("message", (fileInfo) => {
      // return here
      response.contentReturned = fileInfo;
      console.log("inside msg");
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
    });

    // send request to correct worker based on txt file
    // wait for response
    // forward that response on
  } else {
    console.log("pls specify txt");
    response.description = "please specify a txt file you're looking for";
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
