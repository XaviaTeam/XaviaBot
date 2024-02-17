import mongoose from "mongoose";
import Users from "./user.js";
import Threads from "./thread.js";
import Effects from "./effects.js";

const models = {
    Users: mongoose.model('Users', Users),
    Threads: mongoose.model('Threads', Threads),
		Effects: mongoose.model('Effects', Effects)
};

export default models;
