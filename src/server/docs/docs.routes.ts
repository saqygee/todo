import { Router } from 'express';
import { createRequire } from 'node:module';
import { openapiDocument } from './openapi.js';
import { swaggerHtml, swaggerInitializer } from './swagger-ui.js';
import { notFoundHandler } from '../middleware/not-found.js';

const require = createRequire(import.meta.url);
const assets = new Map([
  ['swagger-ui.css', require.resolve('swagger-ui-dist/swagger-ui.css')],
  ['swagger-ui-bundle.js', require.resolve('swagger-ui-dist/swagger-ui-bundle.js')],
]);

export function docsRoutes() {
  const router = Router();
  router.get('/openapi.json', (_req, res) => { res.json(openapiDocument); });
  router.get('/docs', (req, res) => {
    // Express treats trailing slashes equivalently; inspect the actual path to
    // avoid redirecting /docs/ back to itself.
    if (!req.path.endsWith('/')) { res.redirect(302, '/api/docs/'); return; }
    res.type('html').send(swaggerHtml);
  });
  router.get('/docs/initializer.js', (_req, res) => { res.type('js').send(swaggerInitializer); });
  router.get('/docs/:asset', (req, res, next) => {
    const file = assets.get(req.params.asset);
    if (!file) { next(); return; }
    res.sendFile(file, error => { if (error) next(error); });
  });
  router.use('/docs', notFoundHandler);
  return router;
}
