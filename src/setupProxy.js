const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app
		.use(
			'/backend',
			createProxyMiddleware({
				target: 'http://de-th2-qa:30000/editor/',
				changeOrigin: true,
				secure: false,
			}),
		)
		.use(
			'/grafana',
			createProxyMiddleware({
				target: 'http://de-th2-qa:30000/',
				changeOrigin: true,
				secure: false,
			}),
		);
};
