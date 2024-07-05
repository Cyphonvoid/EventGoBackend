import { expressServer, database, ServerResponse} from "../server_tools.js"


function CheckEmailAndPass(email, pass){
    return ((email != null && email != undefined && email != "") && (pass != null && pass != undefined && pass != ""))
}

expressServer.router('app').get("/", Root)
export function Root(req, res){
    res.send("ROOT endpoint working and reacheable")
}

 /* UTILITY ROUTES */
expressServer.router('app').get("/login", Login)
export async function Login(req, res){    
    let response = await database.supabase_client().auth.signInWithPassword(req.query)

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


expressServer.router('app').get('/signup', SignUp)
export async function SignUp(req, res){

    //Check if the email and password are correct
    if(CheckEmailAndPass(req.query.email, req.query.password) == false){
        res.send("Email and Password don't match backend criterion. Values either undefined or null")
        return false;
    }

    //Create the user in auth.users table by creating new SupaUser() objcet
    let response = await database.eventgo_schema().SupaUser(req.query).Create();
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
