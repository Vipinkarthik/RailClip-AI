const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const componentRoutes = require('./routes/componentRoutes');
const workerRoutes = require('./routes/workerRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
	})
);
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.json({ success: true, message: 'RailClip AI backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/inspections', inspectionRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
	const server = app.listen(PORT, () => {
		console.log(`Backend listening on port ${PORT}`);
	});

	server.on('error', (error) => {
		console.error('Backend server error:', error);
		process.exit(1);
	});

	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:', error);
		process.exit(1);
	});

	process.on('unhandledRejection', (error) => {
		console.error('Unhandled rejection:', error);
		process.exit(1);
	});
}

module.exports = app;
