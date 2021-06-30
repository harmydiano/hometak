// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../app';
import { after, before, describe } from 'mocha';
import { getUserObject } from '../../../_seeds/user.seed';
import { AUTHENTICATE, REGISTER, LOGIN, TEST_API_KEY } from '../../routes';
import { BAD_REQUEST, UNAUTHORIZED, OK, NOT_FOUND } from '../../../../src/utils/constants';
import { EmptyAuthCollections } from '../../../util';

let should = chai.should();
let server;

// Our parent block
describe('Setup For Authentication Test', () => {
	before(async () => {
		server = supertest(await app);
		await EmptyAuthCollections();
	});
	/*
	 * Function to run after test is complete
	 */
	after(async () => { // Before each test we empty the database
		// await EmptyAuthCollections();
	});

	/*
	 * Test a new main registration /auth/signUp route
	 */
	describe('SignUp Endpoint Test' + REGISTER, () => {
		it('Throw validation error when required payload is invalid', async () => {
			const response = await server.post(REGISTER)
				.send({ email: '', password: '', businessName: ''})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Throw validation error when required mobile number is incorrect', async () => {
			const response = await server.post(REGISTER)
				.send({ email: 'harmy@mail.com' })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should return response if payload is valid', async () => {
			const response = await server.post(REGISTER)
				.send({ email: getUserObject().email, password: getUserObject().password, businessName: getUserObject().businessName })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('active');
			response.body.data.should.have.property('password');
			response.body.data.active.should.be.a('boolean');
			// response.body.data.password.should.be.a('string');
			response.body.data.accountVerified.should.be.a('boolean');
		});
	});

	/*
	 * Test a new main login /auth/login route
	 */
	describe('Login Endpoint Test' + LOGIN, () => {
		it('Throw validation error when required payload is invalid', async () => {
			const response = await server.post(LOGIN)
				.send({ email: '', password: '' })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Throw validation error when required payload is not present', async () => {
			const response = await server.post(LOGIN)
				.send({ email: '' })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Throw api error when required mobile number is incorrect', async () => {
			const response = await server.post(LOGIN)
				.send({ email: 'a@mail.com', password: getUserObject().password})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(UNAUTHORIZED);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Throw api error when required password is incorrect', async () => {
			const response = await server.post(LOGIN)
				.send({ email: getUserObject().email, password: 'hrhrhrrhr'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(UNAUTHORIZED);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should return response if payload is valid', async () => {
			const response = await server.post(LOGIN)
				.send({ email: getUserObject().email, password: getUserObject().password })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('active');
			response.body.data.should.have.property('password');
			response.body.data.active.should.be.a('boolean');
			response.body.data.password.should.be.a('string');
			response.body.data.accountVerified.should.be.a('boolean');
		});
	});
});
