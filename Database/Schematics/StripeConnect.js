import Stripe from "stripe";
import { BaseEntity } from "./BaseEntity";

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PZRsQRukAN9A0Mh7ZJQOjUZyC2FgEk4980P8ggiFOZDavjmzQAHil4TrFQlCXnqKODlLEbmll1QNTDvtS1Uenju00fdOe0zU7'
const STRIPE_SECRET_KEY = 'sk_test_51PZRsQRukAN9A0MhVVpJof61iB1sEEIqkTNUInonmrjLlCtmRBjPdncsw64QnTCK8dR4uIPjD1zAnhc0AWw0jGJ400rx0babAR'

const stripe = new Stripe(stripe_sec_key)

export {stripe}