import express from "express";
import usersRouter from "./routers/users";
import config from "./config";
import mongoose from "mongoose";

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static('public'));

app.use('/users', usersRouter);

const run = async () => {
    await mongoose.connect(config.database);
    app.listen(port, () => {
        console.log(`Server started on ${port} port!`);
    });

    process.on('exit', () => {
        mongoose.disconnect();
    });
};

run().catch(console.error);