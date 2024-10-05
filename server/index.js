const dotenv = require('dotenv');
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: './.env.test' });
} else {
    dotenv.config();
}

const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const userRouter = require('./routes/user.router');
const friendRouter = require('./routes/friend.router');

const app = express()
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chatting API',
            version: '0.0.1',
            description: 'Chatting Server API',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.json({ name: "Chatting server backend", author: "Ali Naqi Al-Musawi", version: "0.0.1" });
});

app.use('/users', userRouter);
app.use('/friends', friendRouter);

if (process.env.NODE_ENV !== 'test') {
    const startServer = async () => {
        try {
            await mongoose.connect(process.env.MONGO_DB_URL);
            console.log('Successfully connected to the database');
            app.listen(PORT, () => {
                console.log(`Server is listening on port ${PORT}`);
            });
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1);
        }
    };

    startServer();
}

module.exports = app;