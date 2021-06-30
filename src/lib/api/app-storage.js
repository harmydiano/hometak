import bluebird from 'bluebird';
import redis from 'redis';
import dotenv from 'dotenv';


/**
 * The App Storage class
 */
class AppStorage {
	/**
	 * @constructor
	 */
	constructor() {
		bluebird.promisifyAll(redis);
		dotenv.config();
		this.redisPort = process.env.REDIS_PORT;
		this.redisHost = process.env.REDIS_HOST;
		this.redisClient = redis.createClient({port: this.redisPort, host: this.redisHost});
        
		/* this.redisClient.multi()
			.keys('*', function (err, replies) {
				// NOTE: code in this callback is NOT atomic
				// this only happens after the the .exec call finishes.

				console.log('MULTI got ' + replies.length + 'replies');

				replies.forEach(function (reply, index) {
					console.log('Reply ' + index + ': ' + reply.toString());
					this.redisClient.get(reply, function(err, data) {
						// console.log(data);
					});
				});
			})
            .exec(function (err, replies) {});
            */
	}
	/**
     * 
     * @param {String} phone 
     * @return {Boolean}
     */
	async existInStorage (phone) {
		// check if phone already exist in storage
		const result = await this.redisClient.getAsync(phone);
		if (result) {
			return result;
		}
		return null;
	}
    
	/**
     * 
     * @param {String} phone 
     * @param {Number} verficationCode
     * @return {Boolean}
     */
	async saveToStorage (phone, verficationCode) {
		// check if phone already exist in storage
		const result = await this.redisClient.setex(String(phone), 3600, verficationCode);
		if (result) {
			return true;
		}
		return null;
	}
    
	/**
     * 
     * @param {String} phone 
     * @param {Number} verficationCode
     * @return {Boolean}
     */
	async compareToStorage (phone, verficationCode) {
		// compare if verificationCode match storage
		const result = await this.redisClient.getAsync(phone);
		if (result == verficationCode) {
			return true;
		}
		return null;
	}
    
	/**
     * 
     * @param {String} phone 
     * @return {Boolean}
     */
	async removeInStorage (phone) {
		// check if phone already exist in storage
		const result = await this.redisClient.del(phone);
		if (result) {
			return true;
		}
		return null;
	}
}
export default new AppStorage();
