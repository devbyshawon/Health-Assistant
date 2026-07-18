const Groq = require('groq-sdk');

const callGroq = async (prompt) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
    });
    return completion.choices[0].message.content;
};

module.exports = callGroq;