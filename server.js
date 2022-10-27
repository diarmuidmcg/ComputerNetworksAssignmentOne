import dgram from "node:dgram";

import config from "./config.js";

// --------------------creating a udp ingress --------------------

// creating a udp ingress
const ingress = dgram.createSocket("udp4");

let clients = [];
let workers = [];

let availableClients = [0, 1, 2, 3, 4, 5, 6, 7];
let takenClients = [];

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
      const clientId = availableClients.pop();
      takenClients.push(clientId);
      clients.push({ port: info.port, index: clientId });
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
      handleWorkerFile(msg, info);
      break;
    // is client close
    case 4:
      // remove client by port number
      clients = clients.filter((item) => item.port !== info.port);
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
  // check if msg is requesting a txt (make all case insensitive)
  if (genMsg.includes("txt") || genMsg.includes("jpg")) {
    // get proper portId from client list
    let client = clients.filter((item) => item.port === info.port);
    let clientPortId = client[0].index;

    // create header
    const header = new Uint8Array(3);
    // since worker returning file, first header byte is 3
    header[0] = 6;
    header[2] = clientPortId;

    const data = Buffer.from(header);
    // get proper port from worker list
    let worker = workers.filter((item) => genMsg.includes(item.file));
    ingress.send(data, worker[0].port, info.address, (error, bytes) => {
      if (error) {
        console.log("udp_server", "error", error);
        ingress.close();
      } else {
        console.log("udp_server", "info", "Data sent");
      }
    });
  } else {
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

function handleWorkerFile(msg, info) {
  const portId = msg[2];
  let client = clients.filter((item) => item.index === portId);

  const payload = new TextDecoder().decode(msg);

  // create header
  const header = new Uint8Array(2);
  // since worker setup, first header byte is 1
  header[0] = 7;
  // set second headerbyte to file to be returned
  header[1] = msg[1];
  const data = Buffer.from(header);

  //sending msg
  ingress.send(
    [data, payload],
    client[0].port,
    info.address,
    (error, bytes) => {
      if (error) {
        console.log("udp_server", "error", error);
        ingress.close();
      } else {
        console.log("udp_server", "info", "Data sent w msg " + msg);
      }
    }
  );
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
