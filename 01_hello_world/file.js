const fs = require("fs");

// synchronous
// fs.writeFileSync('./test.txt', 'Hey There');

// Asynchronous
// fs.writeFile("./test.txt", "Hello World", (err) => {});


// read data from a file in dir - Sync...
// const result = fs.readFileSync("./contacts.txt", "utf-8");
// console.log("Contact No : ", result);

fs.readFile("./contacts.txt", "utf-8", (err, result) => {
    if (err) {
        console.log("Error", err);
    } else {
        console.log(result);
    }
});

fs.appendFileSync("./test.txt", `${Date.now()}  \nHey There`);

fs.copyFileSync("./test.txt", "./copy.txt");