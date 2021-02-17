import fs from "fs";
import { Emitter } from "./getSocket";

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

// update status
export const emitStatus = (emitter: Emitter) => (files: string[]) => {
  emitter("status", Math.floor((files.length / 1000) * 100) + "%");
};
