const AIInteractionLog = require('../models/AIInteractionLog');
const callGroq = require('../utils/llm');

const diagnoseSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) {
            return res.status(400).json({ message: 'Symptoms are missing' });
        }

        const prompt = `You are a medical assistant AI. A patient reports these symptoms: "${symptoms}".
        Provide:
        1. Likely conditions (brief list)
        2. Urgency level (low/medium/high)  
        3. Suggested next steps
        Keep it concise. Always recommend seeing a real doctor for proper diagnosis.`;

        const diagnosis = await callGroq(prompt);
        await AIInteractionLog.create({
            userId: req.user._id, 
            input: symptoms, 
            output: diagnosis, 
            type: 'diagnosis' 
        });        
        return res.status(200).json({ success: true, data: diagnosis });
    } catch (error) {
        console.error(error);
        return res.status(503).json({ message: 'AI service temporarily unavailable' });
    }
};

const chatSymptoms = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is missing' });
        }

        const prompt = `You are a medical assistant AI having a conversation with a patient.
        Patient says: "${message}"
        Respond naturally, ask follow-up questions if needed, and give helpful medical guidance.
        Always remind the patient to consult a real doctor for serious concerns.`;

        const reply = await callGroq(prompt);
        await AIInteractionLog.create({
            userId: req.user._id, 
            input: message, 
            output: reply, 
            type: 'chat'  
        });
        return res.status(200).json({ success: true, data: reply });
    } catch (error) {
        console.error(error);
        return res.status(503).json({ message: 'AI service temporarily unavailable' });
    }
};

const simplifyMedicalTerm = async (req, res) => {
    try {
        const { term } = req.body;
        if (!term) {
            return res.status(400).json({ message: 'Term is missing' });
        }

        const prompt = `You are a medical assistant AI.
        Explain this medical term in simple, patient-friendly language: "${term}".
        Keep it short (2-3 sentences), avoid jargon, and make it easy for a non-medical person to understand.`;

        const explanation = await callGroq(prompt);
        await AIInteractionLog.create({
            userId: req.user._id,
            input: term, 
            output: explanation, 
            type: 'simplifier'  
        });
        return res.status(200).json({ success: true, data: explanation });
    } catch (error) {
        console.error(error);
        return res.status(503).json({ message: 'AI service temporarily unavailable' });
    }
};

const getVisitPrep = async (req, res) => {
    try {
        const { condition } = req.params;
        if (!condition) {
            return res.status(400).json({ message: 'Condition is missing' });
        }

        const prompt = `You are a medical assistant AI.
        Create a preparation checklist for a patient visiting a doctor for: "${condition}".
        Include:
        - Documents to bring
        - Questions to ask the doctor
        - Any preparations (fasting, tests, medications to list)
        - What to expect during the visit
        Format as a clear, easy-to-follow checklist.`;

        const checklist = await callGroq(prompt);
        await AIInteractionLog.create({
            userId: req.user._id,
            input: condition, 
            output: checklist, 
            type: 'prep'  
        });
        return res.status(200).json({ success: true, data: checklist });
    } catch (error) {
        console.error(error);
        return res.status(503).json({ message: 'AI service temporarily unavailable' });
    }
};

module.exports = { diagnoseSymptoms, chatSymptoms, simplifyMedicalTerm, getVisitPrep };