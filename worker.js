import { parentPort } from "node:worker_threads";

parentPort.on("message", (textData) => {
  const solution = "solveSudoku(sudokuData)";
  parentPort.postMessage(solution);
});

// if (msg.toString().toLowerCase().includes("weeve")) {
//   response.description = "getting weeve txt";
//   response.worker = "weeve";
//   // send to weeve worker
//
//   weeveWorker.onmessage = (event) => {
//     console.log(JSON.stringify(event.data));
//     response.contentReturned = event.data;
//   };
// } else if (msg.toString().toLowerCase().includes("refunk")) {
//   // send to refunk worker
//   response.description = "getting refunk txt";
//   response.worker = "refunk";
//
//   // send to refunk worker
//   refunkWorker.onmessage = (event) => {
//     console.log(JSON.stringify(event.data));
//     response.contentReturned = event.data;
//   };
// } else {
//   // return we don't have that file, sry
//   response.description = "we don't have that file";
// }
