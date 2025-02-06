import express from 'express';
import bodyParser from "body-parser";
import router from './routes/api';
import authController from './controllers/auth.controller';
import db from "./utils/database";


async function init() {
    try {
        const result = await db();
        console.log("database Status: ", result);

        const app = express();

        app.use(bodyParser.json());

        app.get('/', (req, res) => {
            res.status(200).json({
                message: "Hello, World!",
                data: null
            });
        });
        app.use('/api', router);

        const port = 3000;
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error(err);
    }
};

init();