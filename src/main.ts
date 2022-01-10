import { createConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv-flow';
import bodyParser from 'body-parser';
import { AuthRoutes } from './routes';
import 'reflect-metadata';

dotenv.config();

async function init() {
    try {
        await createConnection();
        const app = express();
        app.set('port', process.env.PORT ? process.env.PORT : 3000);
        //middlewares
        app.use(morgan('dev'));
        app.use(bodyParser.json());
        // routes
        app.use(new AuthRoutes().router);
        // app
        app.listen(app.get('port'), () => {
            console.log(`Listening on port ${app.get('port')}`);
        });
    } catch (e) {
        console.log(e);
    }
}

init();
