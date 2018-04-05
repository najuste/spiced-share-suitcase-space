const fs = require("fs");

const knox = require("knox");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in product DO NOT FORGET TO set secrets as environment var
} else {
    secrets = require("./secrets");
}
const client = knox.createClient({
    key: secrets.awsKey,
    secret: secrets.awsSecret,
    bucket: "suitcase-space"
});

function upload(req, res, next) {
    console.log("In s3 function upload");
    if (!req.file) {
        res.sendStatus(500); //multerpart didn't work
    }
    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype, //Setting header
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read" //Setting a permition on the file
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);
    s3Request.on("response", s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if (wasSuccessful) {
            next();
            fs.unlink(req.file.path, () => {}); // deleting the file from uploads
        } else {
            console.log("Upload did not work", s3Response.statusCode); //403 creds, 404 bucketname
            res.sendStatus(500); //otherwise send error, do not move on with execution
        }
    });
}

exports.upload = upload;
