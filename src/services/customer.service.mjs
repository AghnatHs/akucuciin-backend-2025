import bcrypt from 'bcrypt';

import AppConfig from '../configs/app.config.mjs';
import AuthQuery from '../database/queries/auth.query.mjs';
import CouponQuery from '../database/queries/coupon.query.mjs';
import CustomerQuery from '../database/queries/customer.query.mjs';
import OrderQuery from '../database/queries/order.query.mjs';
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  NotFoundError,
  TokenInvalidError,
} from '../errors/customErrors.mjs';
import {
  formatOrderFromDb,
  formatOrdersFromDb,
} from '../utils/order.utils.mjs';
import {
  generateNanoidWithPrefix,
  transformPhoneNumber,
} from '../utils/utils.mjs';
import CustomerSchema from '../validators/customer.schema.mjs';
import OrderSchema from '../validators/order.schema.mjs';
import validate from '../validators/validator.mjs';
import MailService from './mail.service.mjs';
import PaymentService from './payment.service.mjs';
import TokenService from './token.service.mjs';
import {
  sendNewOrderPaymentToCustomer,
  sendOrderCancellationConfirmationToCustomer,
  sendOrderCancellationConfirmationToLaundry,
} from './whatsapp.service.mjs';

const CustomerService = {
  getProfile: async (req) => {
    const customer = await CustomerQuery.getCustomerProfileByEmail(
      req.user.email
    );
    // customer is guaranteed to be found if authenticated
    return customer;
  },
  updateProfile: async (req) => {
    const updatedCustomer = validate(CustomerSchema.update, req.body);

    const customer = await CustomerQuery.getCustomerProfileByEmail(
      req.user.email
    );

    const values = {
      id: req.user.id,
      name: updatedCustomer.name || customer.name,
      address: updatedCustomer.address || customer.address,
      telephone: updatedCustomer.telephone || customer.telephone,
    };
    values.telephone = transformPhoneNumber(values.telephone);

    await CustomerQuery.updateCustomer(
      values.id,
      values.name,
      values.address,
      values.telephone
    );

    return values;
  },
  createReferralCode: async (req) => {
    const { referral_code } = validate(
      CustomerSchema.createReferralCode,
      req.body
    );

    const customer = await CustomerQuery.getCustomerProfileByEmail(
      req.user.email
    );
    if (customer.referral_code) {
      throw new BadRequestError(
        `Gagal, kamu sudah pernah membuat referral code yaitu [${customer.referral_code}]`
      );
    }

    const isReferralCodeExist =
      await CustomerQuery.isReferralCodeExist(referral_code);
    if (isReferralCodeExist)
      throw new BadRequestError(
        'Gagal, referral code sudah dipakai orang lain'
      );

    await CustomerQuery.createReferralCode(referral_code, req.user.id);

    return `Referral code ${referral_code} created!`;
  },
  checkReferralCode: async (req) => {
    const { referral_code } = req.params;

    /* const isReferralCodeExist = await CustomerQuery.isReferralCodeExist(
       referral_code
     );
     if (!isReferralCodeExist)
       throw new NotFoundError(`Referral code ${referral_code} tidak ditemukan`);
    */

    // no need to check if referral code exists, because it will be checked using getCustomerByReferralCode
    const customer =
      await CustomerQuery.getCustomerByReferralCode(referral_code);
    if (!customer)
      throw new NotFoundError(`Referral code ${referral_code} tidak ditemukan`);
    if (customer.id === req.user.id)
      throw new BadRequestError(
        `Referral code ${referral_code} merupakan milik anda sendiri`
      );

    return 'Referral code valid, dimiliki oleh: ' + customer.name;
  },
  register: async (req) => {
    const newCustomer = validate(CustomerSchema.register, req.body);

    const isEmailExists = await CustomerQuery.isEmailExists(newCustomer.email);
    if (isEmailExists) throw new BadRequestError('Email sudah terdaftar');

    newCustomer.id = generateNanoidWithPrefix('CUST');
    newCustomer.password = await bcrypt.hash(newCustomer.password, 12);
    newCustomer.telephone = transformPhoneNumber(newCustomer.telephone);

    await CustomerQuery.registerCustomer(
      newCustomer.id,
      newCustomer.email,
      newCustomer.password,
      newCustomer.name,
      newCustomer.address,
      newCustomer.telephone
    );
    const registerToken = TokenService.generateRegisterToken(
      newCustomer.id,
      newCustomer.email
    );
    await MailService.sendVerifyEmail(newCustomer.email, registerToken);

    return {
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name,
      address: newCustomer.address,
      telephone: newCustomer.telephone,
    };
  },
  getLastOrder: async (req) => {
    const lastOrder = await OrderQuery.getLastOrder(req.user.id);
    console.log(lastOrder);
    const lastOrderFormatted = formatOrderFromDb(lastOrder);
    return lastOrderFormatted;
  },
  getOrders: async (req) => {
    const orders = await OrderQuery.getOrdersJoinedByCustomer(req.user.id);
    const ordersFormatted = formatOrdersFromDb(orders);
    return ordersFormatted;
  },
  getOrder: async (req) => {
    const { order_id } = req.params;
    let order = await OrderQuery.getOrderJoinedById(order_id);
    order = order[0];

    if (!order) throw new NotFoundError('Failed, order not found');
    if (order.c_id != req.user.id)
      throw new AuthorizationError('Failed, order is not yours');

    const formattedOrder = formatOrderFromDb(order);

    return formattedOrder;
  },
  payOrder: async (req) => {
    const { order_id } = req.params;
    let order = await OrderQuery.getOrderJoinedById(order_id);
    order = order[0];

    if (!order) throw new NotFoundError('Failed, order not found');
    if (order.c_id != req.user.id)
      throw new AuthorizationError('Failed, order is not yours');

    if (order.price == 0 && order.price_after == 0)
      throw new BadRequestError('Failed, order not ready to pay yet');

    if (!order.payment_link)
      throw new BadRequestError('Failed, order doesnt have a payment link yet');

    if (order.status_payment == 'sudah bayar') {
      throw new BadRequestError('Order already paid');
    }

    // CHECK TRANSACTION STATUS - IF EXPIRED GENERATE AGAIN
    const isPaymentLinkValid =
      order.payment_link_expired_at &&
      new Date(order.payment_link_expired_at) > new Date();

    if (isPaymentLinkValid) {
      return {
        url: order.payment_link,
        status: 'Valid Payment Link',
      };
    }

    const _order = formatOrderFromDb(order);
    const expiredAt = new Date(
      Date.now() + AppConfig.PAYMENT.DOKU.expiredTime * 60 * 1000
    );

    const newPaymentLink = await PaymentService.Doku.generateOrderPaymentLink(
      order_id,
      _order
    );

    await OrderQuery.updatePaymentLinkOrder(
      order_id,
      newPaymentLink,
      expiredAt
    );

    await sendNewOrderPaymentToCustomer(_order, newPaymentLink);
    return { url: newPaymentLink, status: 'Valid, New Payment Link' };
    // END CHECK TRANSACTION STATUS - IF EXPIRED GENERATE AGAIN
  },
  giveRatingAndReview: async (req) => {
    const { rating, review } = validate(
      OrderSchema.giveRatingAndReview,
      req.body
    );
    const { order_id } = req.params;
    const order = await OrderQuery.getOrderById(order_id);
    if (!order) throw new NotFoundError('Failed, order not found');
    if (order.customer_id != req.user.id)
      throw new AuthorizationError('Failed, order is not yours');
    if (order.status === 'kesalahan' || order.status === 'batal')
      throw new BadRequestError(
        `Failed, order status is already [${order.status}]`
      );
    if (order.status !== 'selesai') {
      throw new BadRequestError(
        'Failed, order not yet eligible to be reviewed'
      );
    }
    if (order.rating !== 0 && order.review) {
      throw new BadRequestError('Failed, order already reviewed');
    }

    await OrderQuery.giveRatingAndReview(order_id, rating, review);

    return 'Successfully give rating and review';
  },
  cancelOrder: async (req) => {
    const { order_id } = req.params;
    const { cancel_reason } = validate(OrderSchema.cancel, req.body);

    const order = await OrderQuery.getOrderJoinedById(order_id);

    if (!order[0]) throw new NotFoundError('Failed, order not found');
    if (order[0].c_id != req.user.id)
      throw new AuthorizationError('Failed, order is not yours');
    if (
      order[0].status === 'selesai' ||
      order[0].status === 'penjemputan' ||
      order[0].status === 'pencucian' ||
      order[0].status === 'batal' ||
      order[0].status === 'pengantaran'
    )
      throw new BadRequestError(
        `Failed, order status is already [${order[0].status}]`
      );

    await OrderQuery.cancelOrder(order_id, cancel_reason);
    if (order[0].coupon_code) {
      const coupon = await CouponQuery.get(order[0].coupon_code);
      if (coupon.is_used === -1) {
        // coupon is infinitely used
      } else {
        await CouponQuery.setNotUsed(order[0].coupon_code);
      }
    }

    const _order = await OrderQuery.getOrderJoinedById(order_id);
    const ord = formatOrdersFromDb(_order)[0];
    await sendOrderCancellationConfirmationToCustomer(ord);
    await sendOrderCancellationConfirmationToLaundry(ord);

    return `Order ${order_id} cancelled.`;
  },
  verify: async (req) => {
    const { register_token, email: emailParams } = req.params;
    const { id, email } = TokenService.verifyToken(
      register_token,
      AppConfig.JWT.registerSecret
    );

    if (email !== emailParams) throw new BadRequestError('Email mismatch');

    const isActive = await CustomerQuery.isCustomerActive(email);
    if (isActive === undefined) throw new TokenInvalidError('Invalid');
    if (isActive === 1) throw new AuthenticationError('Akun sudah diaktivasi');

    await CustomerQuery.activateCustomer(email);

    return `${id} ${email} activated`;
  },
  requestResetPassword: async (req) => {
    const { email } = validate(CustomerSchema.requestResetPassword, req.body);
    const resetPasswordToken =
      TokenService.generateRequestResetPasswordToken(email);

    await AuthQuery.addResetPasswordToken(resetPasswordToken);
    await MailService.sendRequestResetPassword(email, resetPasswordToken);
    return `Requested to ${email}`;
  },
  resendVerificationEmail: async (req) => {
    const { email } = validate(
      CustomerSchema.resendVerificationEmail,
      req.body
    );

    const customer = await CustomerQuery.getCustomerForAuth(email);
    if (!customer)
      throw new NotFoundError(
        'Gagal mengirim verifikasi, email belum terdaftar'
      );
    delete customer.password;
    if (customer.isActive)
      throw new BadRequestError(
        'Gagal mengirim verifikasi, email sudah aktif, silahkan login'
      );

    const registerToken = TokenService.generateRegisterToken(
      customer.id,
      customer.email
    );

    // TODO Mail Service kirim ulang verifikasi
    await MailService.resendVerifyEmail(email, registerToken);

    return 'Email terkirim, silahkan cek email ada, cek juga spam.';
  },
  changePassword: async (req) => {
    let { password: newPassword } = validate(
      CustomerSchema.changePassword,
      req.body
    );

    const { email: emailFromParams, reset_password_token } = req.params;

    const isTokenExist =
      await AuthQuery.isResetPasswordTokenExist(reset_password_token);
    if (!isTokenExist) throw new BadRequestError('Token invalid');

    const { email: emailFromToken } = TokenService.verifyToken(
      reset_password_token,
      AppConfig.JWT.resetPasswordSecret
    );

    const isEmailSame = emailFromParams === emailFromToken;
    if (!isEmailSame) throw new AuthenticationError('Invalid credentials');

    const isEmailExists = await CustomerQuery.isEmailExists(emailFromToken);
    if (!isEmailExists) throw new NotFoundError('Email not found');

    newPassword = await bcrypt.hash(newPassword, 10);
    await CustomerQuery.changePassword(newPassword, emailFromToken);
    await AuthQuery.deleteResetPasswordToken(reset_password_token);
    return `Password for ${emailFromToken} changed succesfully`;
  },
};

export default CustomerService;
