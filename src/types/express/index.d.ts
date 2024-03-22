export {}

import { App } from 'firebase-admin/app';
import { Firestore } from 'firebase-admin/firestore';

declare global {
  namespace Express {
    export interface Request {
      firebase?: App;
      firestore?: Firestore
    }
  }
}