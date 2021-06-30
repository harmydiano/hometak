import db from '../setup/database';
import Agenda from 'agenda';
import _ from 'lodash';
import mongoose from 'mongoose';
/**
 * The Scheduler controller class
 */
class Scheduler {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller
     */
    constructor() {
            // this.agenda = new Agenda();
            this.connectionString = 'mongodb://127.0.0.1/fpl';

            this.agenda = new Agenda({
                db: { address: this.connectionString, collection: 'job' },
                // processEvery: '30 seconds'
            });
            this.scheduler = null;
            this.init = this.init.bind(this);
            this.schedule = this.schedule.bind(this);
            this.define = this.define.bind(this);
            this.run = this.run.bind(this);
        }
        /**
         * @param {Object} model The request object
         * @return {Object} res The response object
         */
    init() {
            // this.scheduler = this.agenda.mongo(mongoose.connection.db, 'jobs');
            this.scheduler = this.agenda;
            return this.scheduler;
        }
        /**
         * @param {Object} scheduler The request object
         */
    async onReady(scheduler) {
            await new Promise(resolve => scheduler.once('ready', resolve));
            return;
        }
        /**
         * @param {Object} job The request object
         * @param {Object} date The request object
         */
    async schedule(job, date) {
        console.log(date);
        // await this.onReady(this.scheduler);
        this.scheduler.schedule(date, job);
        return;
    }

    /**
     * @param {Object} jobs The request object
     * @param {Object} command The request object
     *  @param {Object} payload The request object
     */
    async define(jobs, command, payload = null) {
            this.scheduler.define(jobs, async() => {
                console.log('hello world');
                _.isEmpty(payload) ? await command() : await command(payload);
                // process.exit(0);
            });
            if (_.isEmpty(payload)) await this.onReady(this.scheduler);
            return;
        }
        /**
         * @param {Object} scheduler The request object
         */
    async run() {
        this.scheduler.start();
        return;
    }
}
export default new Scheduler();
