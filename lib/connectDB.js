import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongodb);
        console.log('MongoDB is connect');
    } catch (error) {
        console.log(error);
    }
};
export default connectDB;
