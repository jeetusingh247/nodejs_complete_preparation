import crypto from "crypto";

console.log("ACCESS_TOKEN_SECRET = " + crypto.randomBytes(64).toString("hex"));
console.log("REFRESH_TOKEN_SECRET = " + crypto.randomBytes(64).toString("hex"));
