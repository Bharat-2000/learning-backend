import express from "express";
import path from 'path';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017', {
    dbName: 'mongodb'
}).then(() => { console.log('Database connected!') }).catch((error) => { console.log(error.message) });

const messageSchema = new mongoose.Schema({
    name: String,
    email: String
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model("Message", messageSchema);

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, 'test');
        req.user = await User.findById(decoded.id);
        next();
    }
    else {
        res.redirect('/login');
    }
};

app.get('/', isAuthenticated, (req, res) => {
    res.render('logout', { name: req.user.name });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) { res.redirect('/login'); }
    else {
        user = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, "test");
        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 60 * 1000)
        });
        res.redirect("/");
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.redirect('/register');
    else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) res.render('login', { message: 'Incorrect password!' });
        else {
            const token = jwt.sign({ id: user._id }, "test");
            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 60 * 1000)
            });
            res.redirect("/");
        }
    }
});

app.get('/logout', (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now())
    });
    res.redirect('/');
});

app.post('/', async (req, res) => {
    const { name, email } = req.body;
    await Message.create({ name, email });
});

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
});