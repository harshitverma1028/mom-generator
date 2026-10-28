require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const meetingRoutes = require('./routes/meetings')

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '5mb' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MeetScribe API' }))
app.use('/api/auth', authRoutes)
app.use('/api/meetings', meetingRoutes)
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ message: 'Something went wrong on the server.' })
})

const port = process.env.PORT || 5000
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meetscribe')
  .then(() => app.listen(port, () => console.log(`MeetScribe API running on http://localhost:${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1) })
