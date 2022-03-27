import { promises as fs } from "fs";
import path from "path";

export async function readJsonFromDataFolder(
  filepath: string
): Promise<string | null> {
  const directory = path.join(process.cwd(), "src", "data", "json");
  const fileFullPath = path.join(directory, filepath);
  console.log("reading json from filepath:", fileFullPath);
  try {
    const fileContent = await fs.readFile(fileFullPath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.log("error reading file", error);
    return null;
  }
}
