import express from 'express';
import { deleteProperty, getAllProperties, getPropertyById,  updatePropertyField, postAProperty} from '../controllers/propertyController.js';
const propertyRouter = express.Router();


propertyRouter.post('/addDeal', postAProperty)
propertyRouter.get('/', getAllProperties)
propertyRouter.get('/:id', getPropertyById)
propertyRouter.delete('/:id', deleteProperty)
propertyRouter.put('/:id', updatePropertyField)



export default propertyRouter;