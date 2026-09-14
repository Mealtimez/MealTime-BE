import { Router } from 'express';

export const orderRoutes = Router();

orderRoutes.get('/', (req, res) => {
  res.json({ orders: [] });
});

orderRoutes.post('/', (req, res) => {
  const { restaurantId, items, totalAmount } = req.body;
  res.status(201).json({ 
    id: '1', 
    restaurantId, 
    items, 
    totalAmount, 
    status: 'pending' 
  });
});

orderRoutes.get('/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
});
