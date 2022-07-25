import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import flash from "connect-flash";
import session from "express-session";
import cookieParser from "cookie-parser";

import AppError from "./interfaces/AppError";
import pageRoute from "./routes/pages";

dotenv.config();

const mongoConnectionString = "mongodb://127.0.0.1/SIGNATURE_RECOGNITION";

mongoose.connect(mongoConnectionString);

const dbConnection = mongoose.connection;

dbConnection.on('error', () => console.error.bind(console, 'connection error'));

dbConnection.once('open', () => console.info('Connection to Database is successful'));

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser("secretKey :)"));
app.use(session({
    secret: ":) secretKey",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.set("view engine", "ejs");

app.use(pageRoute);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("newsignature", {
        firstname: req.flash("firstname"),
        lastname: req.flash("lastname"),
        email: req.flash("email"),
        phonenumber: req.flash("phonenumber"),
        address: req.flash("address"),
        emailError: req.flash("emailError"),
        success: req.flash("success")
    });
});

const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "development")
        console.log(`error ${error.message}`);
    next(error);
};

const errorResponder = (error: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    res.status(statusCode).json({ success: false, message });
}

const invalidPathHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).send(`<h1>Page not found <a href="http://localhost:${port}/">Home</a></h1>`)
};

app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on http://localhost:${port}/`));

