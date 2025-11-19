const fs = require("fs");

// synchronous
// fs.writeFileSync('./test.txt', 'Hey There');

// Asynchronous
fs.writeFile("./test.txt", "Hello World", (err) => {});