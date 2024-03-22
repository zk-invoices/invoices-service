import { RequestHandler } from 'express';
import isEmail from 'validator/lib/isEmail';

import crypto from 'crypto';
import { PrivateKey } from 'o1js';

/**
 * Resolve email to an address
 */
const resolveName: RequestHandler = async (req, res) => {
  const email = req.query.email as string;

  if (!isEmail(email)) {
    return res.status(400).json({ error: { message: 'Invalid email passed' }})
  }

  const emailHash = crypto.createHash('sha256').update(email).digest('hex');
  const existingAddress = await req.firestore?.doc(`names/${emailHash}`).get();

  if (existingAddress?.exists) {
    return res.json({
      email,
      address: existingAddress.get('public')
    });
  }

  const key = PrivateKey.random();

  await req.firestore?.doc(`names/${emailHash}`).set({
    private: key.toBase58(),
    public: key.toPublicKey().toBase58()
  });

  return res.json({
    email,
    address: key.toPublicKey().toBase58()
  });
};

export default resolveName;
