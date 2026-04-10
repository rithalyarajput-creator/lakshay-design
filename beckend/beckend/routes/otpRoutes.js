const express = require('express');
const router = express.Router();

// In-memory OTP store: { phone -> { otp, expiry, attempts } }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    // Dev mode: just log the OTP
    console.log(`[OTP DEV] Phone: ${phone} | OTP: ${otp}`);
    return { success: true, dev: true };
  }
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: phone,
    }),
  });
  const data = await res.json();
  if (!data.return) throw new Error(data.message || 'SMS failed');
  return { success: true };
}

// POST /api/otp/send
router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '10-digit phone number required' });
    }

    // Rate limit: check if previous OTP is still fresh (< 30 seconds old)
    const existing = otpStore.get(phone);
    if (existing && Date.now() - (existing.expiry - OTP_EXPIRY_MS) < 30000) {
      return res.status(429).json({ success: false, message: 'Please wait 30 seconds before requesting again' });
    }

    const otp = generateOTP();
    otpStore.set(phone, { otp, expiry: Date.now() + OTP_EXPIRY_MS, attempts: 0 });

    await sendSMS(phone, otp);

    res.json({ success: true, message: `OTP sent to ${phone.replace(/(\d{2})\d{6}(\d{2})/, '$1xxxxxx$2')}` });
  } catch (err) {
    console.error('OTP send error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
  }
});

// POST /api/otp/verify
router.post('/verify', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP required' });
  }

  const record = otpStore.get(phone);
  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found. Request a new OTP.' });
  }
  if (Date.now() > record.expiry) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: 'OTP expired. Request a new OTP.' });
  }

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
  }

  if (record.otp !== otp.toString()) {
    return res.status(400).json({ success: false, message: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempts left.` });
  }

  otpStore.delete(phone);
  res.json({ success: true, message: 'Phone verified successfully' });
});

module.exports = router;
