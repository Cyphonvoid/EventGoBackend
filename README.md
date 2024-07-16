# Backend
How to run server?
Step 1: Run the web_server.js file by navigating into directory and `node web_server` 

How to test server?
Step 1: Once the server is running go to http://localhost:8888/ and check if it is running

How to send requests to the server? 

Once the server has been tested it is working you can either use postman or use any browser to send request.
Below is a full list of endpoints that you can connect to 


 
`http://localhost:8888/signup?`
 This endpoint is for signing up the user. Frontend will send email and pass then here at this endpoint server creates new SupaUser() object which sends verification request to email. In other words it will first create row in table in auth.users.

`http://localhost:8888/login?`
 This endpopint is for logging in the user. Uses SDK but funcationality will change

`http://localhost:8888/signout`
 Not funcational at the moment
 

`http://localhost:8888/hostshow?`
 Not functional at the moment


`http://localhost:8888/confirmation`
 After the email verification has been sent, the user will click on the link and be redirected to this endpoint for confirmation. It then creates a EventGoUser() Object in database. In other words it will create rest of the profile upon verification by creating row in public.EventGoUsers table.


# Resources
Backend and database designs and diagrams can be found here `https://lucid.app/lucidchart/0e120221-33c6-4aa3-901c-31de25ee1681/edit?viewport_loc=-1788%2C-3146%2C2401%2C1400%2C0_0&invitationId=inv_11eb2959-3247-4f6c-b694-67e610914e93`. Note that design and diagrams are updated very often as things develop. Database schema has been modeled as OOP in backend javascript code. 



# How to get tokens

Method 1: On backend request can provide email and password and use SDK to signin on behalf of user to get access token, which can then be used to get session 

Method 2: Frontend upon using SDK to login user can send access token to the backend which then be used to get session