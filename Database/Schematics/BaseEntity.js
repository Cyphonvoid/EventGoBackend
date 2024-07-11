import { supabaseAdminClient, supabaseClient } from "./Supabase.js";

export class BaseEntity{
    constructor(){
        this.attributes = null
        this.latest_crud_operation_data = null;
    }
    LatestOperationData(){return this.latest_crud_operation_data}
    SetAttributes(attributes){this.attributes = attributes}
    Attributes(){return this.attributes}
    Exists(){}
    Update(){}
    Create(){}
    Delete(){}
    Search(){}
}