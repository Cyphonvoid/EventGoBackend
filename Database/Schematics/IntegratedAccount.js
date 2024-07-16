import { BaseEntity } from "./BaseEntity.js";
import { StripeAccount } from "./Stripe.js"
import { EventGoBusiness } from "./Business.js";
import { EventGoUser } from "./User.js";
import { Flag } from "../utilities.js";
import { supabaseAdminClient, supabaseClient } from "./Supabase.js";

export class IntegratedAccount extends BaseEntity{

    constructor(access_token, eventgo_user, business, stripe){
        super();

        this.attributes = {
            stripe:stripe,
            eventgo_user:eventgo_user,
            business:business,
            access_token:access_token
        }

        
        this.stripe_acc = new StripeAccount(this.attributes.stripe);
        this.business_acc = new EventGoBusiness(this.attributes.business);
        this.eventgo_user_acc = new EventGoUser(this.attributes.eventgo_user);
        this._profile_processable = new Flag(true)
    }

    StripeAccount(){return this.stripe_acc}
    EventGoBusiness(){return this.business_acc}
    EventGoUser(){return this.eventgo_user_acc}
    ProfileProcessable(){return this._profile_processable.check();}

    async __process_profiles(){
        if(this.business_acc.Attributes().Address !== this.eventgo_user_acc.Attributes().Address){
            return false;
        }

        let supa_user_data = await supabaseAdminClient.auth.getUser(this.attributes.access_token)
        let eventgo_user_acc = this.eventgo_user_acc.Attributes();
        let business_acc = this.business_acc.Attributes();
        let stripe_acc = this.stripe_acc.Attributes();

        try{
            eventgo_user_acc.ID = supa_user_data.id
            eventgo_user_acc.Email = supa_user_data.email
            eventgo_user_acc.Passowrd = supa_user_data.password

            business_acc.ID = supa_user_data.id

            stripe_acc.business_acc.name = business_acc.Name
            stripe_acc.business_acc.support_address = business_acc.Address
            stripe_acc.business_acc.support_email = eventgo_user_acc.Email

            this.eventgo_user_acc.SetAttributes(eventgo_user_acc)
            this.business_acc.SetAttributes(business_acc)
            this.stripe_acc.SetAttributes(stripe_acc)
            this._profile_processable.set_true();

        }catch(error){return false}
    }

    __profile_processable(){
        return this._profile_processable.check();
    }
    async Create(){
        if(await this.__profile_processable() == false){return {'error':true, 'details':'profile pre processing failed', 'success':null}}
        let stripe_created = await this.stripe_acc.Create();

        let ev_attr = this.eventgo_user_acc.Attributes(); ev_attr.StripeAccID = stripe_created.data.id; this.eventgo_user_acc.SetAttributes(ev_attr)
        let business_attr = this.business_acc.Attributes(); business_attr.StripeAccID = stripe_created.data.id; this.business_acc.SetAttributes(business_attr)
        
        let business_created = await this.business_acc.Create();
        let eventgo_user_acc = await this.eventgo_user_acc.Create();
        //Delete all the accounts if one of them can't be created
        if(stripe_created.created == false || business_created == false || eventgo_user_acc == false){this.Delete();}
        
        const return_val = {
            'stripe':stripe_deleted,
            'business':business_deleted,
            'eventgo_user':eventgo_user_deleted,
            'created_all':stripe_created && business_created && eventgo_user_created,
            'created_some':stripe_created + business_created + eventgo_user_created,
            'error':false,
            'success':true,
            'details':null
        }
        return return_val;
    }

    async Delete(){
        if(await this.__profile_processable() == false){return {'error':true, 'details':'profile pre processing failed', 'success':null}}
        let stripe_deleted = await this.stripe_acc.Delete();
        let business_deleted = await this.business_acc.Delete();
        let eventgo_user_deleted = await this.eventgo_user_acc.Delete();
        
        const return_val = {
            'stripe':stripe_deleted,
            'business':business_deleted,
            'eventgo_user':eventgo_user_deleted,
            'deleted_all':stripe_deleted && business_deleted && eventgo_user_deleted,
            'deleted_some':stripe_deleted + business_deleted + eventgo_user_deleted,
            'error':false,
            'success':true,
            'details':null
        }
        return return_val;
    }

    async Update(){
        if(await this.__profile_processable() == false){return {'error':true, 'details':'profile pre processing failed', 'success':null}}
        let stripe_updated = await this.stripe_acc.Update();
        let business_updated = await this.business_acc.Update();
        let eventgo_user_updated = await this.eventgo_user_acc.Update();
        return {
            'stripe':stripe_updated,
            'business':business_updated,
            'eventgo_user':eventgo_user_updated,
            'updated_all':stripe_updated && business_updated && eventgo_user_updated,
            'updated_some':stripe_updated + business_updated + eventgo_user_updated,
            'error':false,
            'success':true,
            'details':null
        }
    }
}