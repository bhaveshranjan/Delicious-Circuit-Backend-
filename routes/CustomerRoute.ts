import express, {Request, Response, NextFunction} from 'express';
import { CustomerLogin, CustomerSignup, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controllers/CustomerController';
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

router.patch('/profile',EditCustomerProfile)
//cart

//order

//payment
export { router as CustomerRoute}