import express, {Request, Response, NextFunction} from 'express';
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSignup, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp, verifyOffer } from '../controllers/CustomerController';
import { Authenticate } from '../middlewares';

const router = express.Router();

// Signup/create customer
router.post('/signup', CustomerSignup)
//login
router.post('/login',CustomerLogin)

//authentication

router.use(Authenticate)
//verify customer account
router.patch('/verify',CustomerVerify)
//otp
router.post('/otp',RequestOtp)
//profile
router.get('/profile',GetCustomerProfile)

router.patch('/edit-profile',EditCustomerProfile)
//cart

router.post('/cart',AddToCart);
router.get('/cart',GetCart);
router.delete('/cart',DeleteCart);

//Apply Offers
router.get('/offers/verify/:id', verifyOffer);

//order
router.post('/create-order',CreateOrder);
router.get('/orders',GetOrders);
router.get('/order/:id',GetOrderById)


//payment
router.post('/create-payment', CreatePayment)

export { router as CustomerRoute}
