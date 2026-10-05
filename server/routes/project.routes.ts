import { Router } from 'express'
import type { Response } from 'express'
import prisma from '../lib/prisma.js'
import openai from '../lib/openai.js'
import { protect } from '../middlewares/auth.js'
import type { AuthRequest } from '../middlewares/auth.js'

const router = Router()

const AI_MODEL = 'openrouter/free'

// ─── System prompts (from System Prompt.txt) ───────────────────────────────

const ENHANCE_CREATE_SYSTEM = `You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

    Enhance this prompt by:
    1. Adding specific design details (layout, color scheme, typography)
    2. Specifying key sections and features
    3. Describing the user experience and interactions
    4. Including modern web design best practices
    5. Mentioning responsive design requirements
    6. Adding any missing but important elements

    Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`

const GENERATE_CREATE_SYSTEM = (enhancedPrompt: string) =>
  `You are an expert web developer. Your ONLY job is to output raw HTML code. Nothing else.

OUTPUT RULES — FOLLOW EXACTLY:
- Start your response with <!DOCTYPE html> or <html
- End your response with </html>
- Do NOT write any explanation, comment, preamble, or markdown
- Do NOT use backticks or code fences
- Do NOT write "Here is" or "Sure" or any other text before the HTML

WEBSITE REQUIREMENTS for: "${enhancedPrompt}"
- Complete single-page HTML document
- Include in <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- Use only Tailwind CSS classes for all styling
- Make it responsive (sm: md: lg: prefixes)
- Use beautiful modern design with gradients, shadows, animations
- Include placeholder images from https://placehold.co/600x400
- Add interactivity with JavaScript before </body>

YOUR ENTIRE RESPONSE MUST BE VALID HTML STARTING WITH <!DOCTYPE html>`

const ENHANCE_REVISE_SYSTEM = `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

    Enhance this by:
    1. Being specific about what elements to change
    2. Mentioning design details (colors, spacing, sizes)
    3. Clarifying the desired outcome
    4. Using clear technical terms

    Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`

const GENERATE_REVISE_SYSTEM = `You are an expert web developer. Your ONLY job is to output updated HTML code.

OUTPUT RULES — FOLLOW EXACTLY:
- Start your response with <!DOCTYPE html> or <html
- End your response with </html>
- Do NOT write any explanation, comment, or markdown
- Do NOT use backticks or code fences

Apply the requested changes to the existing HTML while keeping all Tailwind CSS styling intact.
Return the COMPLETE updated HTML document.`

// ─── Helper ────────────────────────────────────────────────────────────────

function stripMarkdown(code: string): string {
  // Remove markdown fences
  let clean = code.replace(/```html/gi, '').replace(/```/g, '').trim()
  // If the result doesn't look like HTML at all, wrap it so the iframe still shows something
  if (!clean.includes('<') && !clean.includes('>')) {
    clean = `<html><body style="font-family:sans-serif;padding:2rem"><pre>${clean}</pre></body></html>`
  }
  return clean
}

// ─── Routes ────────────────────────────────────────────────────────────────

// POST / — Create a new project with 2-step AI generation
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body
  const userId = req.userId!

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'Prompt is required' })
  }

  // Check credits before doing anything
  const user = await prisma.user.findFirst({ where: { id: userId } })
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (user.credits < 5) {
    return res.status(400).json({ message: 'Not enough credits. Please buy more.' })
  }

  // Deduct credits upfront (roll back on failure)
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 5 }, totalCreations: { increment: 1 } },
  })

  try {
    // Create the project record
    const project = await prisma.websiteProject.create({
      data: {
        userId,
        name: prompt.slice(0, 60),
        initialPrompt: prompt,
      },
    })

    // Save user message to conversation
    await prisma.conversation.create({
      data: { projectId: project.id, role: 'user', content: prompt },
    })

    // Step 1: Enhance the prompt
    const enhanceCompletion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: ENHANCE_CREATE_SYSTEM },
        { role: 'user', content: prompt },
      ],
    })
    const enhancedPrompt = enhanceCompletion.choices[0]?.message.content || prompt

    // Step 2: Generate the full HTML website
    const generateCompletion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: GENERATE_CREATE_SYSTEM(enhancedPrompt) },
        { role: 'user', content: enhancedPrompt },
      ],
    })
    let code = generateCompletion.choices[0]?.message.content || ''
    code = stripMarkdown(code)

    // Save version + update project with the generated code
    const version = await prisma.version.create({
      data: { projectId: project.id, code },
    })

    const updatedProject = await prisma.websiteProject.update({
      where: { id: project.id },
      data: { currentCode: code, currentVersionIndex: version.id },
    })

    // Save assistant response to conversation
    await prisma.conversation.create({
      data: {
        projectId: project.id,
        role: 'assistant',
        content: 'I have created your website! You can preview it and request any changes.',
      },
    })

    res.json({ project: updatedProject })
  } catch (err: any) {
    console.error(err)
    // Roll back credits on failure
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 }, totalCreations: { decrement: 1 } },
    }).catch(() => {})
    res.status(500).json({ message: 'Generation failed', error: err?.message })
  }
})

