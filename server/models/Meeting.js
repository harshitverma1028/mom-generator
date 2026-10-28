const mongoose = require('mongoose')

const actionItemSchema = new mongoose.Schema({
  task: { type: String, default: '' },
  owner: { type: String, default: '' },
  deadline: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  completed: { type: Boolean, default: false }
}, { _id: false })

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  transcript: { type: String, default: '' },
  attendees: [{ type: String, trim: true }],
  meetingDate: { type: Date, default: Date.now },
  summary: { type: String, default: '' },
  keyPoints: [{ type: String }],
  decisions: [{ type: String }],
  actionItems: [actionItemSchema],
  openQuestions: [{ type: String }]
}, { timestamps: true })

module.exports = mongoose.model('Meeting', meetingSchema)
