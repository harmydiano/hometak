import Bank from './bank/bank.model';
import Subscription from './subscription/subscription.model';
import Role from './roles/role.model';

const resources = [
	{
		resource_name: 'banks',
		model: Bank,
	},
	{
		resource_name: 'subscriptions',
		model: Subscription,
	},
	{
		resource_name: 'role',
		model: Role,
	}
];
export default resources;
