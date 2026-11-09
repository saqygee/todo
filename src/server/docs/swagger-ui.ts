/** All assets and the description are local. This page never submits task requests. */
export const swaggerHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Everyday API documentation</title><link rel="stylesheet" href="/api/docs/swagger-ui.css"></head>
<body><header><h1>Everyday API documentation</h1><p>Browse-only reference. No authentication is required. <a href="/api/openapi.json">OpenAPI JSON</a></p></header>
<p id="docs-status">Preparing documentation. If this message remains, refresh after the backend and documentation assets are available.</p>
<div id="swagger-ui"></div><script src="/api/docs/swagger-ui-bundle.js"></script><script src="/api/docs/initializer.js"></script></body></html>`;

export const swaggerInitializer = `(() => {
  const status = document.getElementById('docs-status');
  const failure = () => { status.hidden = false; status.textContent = 'Documentation is unavailable or invalid. Refresh this page after backend availability is restored.'; };
  try {
    if (typeof SwaggerUIBundle !== 'function') { failure(); return; }
    window.ui = SwaggerUIBundle({
      url: '/api/openapi.json', dom_id: '#swagger-ui',
      supportedSubmitMethods: [], validatorUrl: null, queryConfigEnabled: false,
      presets: [SwaggerUIBundle.presets.apis],
      onComplete: () => {
        const state = window.ui.getState();
        const spec = state.getIn(['spec', 'json']);
        if (!spec || spec.get('openapi') !== '3.0.3' || !spec.get('paths')) failure();
        else status.hidden = true;
      },
      responseInterceptor: response => { if (response.url.includes('/api/openapi.json') && response.status !== 200) failure(); return response; }
    });
    window.addEventListener('unhandledrejection', failure);
    window.addEventListener('error', failure);
  } catch { failure(); }
})();`;
