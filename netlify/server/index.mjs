import { app } from '../../server.ts';

export const config = { path: '/api/*' };

// Netlify hosts the Express app; Vite's output serves the storefront.
export default app;
