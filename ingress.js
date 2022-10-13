import dgram from "node:dgram";

import config from "./config.js";
import worker from "node:worker_threads";

// --------------------creating a udp ingress --------------------

// creating a udp ingress
const ingress = dgram.createSocket("udp4");

// emits when any error occurs
ingress.on("error", (error) => {
  console.log("udp_server", "error", error);
  ingress.close();
});

// emits on new datagram msg
ingress.on("message", (msg, info) => {
  console.log("got msg");
  // console.log(
  //   "udp_server",
  //   "info",
  //   msg.toString() +
  //     ` | Received ${msg.length} bytes from ${info.address}:${info.port}`
  // );

  // define workers (these names are completely arbitrary)
  const weeveWorker = new worker.Worker("worker.js");
  const refunkWorker = new worker.Worker("worker.js");

  // define response
  let response = {
    description: "UDP PORT TEST BY Diarmuid McGonagle",
    serverPort: config.port,
    timestamp: null,
    worker: null,
    received: {
      message: msg.toString(),
      fromIP: info.address,
      fromPort: info.port,
    },
  };

  // check if msg is requesting a txt (make all case insensitive)
  if (msg.toString().toLowerCase().includes("txt")) {
    if (msg.toString().toLowerCase().includes("weeve")) {
      response.description = "getting weeve txt";
      response.worker = "weeve";
      // send to weeve worker
      weeveWorker.onmessage = (event) => {
        console.log(`Worker said : ${event.data}`);
      };
    } else if (msg.toString().toLowerCase().includes("refunk")) {
      // send to refunk worker
      response.description = "getting refunk txt";
      response.worker = "refunk";
      // send to refunk worker
      refunkWorker.onmessage = (event) => {
        console.log(`Worker said : ${event.data}`);
      };
    } else {
      // return we don't have that file, sry
      response.description = "we don't have that file";
    }

    // send request to correct worker based on txt file
    // wait for response
    // forward that response on
  } else {
    response.description = "please specify a txt file you're looking for";
  }

  let timestp = new Date();
  response.timestamp = timestp.toJSON();

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
