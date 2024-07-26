import { use } from "chai";
import { expressServer, database } from "../../server_tools.js"
import { GetUserByAccessToken, ServerResponse } from "../../utility.js";
import { EventGoUser, SupabaseUser } from "../../../Database/Schematics/User.js";
expressServer.use_cors(false);

/****************************EventGoUser entity controllers******************************/
expressServer.router('app').post('/createUser', CreateUser)
async function CreateUser(req, res){
    let email = req.query.email
    let password = req.query.password
    
    let details = {
        UserID:req.query.userid,
        Address:req.query.address,
        Email:email,
        Password:password
    }

    let response = await database.eventgo_schema().EventGoUser(details).Create();
    console.log(response)
    if(response != false){console.log("created user successfully"); res.send("created user successfully")}
    else{console.log("couldn't create user"); res.send("couldn't create user")}
}


expressServer.router('app').post('/deleteUser', DeleteUser)
async function DeleteUser(req, res){
    let email = req.query.email
    let password = req.query.password
   
    let user = await database.eventgo_schema().EventGoUser({Email:email, Password:password})
    let success = await user.GetUserByEmailAndPass()
    if(success == false){res.send("No user to delete"); return false}

    let exists = await user.Exists();

    if(exists == true){
        let response = await user.Delete();
        if(response == true){res.send("User deleted")}
        else{res.send("Couldn't delete user")}
        return;
    }
    res.send("User already doesn't exist to delete")
}


expressServer.router('app').post('/updateUser', UpdateUser)
async function UpdateUser(req, res){
    let data = {Email:req.query.email, Password:req.query.pass, Address:req.query.address,  UserID:req.query.userid}
    let success = await database.eventgo_schema().EventGoUser(data).Update()
    if(success){res.send("User updated"); return true;}
    res.send("Couldn't update user")
}


expressServer.router('app').post('/deleteUserByAccessToken', DeleteUserWithAccessToken)
async function DeleteUserWithAccessToken(req, res){
    let access_token = req.query.access_token
    let user_data = await database.supabase_client().auth.getUser(access_token)
   
    user_data = user_data.data.user
    console.log(user_data)
    let user = await database.eventgo_schema().EventGoUser({UserID:user_data.id})
    await user.Synchronize()

    let response = await user.Delete();

    if(response == true){res.send("User deleted")}
    else{res.send("Couldn't delete user")}
}

expressServer.router('app').post('/SearchUser', SearchUser)
async function SearchUser(req, res){
    let user = await database.eventgo_schema().U(req.body)
    let result = await business.Search();
    res.json(result)
}
/************************************************************************/