import { Router } from 'express';

import { healthController } from '../controllers/health.controller.js';

const healthRouter = Router();

healthRouter.get('/', healthController.getStatus);

export default healthRouter;
