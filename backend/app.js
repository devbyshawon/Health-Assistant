const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes');
const doctorRouter = require('./routes/doctorRoutes');
const adminRouter = require('./routes/adminRoutes');
const publicRouter = require('./routes/publicRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);
app.use('/uploads', express.static('uploads'));

module.exports = app;