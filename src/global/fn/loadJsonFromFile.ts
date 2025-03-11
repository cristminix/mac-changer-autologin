import * as fs from "node:fs";

export async function loadJsonFromFile(path:string) {
    let jsonObject : any  = {};
    try{
        const buffer = await fs.readFileSync(path, "utf8");
        jsonObject = JSON.parse(buffer)
    }catch(err){
        console.error("Could not read JSON from file: ", err);
    }
    return jsonObject;
}