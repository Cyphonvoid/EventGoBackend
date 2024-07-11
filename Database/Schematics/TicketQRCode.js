import { BaseEntity } from "./BaseEntity.js";
import { supabaseAdminClient, supabaseClient } from "./Supabase.js";


export class TicketQRCode extends BaseEntity{

    constructor(attributes=null){
        super();
        if(attributes != null){
            this.attributes = attributes
        }
        else{
            this.attributes = {
                ID:null,
                CreatedAt:null,
                TicketID:null,
                ShowID:null,
                BusinessID:null,
                TransactionID:null,
                TicketExpiry:null,
                EncryptedToken:null
            }
        }
    }

    async Create(){
        let{error} = await supabaseAdminClient.schema('public').from('TicketQRCodes').insert(this.attributes)
        console.log(error, "Class TicketQRCode Create() tracer");
        this.latest_crud_operation_data = {error:error, operation:"Create()"}
        if(error){console.log("Create():", false); return false}
        else{console.log("Create():", true); return true}
    }

    async Delete(){
        let response = await supabaseAdminClient.from('TicketQRCodes').delete()
        .eq('ID', this.attributes.ID)

        console.log(response, "Class TicketQRCode Delete() tracer");
        this.latest_crud_operation_data = {error:response.error, operation:"Delete()"}
        if(response.error == null || response.error == undefined){console.log("Delete():", true);return true}
        console.log("Delete()", false)
        return false;
    }

    async Update(){
        let {error} = await supabaseAdminClient.from('TicketQRCodes').update(this.attributes)
        .eq('ID', this.attributes.ID)
        console.log(error, "Class TicketQRCode Update() tracer");
        this.latest_crud_operation_data = {error:response.error, operation:"Update()"}
        if(error){console.log("Update():", false); return false}
        else{console.log("Update():", true); return true;}
    }

    async Exists(){
        let{data, error} = await supabaseAdminClient.from('TicketQRCodes').select()
        .eq('ID', this.attributes.ID)
        console.log(error, "Class TicketQRCode Exists() tracer");
        this.latest_crud_operation_data = {error:response.error, operation:"Exists()"}
        if(data != null && data != undefined && data.length > 0){console.log("Exists(): ", true); return true}
        else {console.log("Exists():", false); return false}
    }
    
    async Search(){
        let {data, error} = await supabaseAdminClient.from('TicketQRCodes').select().match(this.attributes)
        console.log(data, error, " TicketQRCode Search() tracer")
        this.latest_crud_operation_data = {error:response.error, operation:"Search()"}
        if(error == null && (data != null && data != undefined)){
            console.log("Search():", true)
            return data;
        }
        console.log("Search():", false)
        return null;
    }

    async __synchronize_with_database_row(){
        //Synchronizes the attribute in the database within the object. Then same attributes can be accessed
        let{data, error} = await supabaseAdminClient.from('TicketQRCodes').select()
        .eq('ID', this.attributes.ID)
        if(data != undefined && data != null){
            this.attributes = data[0]
            console.log("TicketQRCode successfully synchronized")
            console.log("CURRENT ATTRIBUTES")
            console.log(this.attributes)
            return true;
        }

        console.log("\x1b[31mTicketQRCode successfully synchronized\x1b[0m")
        console.log("\x1b[31mMaybe data in database doesn't exist\x1b[0m")
        return false;
    }

    async Synchronize(){
        //Synchronization wrapper for external use
        let success = await this.__synchronize_with_database_row()
        return success;
    }

}