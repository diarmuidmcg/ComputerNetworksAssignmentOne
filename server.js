import dgram from "node:dgram";

import config from "./config.js";

// --------------------creating a udp ingress --------------------

// creating a udp ingress
const ingress = dgram.createSocket("udp4");

let clients = [];
let workers = [];

// emits when any error occurs
ingress.on("error", (error) => {
  console.log("udp_server", "error", error);
  ingress.close();
});

// emits on new datagram msg
ingress.on("message", (msg, info) => {
  // check header for who it's from
  console.log(msg);
  console.log("msg 0 is " + msg[0]);
  console.log("msg 1 is " + msg[1]);

  console.log(info);
  const headerByteOne = msg[0];
  switch (headerByteOne) {
    // is client init
    case 0:
      clients.push(info.port);
      break;
    // is worker init
    case 1:
      handleWorkerSetup(msg[1], info.port);
      break;
    // is client msg
    case 2:
      handleClientMessage(msg, info);
      break;
    // is worker msg
    case 3:
      break;
    // is client close
    case 4:
      // remove client by port number
      clients = clients.filter((item) => item !== info.port);
      break;
    // is worker close
    case 5:
      // remove worker by port number
      workers = workers.filter((item) => item.port !== info.port);
      break;

    default:
  }
  console.log("clients are " + JSON.stringify(clients));
  console.log("workers are " + JSON.stringify(workers));
}); // end ingress.on

function handleWorkerSetup(headerByteTwo, port) {
  switch (headerByteTwo) {
    case 0:
      workers.push({ file: "refunk", port: port });
      break;
    case 1:
      workers.push({ file: "weeve", port: port });
      break;
    case 2:
      workers.push({ file: "picture", port: port });
      break;
    default:
  }
}

function handleClientMessage(msg, info) {
  const payload = new TextDecoder().decode(msg);
  const genMsg = payload.toString().toLowerCase();
  console.log("gen msg is " + genMsg);
  // check if msg is requesting a txt (make all case insensitive)
  if (genMsg.includes("txt") || genMsg.includes("jpg")) {
    console.log("has txt " + genMsg);
    // get proper port from worker list
    let worker = workers.filter((item) => genMsg.includes(item.file));
    console.log("worker is " + JSON.stringify(worker[0]));
    ingress.send(msg, worker[0].port, info.address, (error, bytes) => {
      if (error) {
        console.log("udp_server", "error", error);
        ingress.close();
      } else {
        console.log("udp_server", "info", "Data sent");
      }
    });
  } else {
    console.log("pls specify txt");
    // define response
    let timestp = new Date();
    let response = {
      description: "please specify a txt file you're looking for",
      status: 400,
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
}

function handleRequest(msg, info) {
  // define response
  let timestp = new Date();
  let response = {
    description: "UDP PORT TEST BY Diarmuid McGonagle",
    status: 0,
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
  // when it gets the file, itll return here
  worker.once("message", (fileInfo) => {
    response.description = fileInfo.description;
    response.status = fileInfo.status;
    // set content here (will prolly need to change)
    response.contentReturned = fileInfo.message;
    // convert resp to buffer
    const data = Buffer.from(JSON.stringify(response));
    //sending msg
    ingress.send(data, info.port, info.address, (error, bytes) => {
      if (error) {
        console.log("udp_server", "error", error);
        ingress.close();
      } else {
        console.log("udp_server", "info", "Data sent w msg " + msg);
      }
    });
  });
}

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
