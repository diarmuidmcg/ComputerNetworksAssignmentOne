import dgram from "node:dgram";

import conf from "./config.js";
// creating a client socket
const client = dgram.createSocket("udp4");

//buffer msg
let data = Buffer.from("refunk.txt");

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

data = Buffer.from("second.txt ");
client.send(data, conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
  }
});
data = Buffer.from("third.txt ");
client.send(data, conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
  }
});
data = Buffer.from("fourth.txt ");
client.send(data, conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
  }
});
data = Buffer.from("fifth.txt ");

client.send(data, conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
  }
});
data = Buffer.from("sixth.txt ");
client.send(data, conf.port, conf.serverHost, (error) => {
  if (error) {
    console.log(error);
    client.close();
  } else {
    console.log("single msg sent to ingress from ", conf.serverHost, conf.port);
  }
});

setTimeout(() => {
  console.log(`shutting down client due to timeout of ${conf.timeout} seconds`);
  client.close();
}, conf.timeout);
