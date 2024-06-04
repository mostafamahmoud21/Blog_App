const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DB_CONNECTION);
        console.log('Connected!');
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;
