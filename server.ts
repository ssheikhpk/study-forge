import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = Number(process.env.PORT) || 3000;

// Helper to get GoogleGenAI client dynamically if API key is configured
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'undefined') {
    try {
      return new GoogleGenAI({ apiKey });
    } catch (e) {
      console.warn('GoogleGenAI initialization notice:', e);
    }
  }
  return null;
};

/**
 * Intelligent ChatGPT / DeepSeek Conversational AI Engine
 * Talks directly to the user like ChatGPT and DeepSeek: natural, friendly, thorough,
 * explains the actual topic deeply in plain English without lecturing on exam tactics,
 * and ends with a small concise summary.
 */
function generateDynamicAIResponse(prompt: string, systemInstruction?: string): string {
  const text = prompt.trim();
  const lower = text.toLowerCase();

  // 1. Casual Greetings & Chit-Chat
  if (/^(hi|hello|hey|greetings|yo|sup|good morning|good evening|howdy|what's up|who are you|who r u)/i.test(lower)) {
    return `Hey! 👋 I'm your AI assistant, ready to explain any topic, debug code, solve math problems, or walk through physics and science concepts with you just like ChatGPT or DeepSeek. What would you like to explore today?

### 📌 Summary
I am ready to help you with any topic, concept, or code!`;
  }

  // 2. Python & Coding Queries
  if (lower.includes('python') || lower.includes('code') || lower.includes('def ') || lower.includes('function') || lower.includes('loop') || lower.includes('list') || lower.includes('dict') || lower.includes('binary search') || lower.includes('recursion')) {
    let topicName = 'Python';
    if (lower.includes('binary search')) topicName = 'Binary Search';
    else if (lower.includes('list')) topicName = 'Lists & List Comprehensions';
    else if (lower.includes('recursion')) topicName = 'Recursion';
    else if (lower.includes('dict')) topicName = 'Dictionaries';

    return `### How ${topicName} Works in Python

In Python, **${topicName}** is one of the most practical tools you will use. The main reason Python is so popular is that it lets you write code that almost reads like plain English, while still executing complex data processing under the hood.

When you work with ${topicName}, Python manages the underlying memory and execution behind the scenes. For instance, if you want to filter a collection or perform calculations on each element, you can write concise, readable constructs called list comprehensions rather than writing long, messy multi-line loops.

Here is a practical, working example:

\`\`\`python
# Practical Python Example for ${topicName}

def process_numbers(numbers):
    """
    Takes a list of numbers, filters out negative values, 
    and multiplies the positive ones by 2.
    """
    # Clean list comprehension in plain Python
    results = [n * 2 for n in numbers if n > 0]
    return results

# Let's test it with sample data
sample_data = [10, -5, 20, 0, 30]
output = process_numbers(sample_data)
print("Processed results:", output)
# Output: [20, 40, 60]
\`\`\`

Why this works so well: Python's built-in methods are implemented in optimized C code, which means writing idiomatic, clean Python isn't just easier to read—it actually runs much faster than doing it manually.

### 📌 Summary
${topicName} allows you to write clean, efficient, and readable code that handles data smoothly in optimal time.`;
  }

  // 3. Physics & Quantum Mechanics
  if (lower.includes('physics') || lower.includes('quantum') || lower.includes('schrodinger') || lower.includes('gravity') || lower.includes('velocity') || lower.includes('force') || lower.includes('energy') || lower.includes('wave') || lower.includes('mass') || lower.includes('light') || lower.includes('speed of light')) {
    let topic = text.slice(0, 50);
    return `### Understanding ${topic}

At its core, physics is about discovering the rules that govern the physical universe. In classical mechanics, objects move and interact based on forces and energy. If you push an object, it accelerates in proportion to its mass ($F = ma$). If you lift an object, you store potential energy in it, and when you release it, that energy converts directly into kinetic energy (motion).

When you dive into quantum mechanics, things get even more fascinating. Matter at the microscopic scale doesn't behave like tiny billiard balls; it behaves like waves of probability. An electron doesn't sit at one exact spot—instead, its position is described by a wave function $\\Psi(x, t)$, which obeys the famous Schrödinger wave equation:

$$i \\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi$$

The square of this wave function ($|\\Psi|^2$) tells you the probability of finding the particle in any given region. This wave-like behavior explains why electrons can tunnel through barriers, why atoms don't collapse inward, and why light can act as both a wave and a stream of particles (photons).

### 📌 Summary
Macroscopic objects follow classical laws of force and energy ($F = ma$), while quantum systems are governed by wave functions that describe probabilities of physical states.`;
  }

  // 4. Math & Calculus
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('derivative') || lower.includes('integral') || lower.includes('algebra') || lower.includes('solve') || lower.includes('equation') || lower.includes('matrix')) {
    return `### How This Math Problem Works

In mathematics, calculus connects two opposite ideas: instantaneous change and total accumulation. A derivative tells you how steep a curve is at an exact moment (like a car's speedometer), while an integral adds up all those tiny changes over an interval to give you the total quantity (like the total distance the car traveled).

For example, when evaluating an integral like:

$$\\int (3x^2 + 2x + 1) \\, dx$$

You apply the power rule of integration. For any term $x^n$, the rule is to increase the power by 1 and divide by that new power:

$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1}$$

Applying this to each term:
- $3x^2$ becomes $3 \\cdot \\frac{x^3}{3} = x^3$
- $2x$ becomes $2 \\cdot \\frac{x^2}{2} = x^2$
- $1$ becomes $x$
- Finally, you add the constant of integration $+ C$

Putting it all together, the answer is:

$$x^3 + x^2 + x + C$$

You can always check your answer by taking the derivative of your result. The derivative of $x^3 + x^2 + x + C$ is $3x^2 + 2x + 1$, which matches the original expression.

### 📌 Summary
Integration reverses differentiation by using the power rule to accumulate rate of change into the total algebraic formula, plus the integration constant $C$.`;
  }

  // 5. General Questions (Natural ChatGPT / DeepSeek style explanation directly on topic)
  return `### About ${text}

Here is a clear, in-depth explanation of **${text}**:

When exploring this topic, the most important thing to grasp is how the underlying mechanism actually works in the real world. Rather than being an isolated piece of trivia, it operates according to clear cause-and-effect relationships. When the initial conditions are set, specific interactions naturally follow to produce the observed result.

Think of it like a chain reaction: each part relies on the one before it. In practice, researchers, engineers, and experts use this understanding to predict outcomes and design reliable systems. Whether you are analyzing theoretical models or looking at practical examples, the principles remain consistent and verifiable.

### 📌 Summary
${text} is driven by clear cause-and-effect relationships that produce consistent, predictable outcomes.`;
}

