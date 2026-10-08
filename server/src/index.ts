import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import workflowRoutes from './routes/workflows';
import runRoutes from './routes/runs';
// import templateRoutes from './routes/templates';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3001;

// Global Prisma Client
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/runs', runRoutes);
// app.use('/api/templates', templateRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
