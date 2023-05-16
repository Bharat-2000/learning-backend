import express from "express";
import path from 'path';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

const connection_url = "mongodb+srv://bharatc_2000:<password>@cluster0.hqd0ufs.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect('mongodb://127.0.0.1:27017', {
    dbName: 'mongodb'
}).then(() => { console.log('Database connected!') }).catch((error) => { console.log(error.message) });

const messageSchema = new mongoose.Schema({
    name: String,
    email: String
});

const Message = mongoose.model("Message", messageSchema);

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        next();
    }
    else {
        res.render('login');
    }
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('logout');
});

app.post("/login", (req, res) => {
    res.cookie("token", "login successful!", {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect("/");
});

app.get('/logout', (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now())
    });
    res.redirect('/');
})

app.post('/', async (req, res) => {
    const { name, email } = req.body;
    await Message.create({ name, email });
});

app.get('/users', (req, res) => {
    res.send(user);
});

app.get('/about', (req, res) => {
    res.json({
        name: 'bharat',
        email: 'test@gmail.com'
    });
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
});