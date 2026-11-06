import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), AuthController.register);
authRouter.post('/login', validateBody(loginSchema), AuthController.login);
authRouter.get('/me', authenticateJWT, AuthController.getMe);
authRouter.post('/logout', AuthController.logout);
