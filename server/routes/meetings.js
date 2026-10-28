const router = require('express').Router()
const Meeting = require('../models/Meeting')
const auth = require('../middleware/auth')
const { generateMinutes } = require('../utils/minutes')

router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100)
    res.json({ meetings })
  } catch (error) { next(error) }
})

router.post('/generate', async (req, res) => {
  try {
    const { title, transcript, attendees = [] } = req.body
    if (!title?.trim() || !transcript?.trim()) return res.status(400).json({ message: 'A meeting title and transcript are required.' })
    if (transcript.length > 100000) return res.status(413).json({ message: 'Please keep transcripts under 100,000 characters.' })
    const minutes = await generateMinutes(transcript, title, attendees)
    res.json({ minutes, mode: process.env.GEMINI_API_KEY ? 'ai' : 'fallback' })
  } catch (error) { res.status(502).json({ message: error.message || 'Could not generate minutes.' }) }
})

router.post('/', async (req, res, next) => {
  try {
    const { title, transcript, attendees, meetingDate, summary, keyPoints, decisions, actionItems, openQuestions } = req.body
    if (!title?.trim()) return res.status(400).json({ message: 'Meeting title is required.' })
    const meeting = await Meeting.create({ user: req.userId, title, transcript, attendees, meetingDate, summary, keyPoints, decisions, actionItems, openQuestions })
    res.status(201).json({ meeting })
  } catch (error) { next(error) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['title', 'summary', 'keyPoints', 'decisions', 'actionItems', 'openQuestions', 'attendees', 'meetingDate']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
    const meeting = await Meeting.findOneAndUpdate({ _id: req.params.id, user: req.userId }, updates, { new: true, runValidators: true })
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' })
    res.json({ meeting })
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!meeting) return res.status(404).json({ message: 'Meeting not found.' })
    res.json({ message: 'Meeting deleted.' })
  } catch (error) { next(error) }
})

module.exports = router
