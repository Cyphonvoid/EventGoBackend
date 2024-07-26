import { use } from "chai";
import { expressServer, database } from "../../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../../utility.js";
import { EventGoBusiness } from "../../../Database/Schematics/Business.js";

expressServer.use_cors(false);


/**************EventGoBusiness entity controller**********************/
expressServer.router('app').post('/createBusiness/EmailAndPass', CreateBusiness)
expressServer.router('app').get('/createBusiness/EmailAndPass', CreateBusiness)
async function CreateBusiness(req, res){
    //This endpoint creates ALL 3 Entities at same time. It assumes that business and regular account will be 
    //merged together. Note this contraint may not exist in future

    //NOTE: This endpoint must have a check that if same user tries to create same account it will refuse it
    //There probably is a check I just don't know much tbh.
    let success = await database.eventgo_schema().SupaUser(req.body.supa_user).Create();
    if(success == false){res.send("Couldn't signup user"); return false;}

    let user_data = await GetUserByEmailAndPass(req.body.supa_user.email, req.body.supa_user.password)
    req.body.eventgo_user.userid = user_data.id
    let eventgo = req.body.eventgo_user
    let data = {Email:eventgo.email, Password:eventgo.password, Address:eventgo.address,  UserID:eventgo.userid}

    let busi = req.body.business
    busi.ID = eventgo.userid

    let success1 = await database.eventgo_schema().EventGoUser(data).Create();
    let success2 = await database.eventgo_schema().Business(req.body.business).Create();

    res.send(String(success + success1 + success2)+" entities created")

}

expressServer.router('app').post('/createBusiness/LinkToAccount', LinkAndCreateBusiness)
expressServer.router('app').get('/createBusiness/LinkToAccount', LinkAndCreateBusiness)
async function LinkAndCreateBusiness(req, res){
    let business_body = req.body.business
    let user = req.body.user
    business_body.ID = user.ID

    //Check if the user exists in either tables
    let User = await database.eventgo_schema().SupaUser(user)
    let user_exists = await User.Exists();
    if(user_exists == false){res.send("User doesn't exist in database"); return false}

    //Check if the business account exists already
    let business_acc = await database.eventgo_schema().Business(business_body)
    let exists = await business_acc.Exists();
    if(exists == true){res.send("Business Profile already exists"); return}
    
    //Link the account here by creating new business account with same UUID
    business_acc.SetAttributes(business_body);
    let created = await business_acc.Create();  
    if(created == false){res.send("Couldn't create business profile for linking"); return false}
    res.send("Business profiled created and linked")
}   

expressServer.router('app').post('/deleteBusiness', DeleteBusiness)
expressServer.router('app').get('/deleteBusiness', DeleteBusiness)
async function DeleteBusiness(req, res){
    let business_body = req.body.business

    //Check if the business account exists already
    let business_acc = await database.eventgo_schema().Business(business_body)
    let exists = await business_acc.Exists();
    if(exists == false){res.send("Business Profile already doesn't exist"); return}
    
    //Delete the account here
    business_acc.SetAttributes(business_body);
    let deleted = await business_acc.Delete();  
    if(deleted == false){res.send("Couldn't delete business profile"); return false}
    res.send("Business profiled deleted")
}   


expressServer.router('app').post('/UpdateBusiness', UpdateBusiness)
expressServer.router('app').get('/UpdateBusiness', UpdateBusiness)
async function UpdateBusiness(req, res){
    let business_body = req.body.business

    //Check if the business account exists already
    let business_acc = await database.eventgo_schema().Business(business_body)
    let exists = await business_acc.Exists();
    if(exists == false){res.send("Business Profile doesn't exist"); return}
    
    //Update the account here by same UUID
    business_acc.SetAttributes(business_body);
    let updated = await business_acc.Update();  
    if(updated == false){res.send("Couldn't update business profile"); return false}
    res.send("Business profiled updated")
} 