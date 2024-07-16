import stripe from "./StripeConnect.js";
import { BaseEntity } from "./BaseEntity.js";

export class StripeAccount extends BaseEntity{

    constructor(attributes=null){
        super();
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
        try{
            let account = await stripe.accounts.create(this.attributes)
            return {created:true, error:null, data:account}
        }
        catch(error){
            return {created:false, error:error, data:null}
        }
    }
    
    async Delete(){
        try{ let response = await stripe.accounts.del(this.attributes.id); 
            return {deleted:response.deleted, error:null, data:response}
        }
        catch(error){
            return {deleted:false, error:error}
        }
    }
    
    async Retrieve(){
        try{
            let response = await stripe.accounts.retrieve(this.attributes.id)
            return {retrieved:true, error:error, data:response}
        }
        catch(error){
            return {retrieved:false, error:error, data:null}
        }
    }
    
    async Reject(){
        try{
            let account = await stripe.accounts.reject('acct_1032D82eZvKYlo2C',{reason: 'fraud'});
            return {rejected:true, error:null, data:account}
        }
        catch(error){
            return {rejected:false, error:error}
        }
    }
    
    async Synchronize(){
        try{
            this.attributes = await stripe.accounts.retrieve(this.attributes.id)
            return {synchronized:true, error:null, data:this.attributes}
        }
        catch(error){
            return {synchronized:false, error:error, data:null}
        }
    }
}