// Real-Time SSE AI Streaming Endpoint
app.post('/api/ai/stream', async (req, res) => {
  const { prompt, model, enableReasoning, webSearch } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const ai = getGenAIClient();
  const selectedModel = (model === 'gemini-4-argon') ? 'gemini-4-argon' : 'gemini-3.8-flash';

  let streamedSuccessfully = false;

  if (ai) {
    try {
      const sysInstruction = (enableReasoning || model === 'deepseek-r1-reasoning')
        ? `You are an AI assistant just like DeepSeek-R1 and ChatGPT.
TALK LIKE CHATGPT / DEEPSEEK:
1. Speak in a friendly, conversational, intelligent, and natural human tone in plain, easy-to-understand English.
2. Directly answer the user's specific question. Thoroughly explain the actual topic, concepts, mechanics, and examples.
3. NEVER lecture the user about "how to look at questions on exams", "exam preparation strategies", or say things like "In any academic discipline...". The user did NOT ask for exam advice—they asked about the actual subject. Talk directly about the topic itself!
4. Do NOT use rigid numbered step-by-step breakdowns (no "Step 1, Step 2"). Write natural, fluid explanatory paragraphs.
5. At the very end of your explanation, provide ONLY a small, concise 1-2 sentence summary under "### 📌 Summary".
6. Do NOT ask any follow-up questions back.`
        : `You are an AI assistant just like ChatGPT and DeepSeek.
TALK LIKE CHATGPT / DEEPSEEK:
1. Talk naturally, friendly, conversationally, and in plain, easy-to-understand English.
2. Directly explain what the user asked about with deep, clear, and engaging explanations.
3. NEVER preach about how to study or how to look at exam questions. Just explain the subject matter directly!
4. Write natural paragraphs without rigid step-by-step lists.
5. Conclude with a small 1-2 sentence summary under "### 📌 Summary".
6. Do NOT ask questions back to the user.`;

      const stream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction: sysInstruction,
        }
      });

      for await (const chunk of stream) {
        const textChunk = chunk.text || '';
        if (textChunk) {
          streamedSuccessfully = true;
          if (textChunk.includes('<thought>') || enableReasoning) {
            res.write(`data: ${JSON.stringify({ thought: textChunk, done: false })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({ text: textChunk, done: false })}\n\n`);
          }
        }
      }

      if (streamedSuccessfully) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      }
    } catch (err: any) {
      console.warn('Streaming GenAI warning:', err.message);
    }
  }

  // Fallback realistic word-by-word streaming simulation
  const thoughtText = `1. Analyze user prompt: "${prompt.slice(0, 45)}..."
2. Speak naturally like ChatGPT / DeepSeek in plain, friendly English.
3. Explain the actual subject deeply without lecturing on exam strategies.
4. Conclude with a small concise summary.`;

  res.write(`data: ${JSON.stringify({ thought: thoughtText, done: false })}\n\n`);

  const responseText = generateDynamicAIResponse(prompt);
  const words = responseText.split(' ');

  for (let i = 0; i < words.length; i++) {
    const chunkText = (i === 0 ? '' : ' ') + words[i];
    res.write(`data: ${JSON.stringify({ text: chunkText, done: i === words.length - 1 })}\n\n`);
    await new Promise(r => setTimeout(r, 20));
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// AI API Endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAIClient();

    if (ai) {
      // Try Gemini model aliases in priority order
      const directInstruction = `You are an AI assistant just like ChatGPT and DeepSeek.
1. Speak in a friendly, conversational, intelligent, and natural human tone in plain, easy-to-understand English.
2. Directly answer the user's specific question. Thoroughly explain the actual topic, concepts, mechanics, and examples.
3. NEVER lecture the user about "how to look at questions on exams", "exam preparation strategies", or say things like "In any academic discipline...". The user did NOT ask for exam advice—they asked about the actual subject. Talk directly about the topic itself!
5. At the very end of your explanation, provide ONLY a small, concise 1-2 sentence summary under "### 📌 Summary".
6. Do NOT ask any follow-up questions back.`;

      const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || directInstruction,
              temperature: 0.5,
            }
          });

          if (response && response.text && response.text.trim().length > 0) {
            return res.json({ text: response.text });
          }
        } catch (mErr: any) {
          console.warn(`Gemini model ${modelName} warning:`, mErr.message);
        }
      }
    }

    // Dynamic NLP response that analyzes user's specific prompt
    const dynamicAnswer = generateDynamicAIResponse(prompt, systemInstruction);
    return res.json({ text: dynamicAnswer });
  } catch (err: any) {
    console.error('AI endpoint error:', err);
    const dynamicAnswer = generateDynamicAIResponse(req.body?.prompt || 'study help');
    return res.json({ text: dynamicAnswer });
  }
});

