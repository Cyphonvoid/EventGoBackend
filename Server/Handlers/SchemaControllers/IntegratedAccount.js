import { use } from "chai";
import { expressServer, database } from "../../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../../utility.js";
import { IntegratedAccount } from "../../../Database/Schematics/IntegratedAccount.js";

expressServer.use_cors(false);

function ValidField(field){
    let empty = {}
    return (field != undefined && field != null && field != empty)
}

function ProfileManager(supa_user_data, eventgo_user_profile, business_profile, stripe_profile){
    try{
        if(business_profile.Address !== eventgo_user_profile.Address){
            return {success:false, error:"business and user address must match same string"}
         }
        eventgo_user_profile.ID = supa_user_data.id
        eventgo_user_profile.Email = supa_user_data.email
        eventgo_user_profile.Passowrd = supa_user_data.password

        business_profile.ID = supa_user_data.id

        stripe_profile.business_profile.name = business_profile.Name
        stripe_profile.business_profile.support_address = business_profile.Address
        stripe_profile.business_profile.support_email = eventgo_user_profile.Email
        return {success:true, error:null, data:[supa_user_data, eventgo_user_profile, business_profile, stripe_profile]}
    }catch(error){return {success:false, error:"Maybe some fields are missing!"}}
}

 //TESTING NEEDED
 expressServer.router('app').post('/IntegratedAccount/Create', CreateProfile)
 async function CreateProfile(req, res){
     
     let eventgo_user_profile = req.body.eventgo_user
     let business_profile = req.body.business
     let stripe_profile = req.body.stripe
     let access_token = req.body.access_token
 
     //If the the incoming fields are incorrect
     if(ValidField(eventgo_user_profile) + ValidField(business_profile) + ValidField(stripe_profile) < 3){
         let response = ServerResponse("One of the profile section is incorrect")
         response.set_not_sucess(""); res.send(response.get()); return false;
     }
 
     //Further checking if the profiles have missing fields or something
     let supa_user_data = GetUserByAccessToken(access_token)
     let response_val = ProfileManager(supa_user_data, eventgo_user_profile, business_profile, stripe_profile)
     if(response_val.success == false){let Res = new ServerResponse(response_val.error); Res.set_not_sucess(""); res.json(Res.get()); return false;}
 
 
     //If the main user profile already exits then it's assumed every other profile also exists therefore the don't create anymore
     let ev_already_exists = await database.eventgo_schema().EventGoUser(eventgo_user_profile).Exists();
     if(ev_already_exists){
         let response = new ServerResponse("account profile already exists")
         response.set_not_sucess("profile already exists"); res.send(response.get()); return false;
     }
 
     let stripe_acc = await database.eventgo_schema().StripeAccount(stripe_profile)
     let stripe_created = await stripe_acc.Create();
 
     //NOTE: StripeAccIDs can't be nullable and must be unique.
     eventgo_user_profile.StripeAccID = stripe_created.data.id
     business_profile.StripeAccID = stripe_created.data.id
 
     let ev_user = await database.eventgo_schema().EventGoUser(eventgo_user_profile)
     let ev_user_created = await ev_user.Create();
 
     let business = await database.eventgo_schema().Business(business_profile)
     let business_created = business.Create();
 
     if(stripe_created == false || ev_user_created == false || business_created == false){
         let stripe_deleted = await stripe_acc.Delete();
         let ev_user_deleted = await ev_user.Delete();
         let business_deleted = await business.Delete();
 
         let resp = ServerResponse('Failed to create atleast one profile therefore deleted all profiles')
         resp.set_not_sucess("Behavior is programmed delete all profiles user, business and stripe if any of them fail to be created")
         res.json(resp.get());
         return false;
     }
     //Final syncing for all entities before sending latest data 
     await ev_user.Synchronize();
     await business.Synchronize();
     await stripe_acc.Synchronize();
 
     let user_profile = {
         eventgo_user:ev_user.Attributes(),
         business:business.Attributes(),
         stripe:stripe_acc.Attributes()
     }
     let resp = ServerResponse(user_profile)
     resp.set_not_sucess("All profiles created successfully")
     res.json(resp.get());
     return true;
 }
 
  //TESTING NEEDED
 expressServer.router('app').post('/IntegratedAccount/Delete', CreateUserProfile)
 async function CreateUserProfile(req, res){
     let eventgo_user_profile = req.body.eventgo_user
     let business_profile = req.body.business
     let stripe_profile = req.body.stripe
     let access_token = req.body.access_token
 
     //If the the incoming fields are incorrect
     if(ValidField(eventgo_user_profile) + ValidField(business_profile) + ValidField(stripe_profile) < 3){
         let response = ServerResponse("One of the profile section is incorrect")
         response.set_not_sucess(""); res.send(response.get()); return false;
     }
 
     var IntegratedAcc = new IntegratedAccount(access_token, eventgo_user_profile, business_profile, stripe_profile)
     let response = await IntegratedAcc.Delete();
     if(response.error == true){
         let resp = ServerResponse(response.details)
         resp.set_not_sucess(); res.json(resp.get()); return false;
     }
 
     let resp = ServerResponse('All connected profiles are deleted')
     resp.set_sucess(); res.json(resp.get()); return false;
 }