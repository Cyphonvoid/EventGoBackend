import { expressServer, database, ServerResponse} from "../server_tools.js"



expressServer.use_cors(false);

function CheckEmailAndPass(email, pass){
    console.log(email, pass)
    return ((email != null && email != undefined && email != "") && (pass != null && pass != undefined && pass != ""))
}

expressServer.router('app').get("/", Root)
export function Root(req, res){
    res.send("ROOT endpoint working and reacheable")
}

/* UTILITY ROUTES */
expressServer.router('app').post('/login', Login)
expressServer.router('app').get("/login", Login)
export async function Login(req, res){    
    let response = await database.supabase_client().auth.signInWithPassword(req.body)

    console.log(response)
    if(response == false){
        let server_resp = new ServerResponse(null)
        server_resp.set_not_sucess('Login Unsuccessful')
        res.json(server_resp.get())
        return false;
    }

    //If login is successful
    let server_resp = new ServerResponse(response)
    server_resp.set_success('Login Successful')
    res.json(response);
}

expressServer.router('app').post('/signup', SignUp)
expressServer.router('app').get('/signup', SignUp)
export async function SignUp(req, res){

    let data = req.body
    //Check if the email and password are correct
    if(CheckEmailAndPass(data.email, data.password) == false){
        res.send("Email and Password don't match backend criterion. Values either undefined or null")
        return false;
    }

    //Create the user in auth.users table by creating new SupaUser() objcet
    let SupaUser = database.eventgo_schema().SupaUser(data)
    let created  = await SupaUser.Create();
    let response = false;

    if(created){
        response = SupaUser.LatestOperationData();
    }

    console.log(response, "server route signup")
    
    //If the creation response was not successfull in creating
    if(response === false){
        let server_resp = new ServerResponse(null)
        server_resp.set_not_sucess('SignUp unsuccessful')
        res.json(server_resp.get())
        return false;
    }

    //If the creation of user in auth.users table was successful
    let server_resp = new ServerResponse(response['user'])
    server_resp.set_success('SignUp Successfull')
    res.json(server_resp.get())
}



expressServer.router('app').get('/signout', SignOut)
expressServer.router('app').post('/signout', SignOut)
async function SignOut(req, res){
    //User can also be signedout of the clientside.

    //revoke the refresh token of the user. Access token still remains valid till it's expiry
    let {data, error} = await database.supabase_client().auth.signOut(req.body.user.access_token)
    if(error){
        let server_response = ServerResponse("Couldn't signout the user")
        server_response.set_not_sucess("Maybe user doesn't exist")
        res.send(server_response.get())
        return false;
    }

    //If the user exists then send this response
    let server_response = ServerResponse("User signed out successfully")
    server_response.set_success("Revoked refresh tokens")
    res.send(server_response.get())
    return true;
}