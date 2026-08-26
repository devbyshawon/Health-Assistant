const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callGroq = async (prompt) => {
    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-120b',  
        max_tokens: 1024,
    });
    return completion.choices[0].message.content;
};

module.exports = callGroq;