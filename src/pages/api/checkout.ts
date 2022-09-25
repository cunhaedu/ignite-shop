import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { priceId } = req.body;

  if(req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if(!priceId) {
    return res.status(400).json({ error: 'Price not provided' });
  }

  const success_url = `${process.env.NEXT_URL}/success`;
  const cancel_url = `${process.env.NEXT_URL}/`;

  const { url: checkoutUrl } = await stripe.checkout.sessions.create({
    success_url,
    cancel_url,
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ]
  });

  return res.status(201).json({ checkoutUrl })
}