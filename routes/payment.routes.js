import {Router} from 'express';
import { getRazorpayApikey,buySubscription,verifySubscription,cancelSubscription,allPayments } from '../controllers/payment.controlller.js ';
import { authrizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router =  Router();

router
.route('/razorpay-key')
.get(
    isLoggedIn,
    getRazorpayApikey
)

router
.route('/subscribe')
.post(
    isLoggedIn,
    buySubscription
)

router
.route('/verify')
.post(
    isLoggedIn,
    verifySubscription
)

router
.route('/unsubscribe')
.post(
    isLoggedIn,
    cancelSubscription
)

router
.route('/')
.get(
    isLoggedIn,
    authrizedRoles('ADMIN'),
    allPayments

    );


export default router;