
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
import config from 'config';
import nodemailer from 'nodemailer';
class Mailer{

    constructor(){
        try{
            this.oauth2Client = new OAuth2(
                config.get('google.clientID'),
                config.get('google.clientSecret'), 
                config.get('google.playground')
            );
            this.oauth2Client.setCredentials({
                refresh_token: config.get('google.refreshToken')
            });
            this.oauth2Client.getAccessToken().then((val) =>{
                console.log(val)
                this.accessToken = val;
                console.log('token', this.accessToken)
            }).catch(err => console.log(err))
            this.transport = this.transport.bind(this)
        }
        catch(err){
            console.log(err)
        }
       
    }

    transport(){
        try{
            const service = nodemailer.createTransport({
                // service: config.get('email.nodemailer.service'),
                 host: 'smtp.gmail.com',
                 port: 465,
                 secure: true,
                 auth: {
                      type: config.get('email.nodemailer.authType'),
                      user: config.get('email.nodemailer.from'), 
                      clientId: config.get('google.clientID'),
                      clientSecret:  config.get('google.clientSecret'),
                      refreshToken: config.get('google.refreshToken'),
                      accessToken: this.accessToken,
                      tls: {
                         rejectUnauthorized: false
                       }
                 }
             });
             return service
        }
        catch(err){
            console.log(err)
        }
        
    }
}
module.exports = new Mailer()