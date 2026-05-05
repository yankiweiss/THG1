import express from 'express';
import { deleteProperty, getAllProperties, getPropertyById, postAProperty, updatePropertyField } from '../../controllers/propertyController.js';
const router = express.Router();


router.post('/addDeal', postAProperty)
router.get('/:id', getPropertyById)
router.get('/', getAllProperties)
router.delete('/:id', deleteProperty)
router.put('/:id', updatePropertyField)



export default router;