import { Router } from 'express';
import { MoodController } from '../controllers/MoodController.js';
import verifyToken from '../helpers/verify-token.js';

const router = Router();

// Todas as rotas requerem autenticação
router.post('/create', verifyToken, MoodController.create);
router.get('/all', verifyToken, MoodController.getAll);
router.get('/latest', verifyToken, MoodController.getLatest);
router.get('/stats', verifyToken, MoodController.getStats);
router.get('/range', verifyToken, MoodController.getByDateRange);
router.get('/:id', verifyToken, MoodController.getById);
router.put('/:id', verifyToken, MoodController.update);
router.delete('/:id', verifyToken, MoodController.delete);

export default router;
