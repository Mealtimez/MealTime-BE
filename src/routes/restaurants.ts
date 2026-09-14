import { Router } from 'express';

export const restaurantRoutes = Router();

restaurantRoutes.get('/', (req, res) => {
  res.json({ 
    restaurants: [
      { id: '1', name: 'Sample Restaurant', cuisine: 'Italian', rating: 4.5 }
    ] 
  });
});

restaurantRoutes.get('/:id', (req, res) => {
  res.json({ 
    id: req.params.id, 
    name: 'Sample Restaurant', 
    cuisine: 'Italian',
    menu: []
  });
});
