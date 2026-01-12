
import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);

// TODO: Implement refresh token route
// router.post('/refresh', refreshToken);

export default router;
