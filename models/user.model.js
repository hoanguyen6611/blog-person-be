import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        img: {
            type: String
        },
        savedPost: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);
