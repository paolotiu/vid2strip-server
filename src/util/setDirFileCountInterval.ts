import fs from "fs";

export const setDirFileCountInterval = async (path: string, ms: number) => {
  const cb = async () => {
    const files = await fs.promises.readdir(path);
    console.log(files.length);
  };
  const interval = setInterval(cb, ms);

  return () => clearInterval(interval);
};
