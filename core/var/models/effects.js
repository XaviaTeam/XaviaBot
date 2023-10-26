import mongoose from "mongoose";

const Effects = new mongoose.Schema({
    pluginName: {
        type: String,
        required: true,
        unique: true,
    },
    exp: [
        {
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
            effects: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    value: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },
    ],
    money: [
        {
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
            effects: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    value: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },
    ],
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

export default Effects;
