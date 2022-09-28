import dgram from "node:dgram";

import config from "./config.js";

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
  console.log(
    "udp_server",
    "info",
    msg.toString() +
      ` | Received ${msg.length} bytes from ${info.address}:${info.port}`
  );

  let timestp = new Date();
  const response = {
    description: "UDP PORT TEST BY Diarmuid McGonagle",
    serverPort: config.port,
    timestamp: timestp.toJSON(),
    received: {
      message: msg.toString(),
      fromIP: info.address,
      fromPort: info.port,
    },
  };
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
