import { env } from '../config/env.config.js';

class HealthController {
  getStatus(_req, res) {
    return res.status(200).json({
      status: 'success',
      data: {
        service: 'ShipNow API',
        api: 'up',
        environment: env.nodeEnv,
        uptime: Number(process.uptime().toFixed(3)),
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const healthController = new HealthController();
