
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
import config from 'config';
import nodemailer from 'nodemailer';
class Mailer{

    constructor(){
        // try{
        //     this.oauth2Client = new OAuth2(
        //         config.get('google.clientID'),
        //         config.get('google.clientSecret'), 
        //         config.get('google.playground')
        //     );
        //     this.oauth2Client.setCredentials({
        //         refresh_token: config.get('google.refreshToken')
        //     });
        //     this.oauth2Client.getAccessToken().then((val) =>{
        //         console.log(val)
        //         this.accessToken = val;
        //         console.log('token', this.accessToken)
        //     }).catch(err => console.log(err))
        //     this.transport = this.transport.bind(this)
        // }
        // catch(err){
        //     console.log(err)
        // }
       
    }

    transport(){
        try{
            const service = nodemailer.createTransport(
                sesmail({
                region: config.get('aws.credentials.region'),
                accessKeyId : config.get('aws.credentials.accessKeyId'),
                secretAccessKey : config.get('aws.credentials.secretAccessKey'),
            }));
             return service
        }
        catch(err){
            console.log(err)
        }
        
    }
}
module.exports = new Mailer()