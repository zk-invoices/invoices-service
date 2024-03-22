import express from 'express';
import resolveName from '../controllers/user/resolveName';

const root = express.Router();

root.get('/name', resolveName);

export default root;
