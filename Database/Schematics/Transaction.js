import { BaseEntity } from "./BaseEntity.js";
import { supabaseAdminClient, supabaseClient } from "./Supabase.js";

export class Transaction extends BaseEntity{
    //looks gud
    constructor(attributes=null){
        super();
        this.attributes = attributes
        if(attributes === null){
            this.attributes = {
                ID:null,
                CreatedAt:null,
                PaymentBy:null,
                PaymentTo:null,
                Amount:null,
                Currency:null,
                PaymentType:null,
                TicketID:null
                //TransactionID:null,
            }
        }
    }

    async Create(){
        let {error} = await supabaseAdminClient.from('Transactions').insert(this.attributes)
        console.log(error, "Class Transaction: Create() tracer")
        if(error){console.log("Create():", false);return false}
        else{console.log("Create():", true); return true}
    }

    async Delete(){
        let response = await supabaseAdminClient.from('Transactions').delete().eq('ID', this.attributes.ID)
        .eq('TransactionID', this.attributes.TransactionID)
        console.log(response, "Class Transaction: Delete() tracer")
        if(response.error == null || response.error == undefined){console.log("Delete():", true);return true}
        console.log("Delete()", false)
        return false;
    }

    async Update(){
        let {error} = await supabaseAdminClient.from('Transactions').update(this.attributes).eq('ID', this.attributes.ID)
        .eq('TransactionID', this.attributes.TransactionID)
        console.log(error, "Class Transaction: Update() tracer")
        if(error){console.log("Update():", false); return false;}
        else console.log("Update():", true); return true;
    }

    async Exists(){
        let{data, error} = await supabaseAdminClient.from('Transactions').select().eq('ID', this.attributes.ID)
        .eq('TransactionID', this.attributes.TransactionID)
        console.log(error, "Class Transaction: Exists() tracer")
        if(data != null && data != undefined && data.length > 0){console.log("Exists(): ", true); return true}
        else {console.log("Exists():", false); return false}
    }

    async Search(){
        let {data, error} = await supabaseAdminClient.from('Transactions').select().match(this.attributes)
        console.log(data, error, " Transactions Search() tracer")
        if(error == null && (data != null && data != undefined)){
            console.log("Search():", true)
            return data;
        }
        console.log("Search():", false)
        return null;
    }

    async __synchronize_with_database_row(){
        //Synchronizes the attribute in the database within the object. Then same attributes can be accessed
        let{data, error} = await supabaseAdminClient.from('Transactions').select()
        .eq('ID', this.attributes.ID).eq('TransactionID', this.attributes.TicketID)
        if(data != undefined && data != null && data.length > 0){
            this.attributes = data[0]
            console.log("Ticket successfully synchronized")
            console.log("CURRENT ATTRIBUTES")
            console.log(this.attributes)
            return true;
        }

        console.log("\x1b[31mTicket not synchronized\x1b[0m")
        console.log("\x1b[31mMaybe data in database doesn't exist\x1b[0m")
        return false;
    }
    async Synchronize(){
        let resp = await this.__synchronize_with_database_row();
        return resp;
    }
}