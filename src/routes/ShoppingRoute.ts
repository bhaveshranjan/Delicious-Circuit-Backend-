import express, { Request, Response, NextFunction } from "express";
import { GetFoodAvailability, GetFoodIn30Min, GetTopRestraunts, RestrauntById, SearchFoods } from "../controllers";

const router = express.Router();
//Food Availability

router.get('/:pincode',GetFoodAvailability)

//Top Restraunts
router.get('/top-restraunts/:pincode',GetTopRestraunts)

//Food Available in 30 min
router.get('/foods-in-30-min/:pincode',GetFoodIn30Min)

//Search Foods
router.get('/search/:pincode',SearchFoods)

//find Restraunts by ID
router.get('/restraunt/:id',RestrauntById)


export {router as ShoppingRoute};