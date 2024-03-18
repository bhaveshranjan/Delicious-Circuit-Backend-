"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignup = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var Customer_dto_1 = require("../dto/Customer.dto");
var utility_1 = require("../utility");
var models_1 = require("../models");
var CustomerSignup = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customerInputs, inputErrors, email, phone, password, salt, userPassword, _a, otp, expiry, existCustomer, result, signature;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInputs, req.body);
                inputErrors = (0, class_validator_1.validate)(customerInputs, { validationError: { target: true } });
                email = customerInputs.email, phone = customerInputs.phone, password = customerInputs.password;
                return [4 /*yield*/, (0, utility_1.GenerateSalt)()];
            case 1:
                salt = _b.sent();
                return [4 /*yield*/, (0, utility_1.GeneratePassword)(password, salt)];
            case 2:
                userPassword = _b.sent();
                _a = (0, utility_1.GenerateOtp)(), otp = _a.otp, expiry = _a.expiry;
                return [4 /*yield*/, models_1.Customer.findOne({ email: email, phone: phone })];
            case 3:
                existCustomer = _b.sent();
                if (existCustomer !== null) {
                    return [2 /*return*/, res.status(409).json({ message: 'An user exist with the provided Email or Phone' })];
                }
                console.log(otp, expiry);
                return [4 /*yield*/, models_1.Customer.create({
                        email: email,
                        password: userPassword,
                        salt: salt,
                        phone: phone,
                        otp: otp,
                        otp_expiry: expiry,
                        firstname: '',
                        lastname: '',
                        address: '',
                        verified: false,
                        lat: 0,
                        lng: 0
                    })];
            case 4:
                result = _b.sent();
                if (!result) return [3 /*break*/, 6];
                // send the OTP to customer
                return [4 /*yield*/, (0, utility_1.onRequestOTP)(otp, phone)
                    // generate the signature
                ];
            case 5:
                // send the OTP to customer
                _b.sent();
                signature = (0, utility_1.GenerateSignature)({
                    _id: result._id,
                    email: result.email,
                    verified: result.verified
                });
                //send the result to client
                return [2 /*return*/, res.status(201).json({ signature: signature, verified: result.verified, email: result.email })];
            case 6: return [2 /*return*/, res.status(400).json({ message: "Error with signup" })];
        }
    });
}); };
exports.CustomerSignup = CustomerSignup;
var CustomerLogin = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customerInputs, validationError, email, password, customer, validation, signature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.UserLoginInputs, req.body);
                return [4 /*yield*/, (0, class_validator_1.validate)(customerInputs, { validationError: { target: true } })];
            case 1:
                validationError = _a.sent();
                if (validationError.length > 0) {
                    return [2 /*return*/, res.status(400).json(validationError)];
                }
                email = customerInputs.email, password = customerInputs.password;
                return [4 /*yield*/, models_1.Customer.findOne({ email: email })];
            case 2:
                customer = _a.sent();
                if (!customer) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, utility_1.ValidatePassword)(password, customer.password, customer.salt)];
            case 3:
                validation = _a.sent();
                if (validation) {
                    signature = (0, utility_1.GenerateSignature)({
                        _id: customer._id,
                        email: customer.email,
                        verified: customer.verified
                    });
                    return [2 /*return*/, res.status(200).json({
                            signature: signature,
                            email: customer.email,
                            verified: customer.verified
                        })];
                }
                _a.label = 4;
            case 4: return [2 /*return*/, res.status(404).json({ message: 'Error With Login' })];
        }
    });
}); };
exports.CustomerLogin = CustomerLogin;
var CustomerVerify = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var otp, customer, profile, updatedCustomerResponse, signature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                otp = req.body.otp;
                customer = req.user;
                if (!customer) return [3 /*break*/, 3];
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 1:
                profile = _a.sent();
                if (!profile) return [3 /*break*/, 3];
                if (!(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date())) return [3 /*break*/, 3];
                profile.verified = true;
                return [4 /*yield*/, profile.save()];
            case 2:
                updatedCustomerResponse = _a.sent();
                signature = (0, utility_1.GenerateSignature)({
                    _id: updatedCustomerResponse._id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                });
                return [2 /*return*/, res.status(201).json({
                        signature: signature,
                        verified: updatedCustomerResponse.verified,
                        email: updatedCustomerResponse.email
                    })];
            case 3: return [2 /*return*/, res.status(400).json({ message: 'Error with verifying ... (SignUp)' })];
        }
    });
}); };
exports.CustomerVerify = CustomerVerify;
var RequestOtp = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, profile, _a, otp, expiry;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                customer = req.user;
                if (!customer) return [3 /*break*/, 4];
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 1:
                profile = _b.sent();
                if (!profile) return [3 /*break*/, 4];
                _a = (0, utility_1.GenerateOtp)(), otp = _a.otp, expiry = _a.expiry;
                profile.otp = otp;
                profile.otp_expiry = expiry;
                return [4 /*yield*/, profile.save()];
            case 2:
                _b.sent();
                return [4 /*yield*/, (0, utility_1.onRequestOTP)(otp, profile.phone)];
            case 3:
                _b.sent();
                res.status(200).json({ message: 'OTP sent to your Registered Phone number!' });
                _b.label = 4;
            case 4: return [2 /*return*/, res.status(200).json({ message: 'Error with Request OTP' })];
        }
    });
}); };
exports.RequestOtp = RequestOtp;
var GetCustomerProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, profile;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                customer = req.user;
                if (!customer) return [3 /*break*/, 2];
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 1:
                profile = _a.sent();
                if (profile) {
                    return [2 /*return*/, res.status(200).json(profile)];
                }
                _a.label = 2;
            case 2: return [2 /*return*/, res.status(400).json({ message: 'Error with Fetchin Data' })];
        }
    });
}); };
exports.GetCustomerProfile = GetCustomerProfile;
var EditCustomerProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, profileInputs, profileErrors, firstName, lastName, address, profile, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                customer = req.user;
                profileInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerProfileInputs, req.body);
                return [4 /*yield*/, (0, class_validator_1.validate)(profileInputs, { validationError: { target: false } })];
            case 1:
                profileErrors = _a.sent();
                if (profileErrors.length > 0) {
                    return [2 /*return*/, res.status(400).json(profileErrors)];
                }
                firstName = profileInputs.firstName, lastName = profileInputs.lastName, address = profileInputs.address;
                if (!customer) return [3 /*break*/, 5];
                if (!customer) return [3 /*break*/, 5];
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 2:
                profile = _a.sent();
                if (!profile) return [3 /*break*/, 5];
                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address;
                return [4 /*yield*/, profile.save()];
            case 3:
                result = _a.sent();
                return [4 /*yield*/, profile.save()];
            case 4:
                _a.sent();
                res.status(200).json({ profile: profile });
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.EditCustomerProfile = EditCustomerProfile;
//# sourceMappingURL=CustomerController.js.map