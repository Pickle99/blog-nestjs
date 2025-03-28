import { User } from '../users/user.entity';

declare module 'express' {
  interface Request {
    user?: User; // Define `user` on the request object
  }
}
