// Require the dev-dependencies
import mongoose from 'mongoose';
import supertest from 'supertest';
import Q from 'q';
import chai from 'chai';
import app from '../../../app';
import { after, before, describe } from 'mocha';
import { getUserObject } from '../../../_seeds/user.seed';
import { ALL_RESOURCES_URL, RESOURCE_URL, TEST_API_KEY } from '../../routes';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from '../../../../src/utils/constants';
import { getResourceObj, Resource } from '../../../_seeds/resource.seed';
import Auth from '../../../../src/v1/rest/auth/auth.model';
import { EmptyAuthCollections } from '../../../util';
import AuthProcessor from '../../../../src/v1/rest/auth/auth.processor';

const User = mongoose.model('User');
const should = chai.should();
const ObjectId = mongoose.Types.ObjectId;
let user = null;
let token = null;
let verificationCode = null;
let resource = null;

let server;
describe('Suite: Resource Integration Test', () => {
	before(async () => {
		server = supertest(await app);
		await EmptyAuthCollections();
		const auth = await (new Auth({
			mobile: getUserObject().mobile,
			verificationCode: '1234',
			accountVerified: false
		}).save());
		token = await AuthProcessor.signToken({ auth });
	});
	/**
	 * @function Function to run after test ends
	 * @param {function} done
	 */
	after(async () => {
		await Q.all([User.remove({}), Resource.remove({})]);
	});
	
	describe(`/POST ${RESOURCE_URL}`, () => {
		it('Should error without inputs', async () => {
			let response = await server.post(RESOURCE_URL)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body.meta.error.should.have.property('message').which.is.a('string');
			response.body.meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should error out for incomplete inputs', async () => {
			let response = await server.post(RESOURCE_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body.meta.error.should.have.property('message').which.is.a('string');
			response.body.meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should error out for inputs without name field', async () => {
			let response = await server.post(RESOURCE_URL)
				.send({ skill: getResourceObj() })
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body.meta.error.should.have.property('message').which.is.a('string');
			response.body.meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should create resource with minimum inputs', async () => {
			let response = await server.post(RESOURCE_URL)
				.send(getResourceObj())
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(CREATED);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.instanceOf(Object).and.not.empty;
			response.body.data.should.have.property('_id').which.is.a('string');
			ObjectId(response.body.data._id).should.be.an.instanceOf(ObjectId);
			resource = response.body.data;
		});
	});
	describe('/GET resources/all', () => {
		it('Should return all resources', async () => {
			let response = await server.get(ALL_RESOURCES_URL)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.an('array');
		});
	});
	describe(`/GET ${RESOURCE_URL}/:id`, () => {
		it(`Should error out when resource doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${RESOURCE_URL}/${wrongObjectId}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body.meta.error.should.have.property('message').which.is.a('string');
			response.body.meta.error.should.not.have.property('messages');
		});
		it(`Should return a single resource if exist`, async () => {
			let response = await server.get(`${RESOURCE_URL}/${resource._id}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.an('object');
		});
	});
	describe(`/PUT ${RESOURCE_URL}/:id`, () => {
		it(`Should error out when resource doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${RESOURCE_URL}/${wrongObjectId}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body.meta.error.should.have.property('message').which.is.a('string');
			response.body.meta.error.should.not.have.property('messages');
		});
		it(`Should update with valid inputs`, async () => {
			let response = await server.put(`${RESOURCE_URL}/${resource._id}`)
				.send({ name: 'new update value' })
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.should.have.property('data').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('success').which.is.true;
			response.body.data.should.have.property('_id').which.is.equal(resource._id);
		});
	});
	describe(`/DEL ${RESOURCE_URL}/:id`, () => {
		it(`Should error out when resource doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.del(`${RESOURCE_URL}/${wrongObjectId}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body.meta.error.should.have.property('message').which.is.a('string');
			response.body.meta.error.should.not.have.property('messages');
		});
		it(`Should delete a single resource if exist`, async () => {
			let response = await server.del(`${RESOURCE_URL}/${resource._id}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('meta').which.is.an('object').and.not.empty;
			response.body.meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data');
		});
	});
});
