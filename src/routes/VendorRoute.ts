import express, { Request, Response, NextFunction } from 'express';
import { GetCurrentOrders,AddFoods, GetFoods, GetOrderDetails, GetVendorProfile, ProcessOrder, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin, AddOffer, GetOffers, EditOffer } from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';
import { GetOrders } from '../controllers/CustomerController';



const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function(req,  file, cb){
        cb(null,'images')
    },
    filename: function(req, file,cb){
        cb (null, new Date().toISOString()+'_'+file.originalname)
    }
})

const images = multer({storage : imageStorage}).array('images',10)

router.post('/login',VendorLogin);
router.use(Authenticate)
router.get('/profile',GetVendorProfile)
router.patch('/profile',UpdateVendorProfile)
router.patch('/coverimage',images,UpdateVendorCoverImage)
router.patch('/service',UpdateVendorService)

router.post('/food',images,AddFoods)
router.get('/foods',GetFoods)


//orders
router.get('/orders',GetCurrentOrders);
router.put('/order/:id/process',ProcessOrder);
router.get('/order/:id',GetOrderDetails);

//Offers
router.get('/offers', GetOffers);
router.post('/offer',AddOffer);
router.put('/offer/:id',EditOffer);

//delete offers

export {router as VendorRoute};