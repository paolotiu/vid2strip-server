import fs from "fs";

export const sortFiles = (files: string[], dir: string) => {
  if (files.length > 1) {
    const sorted = files.sort((a, b) => {
      const s1 = fs.statSync(dir + "/" + a);
      const s2 = fs.statSync(dir + "/" + b);
      return s1.ctime.getTime() - s2.ctime.getTime();
    });
    return sorted;
  } else {
    return files;
  }
};
