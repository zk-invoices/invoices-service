import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { RequestHandler } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// import config from './config';
import errorHandler from './middleware/errorHandler';
import fourOhFour from './middleware/fourOhFour';

import root from './routes/root';
import userRoutes from './routes/user';

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import Client from 'mina-signer';
import { getFirestore } from 'firebase-admin/firestore';

const client = new Client({ network: 'testnet' });

const app = express();

const firebaseApp = initializeApp({
  credential: applicationDefault(),
});

// Apply most middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({}));

app.use(helmet());
app.use(morgan('tiny'));

const firebaseMiddleware: RequestHandler = (req, res, next) => {
  req.firebase = firebaseApp;
  req.firestore = getFirestore(firebaseApp);

  return next();
};
app.use(firebaseMiddleware);

// Apply routes before error handling
app.use('/', root);
app.use('/user', userRoutes);

const loginHandler: RequestHandler = async (req, res) => {
  const { data, publicKey, signature } = req.body;

  const validMessage = client.verifyMessage({ data, publicKey, signature });

  if (!validMessage) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const auth = getAuth(firebaseApp);

  const customToken = await auth.createCustomToken(publicKey);

  return res.json({ token: customToken });
};

app.post('/login', loginHandler);

// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;
