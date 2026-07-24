import { relativeDays } from './dates'

// A fully local, rule-based "Study Assistant". No network, no API key, it
// inspects the user's assessments and crafts helpful canned responses so the
// chat feels alive while staying offline.

export function buildContextMessage(assessments, classes) {
  if (!assessments.length) {
    return "Here's what I'm working on: I don't have any upcoming assessments yet. How should I plan my studying?"
  }
  const lines = assessments.map((a) => {
    const cls = classes.find((c) => c.id === a.classId)
    const clsLabel = cls ? ` (${cls.name})` : ''
    return `- ${a.title}${clsLabel}: ${a.type.toLowerCase()} due ${a.dueDate}`
  })
  return `Here's what I'm working on: My upcoming assessments:\n${lines.join(
    '\n'
  )}\nCan you help me prepare for these?`
}

function nextAssessment(assessments) {
  return [...assessments].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
}

export function assistantReply(userText, { assessments = [], classes = [], todayTasks = [], stats = {} }) {
  const text = userText.toLowerCase()
  const next = nextAssessment(assessments)
  const cls = next && classes.find((c) => c.id === next.classId)
  const clsName = cls?.name || (next ? 'this subject' : 'your classes')

  // Plan my week
  if (text.includes('week')) {
    const list = assessments
      .slice(0, 4)
      .map((a) => {
        const c = classes.find((cc) => cc.id === a.classId)
        return `• ${a.title}${c ? ` (${c.name})` : ''} — due ${relativeDays(a.dueDate).toLowerCase()}`
      })
      .join('\n')
    return `Here's a plan for your week${stats.streak ? ` (nice ${stats.streak}-day streak!)` : ''}:\n\n${
      list || '• No assessments yet — add a few with the + button and I\'ll schedule around them.'
    }\n\nI'd spread ~${stats.weeklyMinutes ? Math.max(30, Math.round((300 - stats.weeklyMinutes) / 5)) : 45} focus min/day across these, hardest-first, and keep the day before each due date light for review. Want me to drop study blocks on your calendar?`
  }

  // What should I focus on today
  if (text.includes('today') || text.includes('focus on') || text.includes('right now')) {
    const tasks = todayTasks.slice(0, 4).map((t) => `• ${t.title}`).join('\n')
    if (!tasks && !next) {
      return "Your plate's clear today — no tasks due and no assessments coming up. Great time to get ahead: add anything on your mind with the + button, or start a quick focus session."
    }
    return `Here's where I'd start today:\n\n${tasks || '• (no tasks logged for today)'}${
      next ? `\n\nThen chip away at your ${clsName} ${next.type.toLowerCase()} (${relativeDays(next.dueDate).toLowerCase()}).` : ''
    }\n\nPick one, start a focus session, and we'll build momentum. Want me to break the first one into steps?`
  }

  // Greeting / opening context message
  if (
    text.includes("here's what i'm working on") ||
    text.includes('help me prepare')
  ) {
    if (!next) {
      return "You don't have any assessments on the calendar yet. Tap the + button to add a test, quiz, or exam, give it a due date and difficulty, and I'll automatically lay out daily study blocks leading up to it. Want a hand picking a study schedule?"
    }
    return `I see you have a ${next.type.toLowerCase()} for ${clsName} coming up ${relativeDays(
      next.dueDate
    ).toLowerCase()}! I can definitely help you prepare.\n\nHere are a few ways I can assist:\n• We can create a study plan that fits your schedule.\n• I can generate some practice questions for your ${next.type.toLowerCase()}.\n• We can review specific topics within ${clsName} that you find challenging.\n\nWhat sounds most helpful to you right now?`
  }

  // Practice questions
  if (text.includes('practice') || text.includes('question') || text.includes('quiz me')) {
    const topic = next?.topics?.[0] || clsName
    return `Great, let's drill ${topic}. Try these:\n\n1. Explain ${topic} in your own words, as if teaching a friend.\n2. What's one common mistake people make with ${topic}?\n3. Give a real-world example where ${topic} applies.\n4. How does ${topic} connect to the other material in ${clsName}?\n\nAnswer out loud or jot them down, then tell me which felt shaky and we'll dig in.`
  }

  // Study plan
  if (text.includes('plan') || text.includes('schedule') || text.includes('when should')) {
    if (!next) {
      return 'Add an assessment first and I’ll auto-generate daily study blocks for it. The harder you mark it, the earlier the plan starts and the more days it spans.'
    }
    return `Here's a simple plan for your ${clsName} ${next.type.toLowerCase()} (${relativeDays(
      next.dueDate
    ).toLowerCase()}):\n\n• Days out: skim all topics, note what's unfamiliar.\n• Mid-stretch: deep-dive the hard topics, ${next.dailyStudyMinutes || 30} min/day.\n• Final 2 days: practice questions + active recall, light review only.\n\nI've already placed daily 9:00 AM study blocks on your calendar. Want me to suggest what to focus on each day?`
  }

  // Stress / motivation
  if (text.includes('stress') || text.includes('overwhelm') || text.includes('anxious')) {
    return "Totally normal, let's make it smaller. Pick just the next study block on your calendar and commit to those minutes only. Done is better than perfect. Want me to break your next assessment into bite-sized daily goals?"
  }

  // Specific topic help
  if (text.includes('explain') || text.includes('what is') || text.includes('how do')) {
    return `Good question. Here's how I'd think about it:\n\n1. Start with the core definition in plain language.\n2. Find the simplest example you understand fully.\n3. Change one variable and predict what happens.\n4. Re-explain it without looking.\n\nTell me the specific topic and I'll tailor this to ${clsName}.`
  }

  // Fallback
  if (!next) {
    return "I'm your study assistant! Add an assessment with the + button and I can build study plans, suggest topics, and quiz you. What would you like to work on?"
  }
  return `Happy to help with ${clsName}! I can:\n• Build a study plan around your ${next.type.toLowerCase()}\n• Generate practice questions\n• Review tricky topics\n\nJust let me know what you'd like to focus on.`
}
