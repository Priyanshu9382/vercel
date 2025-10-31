import {S3} from 'aws-sdk'
import fs from 'fs'
import path from 'path'

const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_KEY,
    endpoint: process.env.ENDPOINT
})

export async function downloadS3Folder(prefix: string){
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel",
        Prefix: `${prefix}\\`
    }).promise()
    console.log("All keys in bucket:");
    allFiles.Contents?.forEach(obj => console.log(JSON.stringify(obj.Key)));
    console.log("Files found:", allFiles.Contents?.length, "Prefix:", prefix);

    
    const allPromises = allFiles.Contents?.map(async({Key})=>{
        return new Promise(async(resolve)=>{
            if(!Key){
                resolve("")
                return
            }
            const finalOutputPath = path.join(__dirname,'output',Key)
            const outputFile = fs.createWriteStream(finalOutputPath)
            const dirname = path.dirname(finalOutputPath)
            if(!fs.existsSync(dirname)){
                fs.mkdirSync(dirname,{recursive:true})
            }
            s3.getObject({
                Bucket: "vercel",
                Key: Key || "" 
            }).createReadStream().pipe(outputFile).on("finish",()=>{
                resolve("")
            })
        })
    }) || []

    await Promise.all(allPromises?.filter(x=> x !== undefined))
    
}

export async function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);

  for (const file of allFiles) {
    const relativePath = file.slice(folderPath.length + 1).replace(/\\/g, "/");

    const key = `dist/${id}/${relativePath}`;

    await uploadFile(key, file);
    console.log("Uploaded:", key);
  }
}

export const getAllFiles = (folderPath:string) =>{
    let response:string[] =[]

    const files = fs.readdirSync(folderPath)
    files.forEach(file => {
        const fullfilePath = path.join(folderPath, file)
        if(fs.statSync(fullfilePath).isDirectory()){
            response = response.concat(getAllFiles(fullfilePath))
        }else{
            response.push(fullfilePath)
        }
        });
    return response
    
}

export const uploadFile = async(fileName: string, localFilePath: string) =>{
    const fileContent = fs.readFileSync(localFilePath)
    const response = await s3.upload({
        Body:fileContent,
        Bucket:"vercel",
        Key:fileName
    }).promise()
    console.log(response);
}