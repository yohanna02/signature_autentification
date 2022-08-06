import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import fileModel from "../models/file_model";

export const saveFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const salt = await bcrypt.genSalt(10);

        const file = await fileModel.findOne({ email: req.body.email });

        if (file) {
            req.flash("firstname", req.body.firstname);
            req.flash("lastname", req.body.lastname);
            req.flash("email", req.body.email);
            req.flash("phonenumber", req.body.phonenumber);
            req.flash("address", req.body.address);
            req.flash("emailError", "Email already in use!");
            res.redirect("/register");
            if (req.file)
                fs.unlinkSync(req.file.path);
            return;
        }

        if (!req.file) {
            res.send('<h1>Error!!!</h1><a href="http://localhost:3000">Go Home</a>');
            return;
        }

        const hashedSignature = await bcrypt.hash(req.body.signature, salt);
        const thePath = path.parse(req.file.path);

        const newFile = new fileModel({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
            address: req.body.address,
            signature: hashedSignature,
            originalFileName: path.basename(req.file.originalname, thePath.ext),
            filePath: req.file.path,
            extname: thePath.ext
        });

        await newFile.save();

        req.flash("success", "File saved successfully");
        res.redirect("/register");
    } catch (err) {
        next(err);
    }
};

export const verifySignature = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, signature } = req.body;

        const fileExist = await fileModel.findOne({ email });

        if (!fileExist) {
            req.flash("emailError", "Email not registered");
            req.flash("email", email);
            res.redirect("/");
            return;
        }

        const signatureValid = await bcrypt.compare(signature, fileExist.signature);

        if (!signatureValid) {
            req.flash("email", email);
            req.flash("signatureError", "Incorrect Signature");
            res.redirect("/");
            return;
        }

        req.flash("firstname", fileExist.firstname);
        req.flash("lastname", fileExist.lastname);
        req.flash("email", fileExist.email);
        req.flash("phonenumber", fileExist.phonenumber);
        req.flash("address", fileExist.address);
        req.flash("date", fileExist.date.toLocaleString());
        req.flash("fileId", fileExist._id.toString());
        res.redirect("/file");
    } catch (err) {
        next(err);
    }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.params;

        const fileExist = await fileModel.findById(fileId);

        if (!fileExist) {
            res.send('<h1>File Not found</h1><a href="http://localhost:3000">Go Home</a>');
            return;
        }

        const thePath = path.parse(fileExist.filePath);
        res.download(fileExist.filePath, `${fileExist.originalFileName}${thePath.ext}`);
    } catch (err) {
        next(err);
    }
}