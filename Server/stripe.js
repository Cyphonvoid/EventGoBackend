import Stripe from "stripe";

const stripe_pub_key = 'pk_test_51PZRsQRukAN9A0Mh7ZJQOjUZyC2FgEk4980P8ggiFOZDavjmzQAHil4TrFQlCXnqKODlLEbmll1QNTDvtS1Uenju00fdOe0zU7'
const stripe_sec_key = 'sk_test_51PZRsQRukAN9A0MhVVpJof61iB1sEEIqkTNUInonmrjLlCtmRBjPdncsw64QnTCK8dR4uIPjD1zAnhc0AWw0jGJ400rx0babAR'

const stripe = new Stripe(stripe_sec_key)

const account = await stripe.accounts.create({
   
});

console.log(account)