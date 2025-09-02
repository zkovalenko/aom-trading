import 'express-session';

declare module 'express-session' {
  interface SessionData {
    subscriptionRedirect?: {
      redirect: string;
      product: string;
      type: string;
    };
  }
}