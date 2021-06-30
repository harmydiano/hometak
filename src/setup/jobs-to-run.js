import Scheduler from '../lib/app-schedule';
import Task from '../utils/job';
import { SERVICE } from '../utils/constants';
/**
 * class JOB
 */
class JOB {
	/**
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
	constructor() {
		Scheduler.init();
	}
	/**
         */
	async serviceJob() {
		await Scheduler.define(SERVICE, Task.service);
		console.log('servide', typeof Task.service);
		const date = new Date(Date.now() + 20000);
		await Scheduler.schedule(SERVICE, date);
		await Scheduler.run();
		return;
	}

	/**
     */
	async startGameWeekJob() {
		await Scheduler.run(SERVICE, Task.service);

		console.log('servide', typeof Task.service);
		const date = new Date(Date.now() + 50000);
		await Scheduler.schedule(SERVICE, date);
		return;
	}

	/**
     * @return {Object} res The response object
     */
	async runJobs() {
		return this.serviceJob();
	}
}
export default new JOB();
