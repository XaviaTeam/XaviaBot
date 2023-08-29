import mongoose from "mongoose";

const Users = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        maxLength: 15,
        unique: true,
        validate: {
            validator: (v) => !isNaN(parseInt(v)),
            message: (props) => `${props.value} is not a valid userID`,
        },
    },
    info: {
        type: Object,
    },
    data: {
        type: Object,
    },
    banned: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
});

export default Users;
