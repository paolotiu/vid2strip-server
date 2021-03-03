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
export const emitFileCountStatus = (emitter: Emitter) => (files: string[] | number) => {
  const fileCount = typeof files === "number" ? files : files.length;
  emitter("status", {
    event: "Frames",
    value: Math.floor((fileCount / 1000) * 100),
    message: "Extracting Frames",
  });
};
