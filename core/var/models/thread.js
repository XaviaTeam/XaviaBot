import mongoose from "mongoose";

const Threads = new mongoose.Schema({
    threadID: {
        type: String,
        required: true,
        maxLength: 16,
        unique: true,
        validate: {
            validator: v => !isNaN(parseInt(v)),
            message: props => `${props.value} is not a valid threadID`
        },
    },
    info: {
        type: Object
    },
    data: {
        type: Object
    },
    banned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
});

export default Threads;
