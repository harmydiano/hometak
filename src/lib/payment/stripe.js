import stripe from 'stripe';

class Stripe{

    constructor(key){
        this.stripe = stripe(key)
        console.log('key', key);
    }
    
    async charge(obj){
        try{
            const cardToken = await this.stripe.tokens.create({
                card: {
                  number: obj.cardNumber,
                  exp_month: obj.cardExpMonth,
                  exp_year: obj.cardExpYear,
                  cvc: obj.cardCVC,
                  address_state: obj.country,
                  address_zip: obj.postalCode,
                },
              });
        
            const charge = await this.stripe.charges.create({
                amount: obj.amount,
                currency: "usd",
                source: cardToken.id,
                receipt_email: obj.email,
                description: `Stripe Charge Of Amount ${obj.amount} for One Time Payment`,
            });
            console.log(charge);
            if (charge.status === "succeeded") {
                return true
            }
        }catch(err){
            console.log(err)
            return err.raw.message
        }
    }

    async transfer(obj){
        try{
            const transfer = await this.stripe.transfers.create({
                amount: obj.amount,
                currency: obj.currency,
                destination: 'acct_1D1JwpL7dDkLrj25',
                transfer_group: 'ORDER_95',
            });
            return transfer;
        }
        catch(err){
            console.log(err)
            return err
        }
        
    }

    async settlement(obj){
        const paymentIntent = await this.stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: obj.amount,
        currency: 'usd',
        transfer_data: {
            amount: obj.share,
            destination: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
        },
        });
        console.log(paymentIntent)
        return paymentIntent;
    }
}
module.exports = Stripe