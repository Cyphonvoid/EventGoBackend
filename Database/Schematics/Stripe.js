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
            var account = await stripe.accounts.create(this.attributes)
            console.log({created:true,  data:account}, "StripeAccount.Created() true ")
            return {created:true,  data:account}
        }
        catch(error){
            console.log({created:false, data:account}, "StripeAccount.Created() false ")
            return {created:false, data:account}
        }
    }
    
    async Delete(){
        try{ var response = await stripe.accounts.del(this.attributes.id); 
            console.log({deleted:true,  data:response}, "StripeAccount.Deleted() true ")
            return {deleted:true,  data:response}
        }
        catch(error){
            console.log({deleted:true,  data:response}, "StripeAccount.Deleted() false ")
            return {deleted:false, data:response}
        }
    }
    
    async Update(){
        try{ var response = await stripe.accounts.update(this.attributes.id); 
            console.log({updated:false, data:response}, "StripeAccount.Updated() true ")
            return {updated:true,  data:response}
        }
        catch(error){
            console.log({updated:false, data:response}, "StripeAccount.Updated() false ")
            return {updated:false, data:response}
        }
    }

    async Exists(){
        let val =  await this.Retrieve();
        return val.retrieved;
    }

    async Retrieve(){
        try{
            var response = await stripe.accounts.retrieve(this.attributes.id)
            console.log({retrieved:true,  data:response}, "StripeAccount.Retrieve() true ")
            return {retrieved:true,  data:response}
        }
        catch(error){
            console.log({retrieved:false,  data:response}, "StripeAccount.Retrieve() false ")
            return {retrieved:false,  data:response}
        }
    }
    
    async Reject(){
        try{
            var account = await stripe.accounts.reject('acct_1032D82eZvKYlo2C',{reason: 'fraud'});
            return {rejected:true,  data:account}
        }
        catch(error){
            return {rejected:false, data:account}
        }
    }
    
    async Synchronize(){
        try{
            this.attributes = await stripe.accounts.retrieve(this.attributes.id)
            console.log({synchronized:true,  data:this.attributes}, "StripeAccount.Synchronized() true ")
            return {synchronized:true,  data:this.attributes}
        }
        catch(error){
            console.log({synchronized:true,  data:this.attributes}, "StripeAccount.Synchronized() false ")
            return {synchronized:false,  data:this.attributes}
        }
    }
}

