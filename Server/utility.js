import { supabaseAdminClient } from "../Database/Schematics/schema.js"

//Response wrapper for the server
export class ServerResponse{
    constructor(message){
        this.response = {
            'Error':false,
            'ErrorDetail':null,
            'Response':22,
            'ResponseDetail':null,
        }

        this.response['Response'] = message;
    }

    set_response(message){this.response['Response'] = message}

    set_not_sucess(detail){
        this.response['ResponseDetail'] = null
        this.response['Error'] = true;
        this.response['ErrorDetail'] = detail
    }
    set_success(detail){
        this.response['Error'] = false;
        this.response['ErrorDetail'] = null,
        this.response['ResponseDetail'] = detail
    }
    get(){return this.response}
}


export class UserSession{

    constructor(session=null){
        if(session == null){this.session = session}
        else{
            this.session = {

            }
        }
    }

    data(){
        return this.session
    }
}


export async function GetUserByEmailAndPass(email, pass){
    let {data, error} = await supabaseAdminClient.auth.signInWithPassword({email:email, password:pass})
    if(error){return false;}
    return data.user
}

export async function GetUserSessionByEmailAndPass(email, pass){
    let {data, error} = await supabaseAdminClient.auth.signInWithPassword({email:email, password:pass})
    if(error){return false}
    return data.data.session
}

export async function GetUserByAccessToken(access_token){
    let user_data = await supabaseAdminClient.auth.getUser(access_token)
    let {data, error} = user_data
    if(error){return false}
    return data.user;
}