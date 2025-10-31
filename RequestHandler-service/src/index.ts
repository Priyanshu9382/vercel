import 'dotenv/config'
import express from "express";
import { S3 } from "aws-sdk";


const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_KEY,
    endpoint: process.env.ENDPOINT
})
const app = express();

app.get("/{*splat}", async (req, res) => {
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path
    const normalizedPath = filePath.replace(/^\//, "")

    const contents = await s3.getObject({
        Bucket: "vercel",
        Key: `dist/${id}/${normalizedPath}`
    }).promise();
    
    const type = normalizedPath.endsWith("html") ? "text/html" : normalizedPath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001);