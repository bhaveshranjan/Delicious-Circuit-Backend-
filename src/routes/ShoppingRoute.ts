import express, { Request, Response, NextFunction } from "express";
import { GetAvailableOffers, GetFoodAvailability, GetFoodIn30Min, GetTopRestraunts, RestrauntById, SearchFoods } from "../controllers";

const router = express.Router();
//Food Availability

router.get('/:pincode',GetFoodAvailability)

//Top Restraunts
router.get('/top-restraunts/:pincode',GetTopRestraunts)

//Food Available in 30 min
router.get('/foods-in-30-min/:pincode',GetFoodIn30Min)

//Search Foods
router.get('/search/:pincode',SearchFoods)

//Find Offers
router.get('/offers/:pincode', GetAvailableOffers)

//find Restraunts by ID
router.get('/restraunt/:id',RestrauntById)


export {router as ShoppingRoute};