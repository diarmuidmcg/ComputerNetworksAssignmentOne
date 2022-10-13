import worker from "node:worker_threads";

worker.onconnect = function (event) {
  const port = event.ports[0];

  worker.port.onmessage = function (e) {
    const workerResult = `Result: ${e.data[0] * e.data[1]}`;
    worker.port.postMessage(workerResult);
  };
};
