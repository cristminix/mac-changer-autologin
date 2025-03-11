import * as fs from "node:fs";

export async function saveJsonObjectToFile(path: string, data: any) {
  let jsonObject: any = {};
  let validated = false;
  try {
    const buffer = await fs.readFileSync(path, "utf8");
    jsonObject = JSON.parse(buffer);
    if (typeof data === "object") {
      const dataKeys = Object.keys(data);
      for (const key of dataKeys) {
        jsonObject[key] = data[key];
      }
    }
    // console.log({ jsonObject });

    validated = true;
  } catch (err) {
    console.error("Could not read JSON from file: ", err);
  }
  if (validated) {
    console.log("Saved JSON to file: ", path);
    await fs.writeFileSync(path, JSON.stringify(jsonObject, null, 2));
  }
  return jsonObject;
}
