import 'dotenv/config'
import {createClient} from 'redis'
import { copyFinalDist, downloadS3Folder } from './aws'
import { buildProject } from './utils'


const subscriber = createClient()
subscriber.connect()

const publisher = createClient()
publisher.connect()

async function main(){
    while(1){
        const response = await subscriber.brPop(
            "build-queue",0)
        console.log(response);
        await downloadS3Folder(`${response?.element}`)
        console.log('files downloaded')
        await buildProject(`${response?.element}`)
        await copyFinalDist(`${response?.element}`)
        
        publisher.hSet("status", `${response?.element}`, "deployed")
    }
}
main() 