import config from 'config';
import nodemailer from 'nodemailer';
import sesmail from 'nodemailer-ses-transport';
export class Mailer{

    static transport(){
        try{
            const service = nodemailer.createTransport(
                sesmail({
                region: config.get('aws.credentials.region'),
                accessKeyId : config.get('aws.credentials.accessKeyId'),
                secretAccessKey : config.get('aws.credentials.secretAccessKey'),
            }));
            console.log(service)
             return service
        }
        catch(err){
            console.log(err)
        }
        
    }
}