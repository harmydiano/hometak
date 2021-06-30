import { RESOURCE_NAME } from '../_seeds/resource.seed';

export const TEST_API_KEY = 'Hometak';
export const TEST_API_VERSION = 'v1';
export const TEST_BASE_URL = `/api/${TEST_API_VERSION}`;

// authenticate
export const REGISTER = `${TEST_BASE_URL}/authenticate`;
export const LOGIN = `${TEST_BASE_URL}/signIn`;

// reset password
export const SEND_RESET_URL = `${TEST_BASE_URL}/sendResetCode`;
export const RESET_PASSWORD_URL = `${TEST_BASE_URL}/resetPassword`;

export const ALL_RESOURCES_URL = `${TEST_BASE_URL}/resources/all`;
export const RESOURCE_URL = `${TEST_BASE_URL}/resources/${RESOURCE_NAME}`;

export const TEST_GRAPHQL_BASE_URL = `/api/${TEST_API_VERSION}/graphql`;