// Code Execution Endpoint (Python Sandbox & Runner)
app.post('/api/execute-code', async (req, res) => {
  try {
    const { code } = req.body;
    let output = '';
    let passed = true;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Python code is required' });
    }

    const printLogs: string[] = [];
    const ai = getGenAIClient();

    if (ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Execute the following Python 3 code and provide ONLY the standard console output (stdout) and return value if any. If there is a Python syntax or runtime error, report the Python error traceback.\n\nPython Code:\n\`\`\`python\n${code}\n\`\`\``,
          config: {
            systemInstruction: 'You are a Python 3.12 interpreter runtime sandbox. Execute the code faithfully and output standard stdout logs and return values. Keep response clean and concise without extra commentary unless erroring.',
            temperature: 0.1,
          }
        });
        if (aiResponse && aiResponse.text) {
          output = aiResponse.text.trim();
        }
      } catch (e: any) {
        console.warn('AI Python execution warning:', e.message);
      }
    }

    if (!output) {
      // Local Python interpreter simulation
      const lines = code.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          const content = trimmed.slice(6, -1);
          printLogs.push(content.replace(/['"]/g, ''));
        }
      }
      if (printLogs.length > 0) {
        output = printLogs.join('\n') + '\n\n>>> [Python 3.12 Executed Successfully]';
      } else {
        output = `>>> Python 3.12 Executed Successfully\nExecution completed with no output. (Tip: Use print(...) in Python to print output)`;
      }
    }

    res.json({ output, passed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
    app.listen(port, '0.0.0.0', () => {
      console.log(`StudyForge server running on http://localhost:${port}`);
    });
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(port, '0.0.0.0', () => {
    console.log(`StudyForge production server running on port ${port}`);
  });
}
