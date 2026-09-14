import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { orderRoutes } from './routes/orders';
import { restaurantRoutes } from './routes/restaurants';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MealTime API' });
});

app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.listen(PORT, () => {
  console.log(`MealTime API running on port ${PORT}`);
});
