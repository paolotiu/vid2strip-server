import multer from "multer";

const storage = multer.diskStorage({
  destination: "tmp/",
});

export const upload = multer({ storage: storage });
