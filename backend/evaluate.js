// evaluate.js
const express = require('express');
const router = express.Router();
const { evaluateMLUA, evaluateDAS, evaluateBRA } = require('./departments');

// Basic schema validator (lightweight)
function validateProposal(body) {
    // minimal checks
    if (!body) return false;
    if (!body.sector || !body.developmentType) return false;
    // allow missing numeric fields but coerce
    return true;
}

function arbitrate(deptResponses) {
    // deterministic arbitration:
    // ≥2 REJECT -> REJECT
    // all APPROVE -> APPROVE
    // otherwise -> CONDITIONAL
    const counts = { REJECT: 0, APPROVE: 0, CONDITIONAL: 0 };
    deptResponses.forEach(d => counts[d.verdict] = (counts[d.verdict] || 0) + 1);

    if (counts.REJECT >= 2) return "REJECT";
    if (counts.APPROVE === deptResponses.length) return "APPROVE";
    return "CONDITIONAL";
}

router.post('/evaluate', async (req, res) => {
    try {
        const body = req.body;
        if (!validateProposal(body)) return res.status(400).json({ error: 'invalid proposal schema' });

        // call departments in parallel
        const [mlua, das, bra] = await Promise.all([
            evaluateMLUA({
                sector: body.sector,
                developmentType: body.developmentType,
                populationImpact: Number(body.populationImpact || 0)
            }),
            evaluateDAS({
                terraformingImpact: !!body.terraformingImpact,
                sector: body.sector
            }),
            evaluateBRA({
                waterUsage: Number(body.waterUsage || 0)
            })
        ]);

        const departments = [mlua, das, bra];
        const finalDecision = arbitrate(departments);

        return res.json({ departments, finalDecision });

    } catch (err) {
        console.error('evaluate error', err);
        return res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;