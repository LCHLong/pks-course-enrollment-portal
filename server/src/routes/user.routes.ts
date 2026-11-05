import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, changePasswordSchema } from '../validations/user.validation.js';

export const userRouter = Router();

userRouter.use(authenticateJWT);

userRouter.get('/profile', UserController.getProfile);
userRouter.put('/profile', validateBody(updateProfileSchema), UserController.updateProfile);
userRouter.post('/change-password', validateBody(changePasswordSchema), UserController.changePassword);
userRouter.put('/change-password', validateBody(changePasswordSchema), UserController.changePassword);
