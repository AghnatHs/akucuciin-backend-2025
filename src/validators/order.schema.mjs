import Joi from "joi";

const OrderSchema = {
  cancel: Joi.object({
    cancel_reason: Joi.string().min(1).max(255).required(),
  }),
  create: Joi.object({
    laundry_partner_id: Joi.string().required(),
    package_id: Joi.string().required(),
    content: Joi.string().required(),
    status: Joi.string().valid("pending").required(),
    maps_pinpoint: Joi.string().required(),
    weight: Joi.number().max(0).required(),
    price: Joi.number().max(0).required(),
    coupon_code: Joi.string().max(25).allow("").optional(),
    note: Joi.string().max(255).allow("").required(),
    pickup_date: Joi.string().max(255).required(),
    referral_code: Joi.string().max(20).allow("").optional(),
  }),
  updateStatus: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "penjemputan",
        "pencucian",
        "pengantaran",
        "selesai",
        "batal",
        "kesalahan",
        "pengantaran"
      )
      .required(),
    status_payment: Joi.string().valid("belum bayar", "sudah bayar").required(),
    weight: Joi.number().min(0).allow("").optional(),
    price: Joi.number().min(0).allow("").optional(),
  }),
  updateStatusByDriver: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "penjemputan",
        "pencucian",
        "pengantaran",
        "pengantaran"
      )
      .required(),
  }),
  giveRatingAndReview: Joi.object({
    rating: Joi.number().min(0).max(5).required(),
    review: Joi.string().min(1).max(255).required(),
  }),
};

export default OrderSchema;
