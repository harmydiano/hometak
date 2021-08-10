import { Router } from 'express';
import {Booking} from './booking.model';
import response from '../../../middleware/response';
import auth from '../../middleware/auth';
import BookingController from './booking.controller';

const router = Router();

const bookingCtrl = new BookingController(Booking);

router.route('/bookings/me')
    .get(auth, bookingCtrl.currentUserBooking, response)
router.route('/bookings/me/filter')
    .get(auth, bookingCtrl.filterCurrentUserBooking, response)
router.route('/bookings')
    .post(auth, bookingCtrl.create, response)
    .get(auth, bookingCtrl.find, response);
router.param('id', bookingCtrl.id, response);
router.route('/bookings/:id')
    .get(auth, bookingCtrl.findOne, response)
    .put(auth, bookingCtrl.update, response);

export default router;
