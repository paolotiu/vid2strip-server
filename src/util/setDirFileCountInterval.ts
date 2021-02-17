import fs from "fs";

export const setDirFileCountInterval = async (
  path: string,
  cb: (files: string[]) => void,
  ms: number
) => {
  const callback = async () => {
    const files = await fs.promises.readdir(path);
    cb(files);
  };
  const interval = setInterval(callback, ms);

  return () => clearInterval(interval);
};
