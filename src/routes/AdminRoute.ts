import express, { Request, Response, NextFunction } from 'express'
import {CreateVendor, GetVendors, GetVendorByID, GetTransactions, GetTransactionById, VerifyDeliveryUser, GetyDeliveryUsers} from '../controllers/AdminController'


const router = express.Router();

router.post('/vendor', CreateVendor)

router.get('/vendors', GetVendors)
router.get('/vendor/:id', GetVendorByID)

router.get('/transactions', GetTransactions)
router.get('/transaction/:id',GetTransactionById)

router.put('/delivery/verify', VerifyDeliveryUser);
router.get('/delivery/users',GetyDeliveryUsers);

router.get('/',(req: Request, res: Response, next: NextFunction) =>{

    res.json({message: "Hello from Admin"})
})


export {router as AdminRoute};