import express from 'express';
import { deleteProperty, getAllProperties, getPropertyById,  updatePropertyField } from '../controllers/propertyController.js';
const router = express.Router();


//router.post('/addDeal', postAProperty)
router.get('/', getAllProperties)
router.get('/:id', getPropertyById)
router.delete('/:id', deleteProperty)
router.put('/:id', updatePropertyField)



export default router;