require('dotenv').config();
const PORT = process.env.PORT || 3080;
module.exports = {
	app: {
		name: 'Hometak',
		environment: 'test',
		superSecret: 'Testing',
		baseUrl: `http://localhost:${PORT}`,
		port: PORT,
	}
};
