
# QR Code functionality



generate qr token upon buying ticket of a show

qr_code_token = {
    ticket:{
        ticket_id:uuid,
        business_id:uuid,
        customer_id:uuid,
        ticket_expiry:date        
    },
    show:{
        show_id:uuid,
        business_id:uuid
    },
    transaction:{
        transaction_id:uuid,
        payment_by_id:uuid,
        payment_to:uuid
    }
}

now we encrypt this raw token using AES or whatever using a common backend key or signature

qr_encrypted_token = gfA7jhg2HNX6omH95jloG310LHCM3G4Qhj7             (Random)
final_encoding = https://backend:port/validateQRcode?encrypted_token=gfA7jhg2HNX6omH95jloG310LHCM3G4Qhj7

this encoding is stored into ticket entities

then gets passed onto frontend

frontend then sends this encryption to backend which validates it and displays whether the user has actually bought ticket or not.


1) Merging StripeAPI connect account with EventGo
2) Possibility of webhooks for processing payments
3) Issuing QR code for processing payments



@fix the webhook for creating processedtransaction and qr code. Seems like it's not inserting it cuz of old_record column in system cache it can't find it. and other cascading problems. But evverything runs fine from localhost and postman. So error has to be something else. 



# to create account 

create supa base user profile
create regular prpfile
create a business profile
store a reference to stripe connect merchant



# on purchase keep track of the stripe account ID that needs to exist for sure for any transaction.


1) Fix and complete QR code feature

2) Complete strupe integration

3) Security layer and encryption with backend access tokens

4) The final User object token to send to frontend
    the final user object will contain main information about user

5) provide general items owned by user easily through single routes.
    make all items associated with user accessible using user id
    - /userTickets will return all tickets associated with user using uuid
    - /businessShows will return all shows associated with the user uuid
    - /userQRcodes will return all codes associated with the user uuid


    Phase 2 will be complete!


Phase 3:

1) Integration testing
2) UI design
3) additional tweaking and adjustments,
maybe stresst esting security backend security layer
4) migrating backend to a different account all together
