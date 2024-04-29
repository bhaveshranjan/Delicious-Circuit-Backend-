import express, {Request, Response, NextFunction} from 'express';
import { DeliveryUserLogin, DeliveryUserSignup, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

// Signup/create customer
router.post('/signup', DeliveryUserSignup)
//login
router.post('/login',DeliveryUserLogin)

//authentication

router.use(Authenticate)

//Change Service Status

router.put('/change-status', UpdateDeliveryUserStatus);

//profile
router.get('/profile',GetDeliveryUserProfile)

router.patch('/edit-profile',EditDeliveryUserProfile)


export { router as DeliverRoute};
