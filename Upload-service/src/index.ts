import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import simpleGit from 'simple-git'
import { getAllFiles } from './file'
import path from 'path'
import { uploadFile } from './a\ws'
import { createClient } from 'redis'
const publisher = createClient()
publisher.connect()

const app = express()
const git = simpleGit()

app.use(cors())
app.use(express.json())

function generate() {
	const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
	const length = 5;
	let id = "";
	for (let i = 0; i < length; i++) {
		id += subset[Math.floor(Math.random() * subset.length)];
	}
	return id;
}

app.post('/upload',async(req, res)=>{
    const githubUrl  = req.body.repoUrl
    if(!githubUrl){
        throw new Error("Github url is required!!")
    }
    console.log(githubUrl);
	const id = generate()
	try {
		await git.clone(githubUrl,`out/${id}`) 
		console.log("repo cloned");
		
	} catch (error) {
		console.log(error);	
	}
	const allFilePath = getAllFiles(path.join(__dirname,'..',`out/${id}`))
	allFilePath.forEach(async file=>{
		await uploadFile(file.substr(__dirname.length), file);
	})

	await publisher.lPush('build-queue', id)
    res.json({
		id: id,
		message: "Repo Uploaded successfully!!",
		statuscode: 200
	})
})

app.listen(3000)