import db from '../connection.mjs';

const OrderQuery = {
  assignDriver: async function (order_id, driver_id) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET driver_id = ?
      WHERE id = ?
      `,
      [driver_id, order_id]
    );
    return results;
  },
  getOrderById: async function (order_id) {
    const [results] = await db.query(`SELECT * FROM orders WHERE id = ?`, [
      order_id,
    ]);
    return results[0];
  },
  getOrdersForReport: async function (startDate, endDate) {
    let query = `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.payment_link,
        o.payment_link_expired_at,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
      `;

    const params = [];
    if (startDate && endDate) {
      query += `WHERE o.created_at >= ? AND o.created_at < ? `;
      params.push(startDate, endDate);
    }

    query += `ORDER BY o.created_at DESC`;
    const [results] = await db.query(query, params);
    return results;
  },
  getOrdersJoined: async function (startDate, endDate) {
    let query = `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.cancel_reason,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.payment_link,
        o.payment_link_expired_at,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
      `;

    const params = [];
    if (startDate && endDate) {
      query += `WHERE o.created_at >= ? AND o.created_at < ? `;
      params.push(startDate, endDate);
    }

    query += `ORDER BY o.created_at DESC`;
    const [results] = await db.query(query, params);
    return results;
  },
  getOrdersJoinedByCustomer: async function (customer_id) {
    const [results] = await db.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.cancel_reason,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.payment_link,
        o.payment_link_expired_at,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.customer_id = ?
      `,
      [customer_id]
    );
    return results;
  },
  getOrdersJoinedByDriver: async function (driver_id) {
    const [results] = await db.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.cancel_reason,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.driver_id = ?
      `,
      [driver_id]
    );
    return results;
  },
  getOrderJoinedById: async function (orderId, conn = db) {
    const [results] = await conn.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        lpp.features AS p_features,
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.cancel_reason,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.payment_link,
        o.payment_link_expired_at,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.id = ?
      `,
      [orderId]
    );
    return results;
  },
  getLastOrder: async function (customer_id, conn = db) {
    const [results] = await conn.query(
      `
        SELECT 
        o.id,
        o.customer_id AS c_id,
        c.name AS c_name,
        c.email AS c_email,
        c.address AS c_address,
        c.telephone AS c_telephone,
        o.laundry_partner_id AS lp_id,
        lp.name AS lp_name,
        lp.email AS lp_email,
        lp.address AS lp_address,
        lp.city AS lp_city,
        lp.area AS lp_area,
        lp.telephone AS lp_telephone,
        lp.maps_pinpoint AS lp_maps_pinpoint,
        o.package_id AS p_id,
        lpp.name AS p_name,
        lpp.price_text AS p_price_text,
        lpp.description AS p_description ,
        o.driver_id AS d_id,
        d.name AS d_name,
        d.email AS d_email,
        d.telephone AS d_telephone,
        o.content ,
        o.status,
        o.cancel_reason,
        o.status_payment,
        o.maps_pinpoint,
        o.weight ,
        o.price,
        o.price_after,
        o.coupon_code ,
        o.referral_code ,
        o.note,
        o.pickup_date,
        o.rating,
        o.review,
        o.payment_link,
        o.payment_link_expired_at,
        o.created_at 
        FROM orders o 
        INNER JOIN customers c ON o.customer_id = c.id
        INNER JOIN laundry_partners lp ON o.laundry_partner_id  = lp.id 
        INNER JOIN laundry_partners_packages lpp ON o.package_id = lpp.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.customer_id = ? and o.status != "batal"
        ORDER BY o.created_at DESC
        LIMIT 1
      `,
      [customer_id]
    );
    return results[0];
  },
  create: async function (
    id,
    customer_id,
    laundry_partner_id,
    package_id,
    content,
    status,
    maps_pinpoint,
    weight,
    price,
    coupon_code,
    note,
    pickup_date,
    referral_code,
    conn = db
  ) {
    const [results] = await conn.query(
      `
        INSERT INTO orders
        (id, customer_id, laundry_partner_id, package_id, content, status, maps_pinpoint, weight, price, coupon_code, note, pickup_date, referral_code)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
    `,
      [
        id,
        customer_id,
        laundry_partner_id,
        package_id,
        content,
        status,
        maps_pinpoint,
        weight,
        price,
        coupon_code,
        note,
        pickup_date,
        referral_code,
      ]
    );
  },
  cancelOrder: async function (order_id, cancel_reason) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET status = "batal", coupon_code = "", cancel_reason = ?
      WHERE id = ?
      `,
      [cancel_reason, order_id]
    );
    return results;
  },
  giveRatingAndReview: async function (order_id, rating, review) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET rating = ?, review = ?
      WHERE id = ?
      `,
      [rating, review, order_id]
    );
    return results;
  },
  isCouponExist: async function (coupon) {
    const [results] = await db.query(`SELECT * FROM coupons WHERE name = ?`, [
      coupon,
    ]);
    return results[0];
  },
  updatePaymentLinkOrder: async function (
    order_id,
    payment_link,
    payment_link_expired_at,
    conn = db
  ) {
    const [results] = await conn.query(
      `
      UPDATE orders
      SET payment_link = ?, payment_link_expired_at = ?
      WHERE id = ?
      `,
      [payment_link, payment_link_expired_at, order_id]
    );
    return results;
  },
  updateStatus: async function (
    order_id,
    status,
    weight,
    price,
    status_payment
  ) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET status = ?, weight = ?, price = ?, status_payment = ?
      WHERE id = ?
      `,
      [status, weight, price, status_payment, order_id]
    );
    return results;
  },
  updateStatusPayment: async function (order_id, status_payment) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET status_payment = ?
      WHERE id = ?
      `,
      [status_payment, order_id]
    );
    return results;
  },
  updateStatusByDriver: async function (order_id, status) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [status, order_id]
    );
    return results;
  },
  cancelAssignedDriver: async function (order_id) {
    const [results] = await db.query(
      `
      UPDATE orders
      SET driver_id = NULL
      WHERE id = ?
      `,
      [order_id]
    );
    return results;
  },
};

export default OrderQuery;
