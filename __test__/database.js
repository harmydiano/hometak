import mongoose from 'mongoose';
import Q from 'q';

export default config => {
	mongoose.Promise = Q.Promise;
	mongoose.connection.on('disconnected', function () {
		console.log('Mongoose connection to mongodb shell disconnected');
	});
	// Connect to MongoDb
	const databaseUrl = process.env.DB_TEST_URL;
	return mongoose
		.connect(databaseUrl, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
};
