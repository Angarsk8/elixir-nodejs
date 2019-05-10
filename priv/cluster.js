const path = require('path');
const readline = require('readline');
const childProcess = require('child_process');

const serverPath = path.resolve(__dirname, 'server.js');
const availableCPUs = 4;
let index = 0;

if (require.main === module) {
  process.stdin.on('end', () => process.exit());

  let workers = [...Array(availableCPUs)].map(
    () => childProcess.fork(serverPath)
  );

  workers.forEach((worker) => {
    worker.on('message', (response) => {
      process.stdout.write(response);
    });
  });

  const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  readLineInterface.on('line', (line) => {
    workers[(index++) % availableCPUs].send(line);
  });
}
