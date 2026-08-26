const fs = require('fs');
const Tesseract = require('tesseract.js');
const path = require('path');
const axios = require('axios');
const { fromPath } = require('pdf2pic');

const Prescription = require('../models/Prescription');
const createNotification = require('../utils/createNotification');

const uploadPrescriptions = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(404).json({ message: 'No file found' });
        }
        
        const { description } = req.body;
        const fileUrl = `/uploads/prescriptions/${req.file.filename}`;
        const prescription = await Prescription.create({
            patientId: req.user._id, 
            fileUrl, 
            description
        });

        await createNotification({
            recipientId: prescription.patientId,
            title: 'Prescription Uploaded',
            message: 'Prescription uploaded successfully',
            type: 'prescription'
        });
        return res.status(201).json({ success: true, message: 'Prescription uploaded', data: prescription });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getPrescriptions = async (req, res) => {
    try {
        const prescription = await Prescription.find({ patientId: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, prescriptions: prescription });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const extractPrescriptionText = async (req, res) => {
    let imagePath = '';
    let tempFilesToClean = [];
    try {
        if (req.file) {
            tempFilesToClean.push(req.file.path);
            if (req.file.mimetype === 'application/pdf') {
                const options = {
                    density: 300,
                    saveFilename: `ocr_${Date.now()}`,
                    savePath: './uploads/temp',
                    format: 'png',
                    width: 2000,
                    height: 2000,
                    graphicsMagick: false
                };
                fs.mkdirSync('./uploads/temp', { recursive: true });
                const convert = fromPath(req.file.path, options);
                const result = await convert(1);
                imagePath = result.path;
                tempFilesToClean.push(imagePath);
            } else {
                imagePath = req.file.path;
            }
        } else if (req.query.url) {
            const url = req.query.url;
            const ext = path.extname(url).split('?')[0] || '.jpg';
            const tempPath = `./uploads/temp/temp_ocr_${Date.now()}${ext}`;
            fs.mkdirSync('./uploads/temp', { recursive: true });
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            fs.writeFileSync(tempPath, response.data);
            imagePath = tempPath;
            tempFilesToClean.push(tempPath);
        } else {
            return res.status(400).json({ message: 'No file or URL provided' });
        }

        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
        return res.status(200).json({ text: text.trim() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        tempFilesToClean.forEach(f => {
            fs.unlink(f, (err) => { if (err) console.error('Failed to clean temp file:', f, err); });
        });
    }
};

const deletePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        try {
            await fs.unlink(path.join(process.cwd(), prescription.fileUrl));
        } catch (fileError) {
            console.error('File already gone or unreadable:', fileError.message);
        }

        res.json({ message: 'Prescription deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadPrescriptions, getPrescriptions, extractPrescriptionText, deletePrescription };