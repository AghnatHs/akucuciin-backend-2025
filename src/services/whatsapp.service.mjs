import axios from 'axios';
import crypto from 'crypto';
import AppConfig from '../configs/app.config.mjs';
import { formatRupiah } from '../utils/format.utils.mjs';

const generateXSignature = (payload) => {
  const payloadStringify = JSON.stringify(payload);
  const xSignature = crypto
    .createHmac('sha256', AppConfig.Whatsapp.HMAC_SECRET)
    .update(payloadStringify)
    .digest('hex');
  return xSignature;
};

export const sendOrderAssignedToDriver = async (ord) => {
  const payload = {
    jid: `${ord.driver.telephone}@s.whatsapp.net`,
    content: `*[Assigned]*\n\nHalo ${ord.driver.name},\n\nAnda telah menerima penugasan pesanan baru. Berikut detailnya : \n\n==Customer==\nNama: ${ord.customer.name}\nEmail: ${ord.customer.email}\nAlamat: ${ord.customer.address}Kontak: https://wa.me/${ord.customer.telephone}\nPinpoint: ${ord.maps_pinpoint}\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${ord.laundry_partner.area}, ${ord.laundry_partner.city}\nKontak laundry: https://wa.me/${ord.customer.telephone}\n\nTerima kasih atas kerjasamanya!, jangan lupa untuk selalu mengecek dashboard driver anda :D\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderAssignedPengantaranToDriver = async (ord) => {
  const payload = {
    jid: `${ord.driver.telephone}@s.whatsapp.net`,
    content: `*[Assigned : Pengantaran ke Customer]*\n\nHalo ${ord.driver.name},\n\nAnda telah menerima penugasan pesanan baru. Berikut detailnya : \n\n==Customer==\nNama: ${ord.customer.name}\nEmail: ${ord.customer.email}\nAlamat: ${ord.customer.address}Kontak: https://wa.me/${ord.customer.telephone}\nPinpoint: ${ord.maps_pinpoint}\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${ord.laundry_partner.area}, ${ord.laundry_partner.city}\nKontak laundry: https://wa.me/${ord.customer.telephone}\n\nTerima kasih atas kerjasamanya!, jangan lupa untuk selalu mengecek dashboard driver anda :D\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderCancellationConfirmationToCustomer = async (ord) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[Pembatalan Pesanan]*\n\nHalo ${ord.customer.name}, Terima kasih telah menggunakan layanan AkuCuciin.\n\nPesanan anda dengan ID: _${ord.id}_ berhasil dibatalkan.\n\nAlasan : "${ord.cancel_reason}".\n\n====================\n\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nID Pesanan: _${ord.id}_`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderCancellationConfirmationToLaundry = async (ord) => {
  const payload = {
    jid: `${ord.laundry_partner.telephone}@s.whatsapp.net`,
    content: `*[Pembatalan Pesanan]*\n\nHalo ${ord.laundry_partner.name},\n\nPesanan customer ${ord.customer.name} dengan ID: _${ord.id}_ dibatalkan oleh customer.\n\nAlasan : "${ord.cancel_reason}".\n\n====================\n\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nID Pesanan: _${ord.id}_`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderConfirmationToCustomer = async (ord) => {
  const payloadWaCustomer = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*[Pesanan Anda Telah Diterima]*\n\nHalo ${
      ord.customer.name
    },\n\nTerima kasih telah menggunakan layanan AkuCuciin. Berikut adalah detail pesanan Anda:\n\n== Detail Pesanan ==\n📦 Paket Laundry: ${
      ord.package.name
    }\n📝 Catatan: ${ord.note || '-'}\n📅 Tanggal Penjemputan: ${
      ord.pickup_date || '-'
    }\n🗺️ Pin Lokasi Anda: ${ord.maps_pinpoint}\n🎟️ Kupon: ${
      ord.coupon_code || '-'
    }\n🎟️ Referral Code: ${
      ord.referral_code || '-'
    }\n\n== Informasi Laundry ==\n🏠 Nama Laundry: ${
      ord.laundry_partner.name
    }\n📍 Lokasi: ${ord.laundry_partner.area}, ${
      ord.laundry_partner.city
    }\n📞 Kontak Laundry: https://wa.me/${
      ord.laundry_partner.telephone
    }\n\n====================\nID: ${
      ord.id
    }\n_Pesan ini dibuat otomatis oleh sistem AkuCuciin._\nTanggal Pemesanan: ${
      ord.created_at
    }`,
  };
  const xSignature = generateXSignature(payloadWaCustomer);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payloadWaCustomer, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderConfirmationToLaundry = async (ord) => {
  const payloadWaLaundry = {
    jid: `${ord.laundry_partner.telephone}@s.whatsapp.net`,
    content: `*[Order baru telah diterima]*\n\nHalo ${
      ord.laundry_partner.name
    }!\nOrder baru telah masuk, Berikut adalah detail pesanan:\n\nID: ${
      ord.id
    }\n\n==Customer==\n*Nama*: ${ord.customer.name}\n*Email*: ${
      ord.customer.email
    }\n*Alamat*: ${ord.customer.address}\n*Pinpoint*: ${
      ord.maps_pinpoint
    }\n*No HP Customer*: https://wa.me/${
      ord.customer.telephone
    }\n\n==LAUNDRY==\n${ord.laundry_partner.name}, ${
      ord.laundry_partner.area
    }, ${ord.laundry_partner.city}\n\n*Paket Laundry*: ${
      ord.package.name
    }\n*Deskripsi*: ${ord.package.description}\n*Note*: ${
      ord.note || '-'
    }\n*Pickup Date*: ${ord.pickup_date || '-'}\n\n*Kupon*: ${
      ord.coupon_code || '-'
    }\n*Referral Code*: ${
      ord.referral_code || '-'
    }\n====================\n\n_Pesan ini dibuat otomatis oleh sistem Akucuciin_\nTanggal: ${
      ord.created_at
    }`,
  };
  const xSignature = generateXSignature(payloadWaLaundry);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payloadWaLaundry, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderCompletedConfirmationToCustomer = async (
  telephone,
  custName,
  orderId
) => {
  const payload = {
    jid: `${telephone}@s.whatsapp.net`,
    content: `*✨ Yay, pesananmu sudah selesai! ✨*\n\nHalo, ${custName}\nTerima kasih sudah mempercayakan laundry kamu ke kami 🧺💙\n\nKami ingin denger pendapatmu, lho!\nYuk isi review-nya lewat menu Lihat Order di website. Feedback dari kamu bantu kami jadi lebih baik lagi 🙌\n\nAda kendala atau pertanyaan?\nLangsung aja hubungi kami—tim kami siap bantu kapan pun kamu butuh 🤝\n\nSampai jumpa lagi!\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._\n_${orderId}_`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendNewOrderPaymentToCustomer = async (ord, paymentLink) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*🧾 [UPDATED - INFORMASI PEMBAYARAN]*\n\nHalo ${
      ord.customer.name
    },\nLink pembayaran diperbaharui, silakan selesaikan pembayaran untuk pesanan kamu melalui link berikut:\n\n🔗 Link Pembayaran (aktif selama ${parseFloat(
      (AppConfig.PAYMENT.DOKU.expiredTime / 60).toFixed(2)
    )} jam)\n${paymentLink}\n\n🆔 ID Pesanan:\n${
      ord.id
    }\n\nKamu juga bisa melihat status dan melakukan pembayaran ulang (jika link kadaluarsa) melalui dashboard:\n🌐 https://akucuciin.com/order\n\n📌 Jika link sudah tidak aktif, silakan buka dashboard dan klik tombol "Pay" / "Bayar" untuk mendapatkan link baru.\n\n====================\n\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderPaymentToCustomer = async (ord, paymentLink) => {
  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*🧾 [INFORMASI PEMBAYARAN]*\n\nHalo ${
      ord.customer.name
    },\nSilakan selesaikan pembayaran untuk pesanan kamu melalui link berikut:\n\n🔗 Link Pembayaran (aktif selama ${parseFloat(
      (AppConfig.PAYMENT.DOKU.expiredTime / 60).toFixed(2)
    )} jam)\n${paymentLink}\n\n🆔 ID Pesanan:\n${
      ord.id
    }\n\nKamu juga bisa melihat status dan melakukan pembayaran ulang (jika link kadaluarsa) melalui dashboard:\n🌐 https://akucuciin.com/order\n\n📌 Jika link sudah tidak aktif, silakan buka dashboard dan klik tombol "Pay" / "Bayar" untuk mendapatkan link baru.\n\n====================\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendOrderPaymentCompletedToCustomer = async (
  ord,
  invoiceNumber
) => {
  const formattedPriceAfter = formatRupiah(ord.price_after);

  const payload = {
    jid: `${ord.customer.telephone}@s.whatsapp.net`,
    content: `*✅ [PEMBAYARAN SUKSES]*\n\nHalo ${ord.customer.name}!\nPembayaran untuk pesanan kamu telah berhasil diproses 🧾✅.\n\nDetail:\n*Invoice Number*: ${invoiceNumber}\n*Total Bayar*: ${formattedPriceAfter}\n\nTerimakasih telah menggunakan layanan Akucuciin!\nKami akan segera memproses pesanan kamu dan mengabari jika ada pembaruan status.\n🧺 Stay clean, stay fresh!\n\n====================\n_Order ID: ${ord.id}_\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendReferralCodeSuccessfullyUsedToReferredCustomer = async (
  referredCustomer
) => {
  const payload = {
    jid: `${referredCustomer.telephone}@s.whatsapp.net`,
    content: `*✅ [REFERRAL CODE KAMU SUKSES DIGUNAKAN]*\n\nHalo ${referredCustomer.name}!\n\nReferral code kamu (${referredCustomer.referral_code}) sukses digunakan oleh orang lain lohhh\n\nStatistik Referral Code Kamu:\nTotal Sukses: ${referredCustomer.referral_code_success_count}\n\nYuk ajak ${referredCustomer.referral_code_until_next_reward} orang lagi untuk memakai kode referral kamu dan dapatkan voucher diskon!\n\n====================\n_Setiap 3 orang yang memakai referral code kamu dan menyelesaikan pesanan, kamu akan mendapatkan voucher diskon (berlaku kelipatan)_\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
  };

  const xSignature = generateXSignature(payload);

  await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
    headers: {
      'X-Signature': xSignature,
    },
  });
};

export const sendReferralCodeSuccessfullyUsedToReferredCustomerWithReward =
  async (referredCustomer, couponName, couponMultiplier) => {
    const payload = {
      jid: `${referredCustomer.telephone}@s.whatsapp.net`,
      content: `🎉🎉*VOUCHER DISKON UNTUKMU!*🎉🎉\n\nHalo ${referredCustomer.name}!\n\nTerima kasih sudah mengajak 3 teman kamu untuk laundry di AkuCuciin. Sebagai bentuk apresiasi, kamu berhak mendapatkan Voucher Diskon ${couponMultiplier}% secara GRATIS!\n\nKode Voucher: *${couponName}*\n_(Voucher hanya dapat digunakan untuk akun ${referredCustomer.email})_\n\nYuk, terus ajak temanmu pakai kode referralmu, dan kumpulkan lebih banyak voucher diskon berikutnya!\n\n====================\n_Setiap 3 orang yang memakai referral code kamu dan menyelesaikan pesanan, kamu akan mendapatkan voucher diskon (berlaku kelipatan)_\n_Pesan ini dikirim otomatis oleh sistem AkuCuciin._`,
    };

    const xSignature = generateXSignature(payload);

    await axios.post(`${AppConfig.Whatsapp.SEND_URL}/send`, payload, {
      headers: {
        'X-Signature': xSignature,
      },
    });
  };
