import { BaseEntity } from "./BaseEntity";
import stripe from "./StripeConnect.js";

class StripeAccount extends BaseEntity{

    constructor(attributes=null){
        this.attributes = attributes

        if(attributes == null){
            this.attributes = {
                id:null,
                capabilities: {
                    card_payments: {
                      requested: true,
                    },
                    transfers: {
                      requested: true,
                    },
                }
            }
        }
    }

    SetAttributes(json_attr){
        this.attributes = json_attr;
    }
    
    async Create(){
        if(this.attributes.id == null){return false}
        let account = await stripe.accounts.create(this.attributes)
        return account
    }
    
    async Delete(){
        if(this.attributes.id == null){return false}
        let response = await stripe.accounts.del(this.attributes.id)
        return response.deleted
    }
    
    async Retrieve(){
        if(this.attributes.id == null){return false}
        let response = await stripe.accounts.retrieve(this.attributes.id)
        return response
    }
    
    async Reject(){
        const account = await stripe.accounts.reject('acct_1032D82eZvKYlo2C',{reason: 'fraud'});
        return account;
    }

    async Synchronize(){
        if(this.attributes.id == null){return false}
        this.attributes = await stripe.accounts.retrieve(this.attributes.id)
    }
}