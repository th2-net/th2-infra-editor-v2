const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
		'/api',
		createProxyMiddleware('/backend', {
			target: 'http://th2-qa:30000/editor/',
			changeOrigin: true,
			secure: false,
		}),
	);
};
