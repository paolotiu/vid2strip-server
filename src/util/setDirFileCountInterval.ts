import fs from "fs";

export const setDirFileCountInterval = (path: string, ms: number) => {
  const interval = setInterval(() => {
    fs.readdir(path, (err, files) => {
      if (err) return;
      console.log(files.length);
    });
  }, ms);

  return () => clearInterval(interval);
};
