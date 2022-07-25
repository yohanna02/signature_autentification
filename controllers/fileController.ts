import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import fs from "fs";

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

        const hashedSignature = await bcrypt.hash(req.body.signature, salt);

        const newFile = new fileModel({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
            address: req.body.address,
            signature: hashedSignature,
            originalFileName: req.file?.originalname.split(".")[0],
            filePath: req.file?.path
        });

        await newFile.save();

        req.flash("success", "File saved successfully");
        res.redirect("/register");
    } catch (err) {
        next(err);
    }
};