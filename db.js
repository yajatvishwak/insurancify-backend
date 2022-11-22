const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config()
const fs = require("fs");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
})
const blob = fs.readFileSync("insurance.db")
async function lol() {
    const uploaded =await s3.upload({
        Body: blob,
        Bucket: "cyclic-difficult-pink-uniform-ap-south-1",
        Key: "insurance.db",
    }).promise()
    return uploaded;
}
lol().then(uploaded => {
    console.log(uploaded);
})
