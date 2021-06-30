const Ravepay = require('flutterwave-node');

class Flutter{

    constructor(pub, secret, production=false){
        this.pub = pub;
        this.rave = new Ravepay(pub, secret,  production);
        this.charge = this.charge.bind(this)
        this.addAccount = this.addAccount.bind(this)
    }

    async charge(obj){
        try{
            const initCharge = await this.rave.Card.charge(
                {
                    "PBFPubKey": this.pub,
                    "cardno": obj.cardNumber,
                    "cvv": obj.cardCVC,
                    "expirymonth": obj.cardExpMonth,
                    "expiryyear": obj.cardExpYear,
                    "currency": obj.currency,
                    "country": obj.country,
                    "amount": obj.amount,
                    "email": obj.email,
                    "pin": "3310",
                    "suggested_auth": "PIN",
                    "phonenumber": obj.phone || "",
                    "firstname": obj.name || "",
                    "lastname": "",
                    "subaccounts": [
                        {
                            id: "RS_ADA475A2E69EB2A5C8F676F7822A5B4E",
                            transaction_split_ratio: 1
                        }
                    ],
                    "IP": "355426087298442",
                    "txRef": "MC-" + Date.now(),// your unique merchant reference
                    "meta": [{metaname: "flightID", metavalue: "123949494DC"}],
                    "redirect_url": "https://rave-webhook.herokuapp.com/receivepayment",
                    "device_fingerprint": "69e6b7f0b72037aa8428b70fbe03986c"
                }
            )
            if (initCharge){
                console.log(initCharge.body)
                const response = await this.rave.Card.validate({
                    "PBFPubKey": this.pub,
                    "transaction_reference":initCharge.body.data.flwRef,
                    "otp":12345
                });
                console.log(response.body.data.data);
                return response.body.data.data
            }
        }
        catch(err){
            console.log(err)
            return err
        }
        
    }

    async addAccount(payload){
        try{
            console.log('payload', payload);
            const response = await this.rave.Subaccount.create(payload)
            console.log('response', response);
            return response;
        }
        catch(err){

        }
    }
}
module.exports = Flutter