import { Router } from "express";
import multer from "multer";
import path from "path";
import { saveFile } from "../controllers/fileController";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;

        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const router = Router();

router.post("/register", upload.single('file'), saveFile);

export default router;