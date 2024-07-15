import {BaseEntity} from "./BaseEntity.js";
import {Show} from "./Show.js"
import { supabaseAdminClient, supabaseClient } from "./Supabase.js";

export class EventGoBusiness extends BaseEntity{
    //Looks good
    constructor(attributes=null){
        super();
        this.attributes = attributes;
        if(attributes == null){
            this.attributes = {
                ID:null,
                StripeAccID:null,
                Name:null,
                Address:null,
                NetProfit:null
            }
        }
    }

    async Create(){
        let{error} = await supabaseAdminClient.from('EventGoBusinesses').insert(this.attributes)
        console.log(error, "EventGoBusiness Create() tracer")
        if(error){console.log("Create():", false); return false}
        else {console.log("Create():", true); return true}
    }
    
    async Delete(){
        if(await this.Exists() == false){return false}
        let response = await supabaseAdminClient.from('EventGoBusinesses').delete().eq('ID', this.attributes.ID)
        console.log(response, "EventGoBusiness Delete() tracer")
        if(response.error == null || response.error == undefined){console.log("Delete():", true);return true}
        console.log("Update():", false);
        return false;
    }
    
    async Update(){
        if(await this.Exists() == false){return false}
        let{error} = await supabaseAdminClient.from('EventGoBusinesses').update(this.attributes).eq('ID', this.attributes.ID)
        console.log(error, "EventGoBusiness Update() tracer")
        if(error){console.log("Update():", false); return false;}
        else{console.log("Update():", true);  return true;}
    }

    async Exists(){
        const {data, error} = await supabaseAdminClient.from('EventGoBusinesses').select().eq('ID', this.attributes.ID)
        console.log(error, "EventGoBusiness Exists() tracer")
        if(data != null && data != undefined && data.length > 0){console.log("Existss():", true);return true}
        else if(error == null || error == undefined){console.log("Exists():", false); return false}
    }

    async Show(attributes){
        let value = await this.Exists()
        console.log(value, " Show() thing")
        if(value == false || value == null){return false}

        attributes.ID = this.attributes.ID
        var show = new Show(attributes)
        return show;
    }

    GetNetProfit(){return this.attributes.NetProfit}
    GetName(){return this.attributes.Name}
    GetAddress(){return this.attributes.Address}

    async __synchronize_with_database_row(){
        let{data, error} = await supabaseAdminClient.from('EventGoBusinesses').select().eq('ID', this.attributes.ID)

        if(data != null & data != undefined && data.length > 0){
            this.attributes = data[0]
            return true;
        }
        return false;
    }

    async Synchronize(){
        let success = await this.__synchronize_with_database_row()
        return success
    }

    async Search(){
        let {data, error} = await supabaseAdminClient.from('EventGoBusinesses').select().match(this.attributes)
        console.log(data, error, " EventGoBusiness Search() tracer")
        if(error == null && (data != null && data != undefined)){
            console.log("Search():", true)
            return data;
        }
        console.log("Search():", false)
        return null;
    }

}