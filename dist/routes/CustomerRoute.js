"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoute = void 0;
var express_1 = __importDefault(require("express"));
var CustomerController_1 = require("../controllers/CustomerController");
var middlewares_1 = require("../middlewares");
var router = express_1.default.Router();
exports.CustomerRoute = router;
// Signup/create customer
router.post('/signup', CustomerController_1.CustomerSignup);
//login
router.post('/login', CustomerController_1.CustomerLogin);
//authentication
router.use(middlewares_1.Authenticate);
//verify customer account
router.patch('/verify', CustomerController_1.CustomerVerify);
//otp
router.post('/otp', CustomerController_1.RequestOtp);
//profile
router.get('/profile', CustomerController_1.GetCustomerProfile);
router.patch('/edit-profile', CustomerController_1.EditCustomerProfile);
//# sourceMappingURL=CustomerRoute.js.map