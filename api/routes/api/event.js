import express from 'express';
import postAEvent from '../../controllers/eventController.js';
const eventRouter = express.Router();


eventRouter.post('/', postAEvent)



export default eventRouter;