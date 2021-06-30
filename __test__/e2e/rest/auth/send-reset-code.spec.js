import Auth from '../../../../src/v1/rest/auth/auth.model';
// Require the dev-dependencies
import chai from 'chai';
import crypto from 'crypto';
import config from 'config';
import supertest from 'supertest';
import app from '../../../app';
import { after, before, describe } from 'mocha';
import { getUserObject } from '../../../_seeds/user.seed';
import { SEND_RESET_URL, RESET_PASSWORD_URL, TEST_API_KEY } from '../../routes';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../../src/utils/constants';
import { EmptyAuthCollections } from '../../../util';

let should = chai.should();
let server;
let auth;
const redirectUrl = `${config.get('app.baseUrl')}}`;

// Our parent block
describe('Setup For Send Reset Password Code Test', () => {
	before(async () => {
		server = supertest(await app);
		await EmptyAuthCollections();
		await (new Auth({ mobile: getUserObject().mobile, password: 'password', accountVerified: false }).save());
	});
	after(async () => {
		await EmptyAuthCollections();
	});
	/*
	 * Test reset password endpoint
	 */
	describe('Reset Password Endpoint Test ' + SEND_RESET_URL, () => {
		it('Should test reset password of a main with invalid payload', async () => {
			const response = await server.post(SEND_RESET_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should test reset password with a main that does not exist', async () => {
			const response = await server.post(SEND_RESET_URL)
				.send({ mobile: '09001010101' })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should return response if payload is valid', async () => {
			const response = await server.post(SEND_RESET_URL)
				.send({ mobile: getUserObject().mobile })
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('mobile');
			response.body.data.mobile.should.be.a('string');
		});
	});

	/*
	 * Test reset password endpoint
	 */
	describe('Reset Password Endpoint Test ' + RESET_PASSWORD_URL, () => {
		it('Should test reset password of a main with invalid payload', async () => {
			auth = await Auth.findOne({'mobile': getUserObject().mobile});
			const response = await server.post(RESET_PASSWORD_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should test reset password with a main that does not exist', async () => {
			const response = await server.post(RESET_PASSWORD_URL)
				.send({ mobile: '09001010101', 
					passwordResetCode: auth.passwordResetCode,
					password: getUserObject().password,
					password_confirm: getUserObject().password_confirm,
					hash: crypto.createHash('md5').update(auth.passwordResetCode).digest('hex')
			
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should return response if payload is valid', async () => {
			const response = await server.post(RESET_PASSWORD_URL)
				.send({ mobile: getUserObject().mobile, 
					passwordResetCode: auth.passwordResetCode,
					password: getUserObject().password,
					password_confirm: getUserObject().password_confirm,
					hash: crypto.createHash('md5').update(auth.passwordResetCode).digest('hex')
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('success');
			response.body.data.success.should.be.a('boolean');
		});
	});
});
