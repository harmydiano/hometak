import '@babel/polyfill';
import config from 'config';
import http from 'http';
import loadRoutes from './index';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Q from 'q';
import intiDatabase from './database';
import mongoose from 'mongoose';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({
	// exposedHeaders: ['ETag']
}));

app.set('port', 7000);

export default intiDatabase()
	.then(async () => {
		console.log('TEST mongodb url ', process.env.DB_TEST_URL);
		const result = await mongoose.connection.db.dropDatabase();
		console.log(`${result} datebase torn down`);
		return Q.resolve(true);
	})
	.then(() => loadRoutes(app))
	.then(async (app) => {
		const server = await http.createServer(app)
			.listen(9000);
		console.log(`\n
	\tTest Application listening on ${config.get('app.baseUrl')}\n
	\tEnvironment => ${config.util.getEnv('NODE_ENV')} ${server}\n
	\tDate: ${new Date()}`);
		return Q.resolve(app);
	}, err => {
		console.log('There was an un catch error : ');
		console.error(err);
	});

