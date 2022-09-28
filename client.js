import dgram from "node:dgram";

import conf from "./config.js";
// creating a client socket
const client = dgram.createSocket("udp4");

//buffer msg
const data = Buffer.from("single msg sent");

client.on("message", (msg, info) => {
  console.log("Data received from server : " + msg.toString());
  console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port
  );
});

//sending msg
client.send(data, conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
  }
});

const data1 = Buffer.from("i love");
const data2 = Buffer.from("comp networks");

//sending multiple msg
client.send([data1, data2], conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("multiple msgs sent from client");
  }
});

setTimeout(() => {
  console.log(`shutting down client due to timeout of ${conf.timeout} seconds`);
  client.close();
}, conf.timeout);
