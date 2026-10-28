const cleanList = value => Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : []

function fallbackMinutes(transcript) {
  const lines = transcript.split(/\n+/).map(line => line.trim()).filter(Boolean)
  const sentences = transcript.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
  const speakerLines = lines.filter(line => /^[\w .'-]{1,35}:\s+/.test(line))
  const contentLines = speakerLines.length ? speakerLines : lines
  const decisions = contentLines.filter(line => /\b(decided|decision|agreed|let's use|will use|won't|will not|not for|approved|selected)\b/i.test(line)).map(line => line.replace(/^[\w .'-]{1,35}:\s*/, ''))
  const actions = []
  for (const line of contentLines) {
    const match = line.match(/^([\w .'-]{1,35}):\s*(.+)$/)
    if (!match) continue
    const body = match[2]
    if (/\b(i'll|i will|can you|please|should|need to|will complete|will handle|will finish|coordinate|arrange|test|finish|integrate|implement)\b/i.test(body)) {
      const deadline = body.match(/\b(by|before|on)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|tomorrow|next week|\w+\s+\d{1,2})\b/i)?.[2] || ''
      actions.push({ task: body.replace(/^(i'll|i will)\s*/i, '').replace(/[.!?]+$/, ''), owner: match[1].trim(), deadline, priority: /urgent|asap|critical/i.test(body) ? 'High' : 'Medium', completed: false })
    }
  }
  const keyPoints = (contentLines.length ? contentLines : sentences).slice(0, 6).map(line => line.replace(/^[\w .'-]{1,35}:\s*/, '').replace(/[.!?]+$/, ''))
  return {
    summary: sentences.slice(0, 3).join(' ').slice(0, 700) || 'No summary could be created from this transcript.',
    keyPoints: cleanList(keyPoints),
    decisions: cleanList(decisions.length ? decisions : ['No explicit decisions were identified.']),
    actionItems: actions.slice(0, 15),
    openQuestions: cleanList(contentLines.filter(line => /\?\s*$/.test(line)).map(line => line.replace(/^[\w .'-]{1,35}:\s*/, '')))
  }
}

async function generateMinutes(transcript, title, attendees = []) {
  if (!process.env.GEMINI_API_KEY) return fallbackMinutes(transcript)
  const prompt = `Create accurate minutes for this meeting. Return only valid JSON with these fields: summary (string), keyPoints (string array), decisions (string array), actionItems (array of {task, owner, deadline, priority, completed}), openQuestions (string array). Priority must be Low, Medium, or High; completed must be false. Do not invent owners, deadlines, or decisions. If missing, use "Unassigned" for owner and "Not specified" for deadline. If there are no decisions or questions, use an empty array. Keep summary concise. Title: ${title}. Attendees: ${attendees.join(', ') || 'Not specified'}. Transcript:\n${transcript}`
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } })
  })
  if (!response.ok) throw new Error('AI provider request failed. Check your Gemini API key and model setting.')
  const result = await response.json()
  const raw = result.candidates?.[0]?.content?.parts?.map(part => part.text).join('')
  if (!raw) throw new Error('The AI provider returned an empty response.')
  const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim())
  return {
    summary: String(parsed.summary || ''), keyPoints: cleanList(parsed.keyPoints), decisions: cleanList(parsed.decisions),
    actionItems: (Array.isArray(parsed.actionItems) ? parsed.actionItems : []).map(item => ({
      task: String(item.task || ''), owner: String(item.owner || 'Unassigned'), deadline: String(item.deadline || 'Not specified'),
      priority: ['Low', 'Medium', 'High'].includes(item.priority) ? item.priority : 'Medium', completed: false
    })).filter(item => item.task), openQuestions: cleanList(parsed.openQuestions)
  }
}

module.exports = { generateMinutes, fallbackMinutes }
