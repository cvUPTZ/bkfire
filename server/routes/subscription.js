import express from 'express';
import { z } from 'zod';

export const subscriptionRouter = express.Router();

const subscriptionSchema = z.object({
  email: z.string().email()
});

const subscribers = new Set();

subscriptionRouter.post('/', (req, res) => {
  try {
    const { email } = subscriptionSchema.parse(req.body);
    
    if (subscribers.has(email)) {
      return res.status(400).json({ error: 'Already subscribed' });
    }

    subscribers.add(email);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid email address' });
  }
});