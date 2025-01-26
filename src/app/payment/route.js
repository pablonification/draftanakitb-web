import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

export async function POST(request) {
  try {
    const { email, message } = await request.json();
    
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const apiKey = "DEV-oStxvQXw3iNxvviRptEMBGfCMFxJllfyIMHaXVto";
    const merchant_code = process.env.TRIPAY_MERCHANT_CODE;
    const merchant_ref = 'TP' + Date.now();
    const amount = 3000;
    const expiry = parseInt(Math.floor(new Date()/1000) + (60*60));

    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchant_code + merchant_ref + amount)
      .digest('hex');

    const payload = {
      method: "QRISC",
      merchant_ref: merchant_ref,
      amount: amount,
      customer_name: "DraftAnakITB",
      customer_email: email || "placeholder@gmail.com",
      order_items: [
        {
          sku: "PAIDMENFESS",
          name: message || "PLACEHOLDER TWEET USER",
          price: 3000,
          quantity: 1
        }
      ],
      expired_time: expiry,
      signature: signature
    };

    const response = await axios.post(
      'https://tripay.co.id/api/transaction/create',
      payload,
      {
        headers: {
          'Authorization': 'Bearer ' + apiKey,
        },
        validateStatus: function (status) {
          return status < 999;
        }
      }
    );

    // Return the response from TriPay
    return NextResponse.json({
      success: true,
      merchantRef: merchant_ref,
      qrUrl: response.data.data.qr_url,
      amount: amount
    });

  } catch (error) {
    console.error('Payment error:', error.response?.data || error);
    return NextResponse.json(
      { error: 'Payment initialization failed', details: error.message },
      { status: 500 }
    );
  }
}