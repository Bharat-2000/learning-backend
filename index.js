import express from "express";
import path from 'path';
import mongoose from "mongoose";

const app = express();
const port = 3000;

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

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    // const pathlocation = path.resolve();
    // res.sendFile(path.join(pathlocation, './index.html'));
    res.render("index", { name: 'bharat' });
});

app.post('/', async (req, res) => {
    const {name, email} = req.body;
    await Message.create({ name, email});
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