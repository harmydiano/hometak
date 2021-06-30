import ApiService from '../lib/app-request';
import config from 'config';
/**
 * class JOB
 */
class JOB {
    /**
     * for the controller. Will be required to create
     * an instance of the controller¬
     */
    constructor() {
            this.api = ApiService.init(config.get('app.siteUrl'));
            this.headers = {
                'x-api-key': 'FPL'
            };
            this.service = this.service.bind(this);
        }
        /**
         * @param {Object} job The request object
         * @param {Object} done The request object
         */
    async service() {
            console.log('running service....');
            try {
                await this.api.get('synchronize', { headers: this.headers });
            } catch (err) {
                console.log(err);
            }

            return;
        }
        /**
         * @param {Object} job The request object
         * @param {Object} done The request object
         */
    async startGameWeek() {
        console.log('running service....');
        try {
            await this.api.get('synchronize', { headers: this.headers });
        } catch (err) {
            console.log(err);
        }

        return;
    }
}
export default new JOB();
