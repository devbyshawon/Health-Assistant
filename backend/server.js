const app = require('./app');
const connectDB = require('./config/db');
const port = process.env.PORT || 5001;

const startServer = async() => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();