// GET /mine — Get the logged-in user's projects
router.get('/mine', protect, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ projects })
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch projects', error: err?.message })
  }
})

// GET /community — Get all public projects (no auth required)
router.get('/community', async (req, res) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    })
    // Fetch creator name separately to avoid include issues with driver adapter
    const projectsWithUser = await Promise.all(
      projects.map(async (p) => {
        const user = await prisma.user.findFirst({ where: { id: p.userId } })
        return { ...p, user: { name: user?.name ?? '' } }
      })
    )
    res.json({ projects: projectsWithUser })
  } catch (err: any) {
    console.error('Community error full:', err)
    res.status(500).json({ message: 'Failed to fetch community projects', error: err?.message })
  }
})

// GET /:id — Get a single project + its conversation history (owner only)
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.websiteProject.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const conversations = await prisma.conversation.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    })

    res.json({ project, conversations })
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch project', error: err?.message })
  }
})

// POST /:id/update — Chat-based revision with 2-step AI (owner only)
router.post('/:id/update', protect, async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body
  const userId = req.userId!

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'Prompt is required' })
  }

  try {
    const project = await prisma.websiteProject.findFirst({
      where: { id: req.params.id as string, userId },
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const user = await prisma.user.findFirst({ where: { id: userId } })
    if (!user || user.credits < 5) {
      return res.status(400).json({ message: 'Not enough credits. Please buy more.' })
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    })

    // Save user message
    await prisma.conversation.create({
      data: { projectId: project.id, role: 'user', content: prompt },
    })

    // Step 1: Enhance the revision request
    const enhanceCompletion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: ENHANCE_REVISE_SYSTEM },
        { role: 'user', content: prompt },
      ],
    })
    const enhancedRevision = enhanceCompletion.choices[0]?.message.content || prompt

    // Step 2: Generate the updated full HTML
    const generateCompletion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: GENERATE_REVISE_SYSTEM },
        {
          role: 'user',
          content: `Existing code:\n${project.currentCode}\n\nChange requested: ${enhancedRevision}`,
        },
      ],
    })
    let code = generateCompletion.choices[0]?.message.content || ''
    code = stripMarkdown(code)

    // Save new version + update project
    const version = await prisma.version.create({
      data: { projectId: project.id, code },
    })

    await prisma.websiteProject.update({
      where: { id: project.id },
      data: { currentCode: code, currentVersionIndex: version.id },
    })

    // Save assistant response
    await prisma.conversation.create({
      data: { projectId: project.id, role: 'assistant', content: 'I have updated your website!' },
    })

    const updatedProject = await prisma.websiteProject.findFirst({ where: { id: project.id } })
    const conversations = await prisma.conversation.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    })

    res.json({ project: updatedProject, conversations })
  } catch (err: any) {
    console.error(err)
    // Roll back credits on failure
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 } },
    }).catch(() => {})
    res.status(500).json({ message: 'Update failed', error: err?.message })
  }
})

// PATCH /:id/publish — Publish a project to the community (owner only)
router.patch('/:id/publish', protect, async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.websiteProject.findFirst({
      where: { id: req.params.id as string, userId: req.userId! },
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await prisma.websiteProject.update({
      where: { id: project.id },
      data: { isPublic: true },
    })
    res.json({ message: 'Published successfully' })
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to publish', error: err?.message })
  }
})

// GET /:id/code — Get public HTML code (no auth, only if isPublic = true)
router.get('/:id/code', async (req, res) => {
  try {
    const project = await prisma.websiteProject.findFirst({ where: { id: req.params.id as string } })
    if (!project || !project.isPublic) {
      return res.status(404).json({ message: 'Not found or not published' })
    }
    res.json({ code: project.currentCode })
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch code', error: err?.message })
  }
})

export default router
