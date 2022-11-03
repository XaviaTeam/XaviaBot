import mongoose from "mongoose";
import Users from "./user.js";
import Threads from "./thread.js";

const models = {
    Users: mongoose.model('Users', Users),
    Threads: mongoose.model('Threads', Threads)
};

export default models;
