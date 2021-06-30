import Auth from '../src/v1/rest/auth/auth.model';
import { Resource } from './_seeds/resource.seed';

/**
 * Empty collections
 */
export const EmptyAuthCollections = async () => {
	await Auth.remove({});
	await Resource.remove({});
};
