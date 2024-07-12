import {BaseEntity} from "./BaseEntity.js";
import {Ticket} from "./Ticket.js";
import { supabaseAdminClient, supabaseClient } from "./Supabase.js";


export class SupabaseUser extends BaseEntity{
    constructor(attributes=null){
        super();
        this.attributes = attributes
        this.user_session = null;
        this.redirect_url = null;
        
        if(this.attributes !== null){
            this.attributes={
                email:attributes['email'], password:attributes['password'],
            }
        }
        
        else{
            console.log("supabase user: else")
            this.attributes={
                email:null,
                password:null,
            }
        }
    }
    
async Create(){
    console.log(this.attributes, "Sign Up attributes")
    const{data, error} = await supabaseClient.auth.signUp(this.attributes)
    this.latest_crud_operation_data = {data:data, error:error, operation:"Create"}
    //same as if(error){}
    if(error != undefined && error != null){
        console.log("\x1b[31m"+error+"\x1b[0m", "Class SupabaseUser: Create() tracer"); 
        return false
    }

    else if(data !== undefined && data != null){
        console.log("\x1b[31m"+data+"\x1b[0m", "Class SupabaseUser: Create() tracer"); 
        console.log("User Created successfully")
        console.log("Created User", data)
        return true;
    }
}

async Delete(){
    let{data, error} = await supabaseAdminClient.auth.admin.deleteUser(this.attributes.ID)
    console.log(data, error, "Class SupabaseUser: Delete() tracer")
    this.latest_crud_operation_data = {data:data, error:error, operation:"Delete"}
    if(data){return true}
    else if(error){return false}
}

async Update(){
    let{data, error} = await supabaseAdminClient.auth.updateUser(this.attributes)
    console.log(data, error, "Class SupabaseUser: Update() tracer")
    this.latest_crud_operation_data = {data:data, error:error, operation:"Update"}
    if(data)return true;
    else if(error)return false;
}

async Exists(){
    let{data, error} = await supabaseAdminClient.auth.admin.getUserById(this.attributes.ID)
    this.latest_crud_operation_data = {data:data, error:error, operation:"Exists"}
    if(data)return true;
    else if(error)return false;
}

}


export class EventGoUser{
constructor(attributes=null){

    this._supabase_user = null;
    this.list = ['UserID', 'Address', 'Email', 'Password']
    this._ticket = new Ticket();

    if(attributes !== null){
        this.attributes = attributes
    }
    else{
        this.attributes = {
            UserID:null,
            Address:null,
            Email:null,
            Password:null
        }
    }
}

SetAttributes(json_attr){
    this.attributes = json_attr;
}

__verify_attributes(list){
    for(let i = 0; i < list.length; i++){
        try{if(this.attributes[list[i]] == null){return false;}}
        catch(e){}
    }
    return true;
}   

async Create(){
    //if(this.__verify_attributes(this.attributes) == false){return EntityNotCreated}
    const{data, error} = await supabaseClient.from('EventGoUsers').insert(this.attributes)
    console.log(error, "EventGoUser Create()")
    if(error){console.log(false);return false;}
    console.log(true);
    return true;
}

async Delete(){
    const response = await supabaseClient.from('EventGoUsers').delete().eq('UserID', this.attributes.UserID)
    console.log(response, "EventGoUser Delete()")
    if(response.error == null || response.error == undefined){console.log("Delete():", true); return true}
    console.log("Delete():", true); return false;
}

async Update(){
    let exists = await this.Exists()
    if(exists == false){console.log("EventGoUser Class Update(): User doesn't exist");return false;}

    let {data, error} = await supabaseAdminClient.from('EventGoUsers').update(this.attributes).eq('UserID', this.attributes.UserID)
    console.log(data, error, "EventGoUser Class Update() Tracer")
    if(error){console.log(false); return false;}
    else{console.log(true); return true;}
}

async Exists(){
    let {data, error} = await supabaseAdminClient.from('EventGoUsers').select().eq('UserID', this.attributes.UserID)
    if(data != null && data != undefined && data.length > 0){return true}
    else {return false}
}



async BuyTicket(ticket_details){
    
    this._ticket.SetAttributes(ticket_details)
    this._ticket.Update();
    let ticket = this._ticket;
    let value = await ticket.GetAvailableTicket()
    console.log(value, " BuyTicket() line 579")
    //Since there's no more ticket left we will return null;
    if(value == false){return null}

    ticket_details = ticket.Attributes()
    ticket_details.CustomerID = this.attributes.UserID
    ticket_details.Onsale = false;
    ticket_details.Confirmed = true;
    ticket.SetAttributes(ticket_details)
    var success = await ticket.Update()

    //Create transaction as well for the purchase
    let transaction = await ticket.Transaction()
    let val = await transaction.Create();
    if(val == true){
        console.log("transaction after purchase generated")
    }
    else{
        console.log("couldn't generate transaction after purchase")
    }

    if(success){
        return this._ticket
    }
    return false;
}

async AddPaymentMethod(){

}

async RemovePaymentMethod(){

}

async __synchronize_with_database_row(){
    let{data, error} = await supabaseAdminClient.from('EventGoUsers').select()
    .eq('UserID', this.attributes.UserID)

    if(data != undefined && data != null && data.length > 0){
        this.attributes = data[0]
        return true;
    }
    return false;
}


async Synchronize(){
    let success = await this.__synchronize_with_database_row
    return success
}


async GetUserByEmailAndPass(){
    let {data, error}= await supabaseAdminClient.from('EventGoUsers').select()
    .eq('Email', this.attributes.Email).eq('Password', this.attributes.Password)

    if(data != null && data != undefined && data.length > 0){
        this.attributes = data[0]
        return true;
    }

    return false;
}

async Search(){
    let {data, error} = await supabaseAdminClient.from('EventGoUsers').select().match(this.attributes)
    console.log(data, error, " EventGoUsers Search() tracer")
    if(error == null && (data != null && data != undefined)){
        console.log("Search():", true)
        return data;
    }
    console.log("Search():", false)
    return null;
}


}



export class CombinedUser extends BaseEntity{
constructor(attributes=null){
    this.attributes = attributes
    this._supabase_user = new SupabaseUser(this.attributes)
    this._eventgo_user = new EventGoUser(this.attributes)
    this._ready = new Flag(true);

    if(attributes == null){this._ready.set_false();}
}

SupaUser(){return this._supabase_user}
EventGoUser(){return this._eventgo_user}

async Create(){
    let supa_user_resp = await this.SupaUser().Create()
    let eventgo_user_resp = await this.EventGoUser().Create()
}

async Delete(){
    let response1 = await this.SupaUser().Delete();
    let response2 = await this.EventGoUser().Create();
}

async Exists(){
    return await this.SupaUser().Exists() && await this.EventGoUser().Exists();
}
}