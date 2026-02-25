const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const evaluateRouter = require('./evaluate');
app.use('/', evaluateRouter);

app.listen(PORT, () => {
    console.log(`Martian Arbitration Backend running on http://localhost:${PORT}`);
});