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
    return convertFileToBinary(stringData);
  } else
    return {
      status: "404",
      description: "File Not Found",
      message:
        "could not locate file " + stringData + " in " + JSON.stringify(files),
    };
  // now check if this name is included in list of files
}

// if needed, may need to convert txt/img files into binary so that
// they can be sent to the client. this function will do that
function convertFileToBinary(stringData) {
  const contents = fs.readFileSync(`./filesToReturn/${stringData}`, {
    encoding: "base64",
  });

  return {
    status: "200",
    description: "File Found",
    message: contents,
  };
}
