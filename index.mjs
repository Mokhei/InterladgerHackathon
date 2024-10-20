import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'ilp'; 


const app = express();
app.use(express.json());

// Serving static html file
app.use(express.static('public'));

// API Key and Wallet Addresses
const INTERLEDGER_SENDER = 'ilp.interledger-test.dev/thato';
const INTERLEDGER_RECEIVER = 'ilp.interledger-test.dev/cavil';
const RECEIVER_ACCOUNT_ID = '25b5c19e-060d-4586-92e7-009a101b4605';
const API_KEY = '48f7a16d708bde84ca9fa2b81587458d';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route root to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'openPay.html'));
});

// Performing currency Conversion Route
app.get('/convert', async (req, res) => {
    const amountInZAR = req.query.amount;
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/ZAR`);
        const data = await response.json();
        const rate = data.rates.EUR;
        const eurAmount = amountInZAR * rate;
        res.json({ eurAmount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to convert currency' });
    }
});

// performing Send Payment Route
app.post('/send-payment', async (req, res) => {
    const { amount } = req.body;
    
    
    try {

        // Performing currency Conversion Route using the fixer.io api
        const conversionResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/ZAR`);
        const conversionData = await conversionResponse.json();
        const rate = conversionData.rates.EUR;
        const eurAmount = amount * rate;

        // implementing the interledger payment logic.
        const sender = createSender({
            account: INTERLEDGER_SENDER,
        });

        await sender.send({
            amount: eurAmount,
            asset: 'EUR',
        });

        res.json({ success: true, amount: eurAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

app.listen(3000, () => {
    //Logging console to check if server is 
    console.log('Server running on port 3000');
});
