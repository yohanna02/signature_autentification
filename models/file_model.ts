import mongoose from "mongoose";
import File from "../interfaces/File";

const fileSchema = new mongoose.Schema<File>({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    extname: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: new Date()
    }
});

const fileModel = mongoose.model<File>("file", fileSchema);

export default fileModel;