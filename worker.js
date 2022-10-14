import { parentPort } from "node:worker_threads";

import fs from "fs";
var files = fs.readdirSync("./filesToReturn");

parentPort.on("message", (textData) => {
  const solution = identifyFile(textData);
  parentPort.postMessage(solution);
});

// checks textData for a file & then either begins
// processing it or returns that it doesnt exist
function identifyFile(stringData) {
  if (files.includes(stringData)) {
    return "has file " + stringData;
  } else
    return "does NOT have file " + stringData + " in " + JSON.stringify(files);
  // now check if this name is included in list of files
}

// if needed, may need to convert txt/img files into binary so that
// they can be sent to the client. this function will do that
// convertFileToBinary()

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
