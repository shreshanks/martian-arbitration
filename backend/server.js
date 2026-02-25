const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/evaluate', (req, res) => {
    const proposal = req.body;

    // Mock validation or logging could happen here
    console.log("Received proposal for review:", proposal);

    // Mocked responses representing the three departments (matching Canonical JSON Schema)
    const defaultResponse = {
        departments: {
            mlua: {
                department: "Martian Land Use Authority",
                verdict: "APPROVE",
                confidence: 0.95,
                risk_score: 0.1,
                matched_cases: 42,
                justification: "Zone classification suitable for proposed development.",
                trace: ["case_id: MZ-001", "case_id: MZ-042"]
            },
            das: {
                department: "Department of Atmospheric Stability",
                verdict: proposal.terraformingImpact ? "REJECT" : "APPROVE",
                confidence: 0.88,
                risk_score: proposal.terraformingImpact ? 0.9 : 0.2,
                matched_cases: 15,
                justification: proposal.terraformingImpact
                    ? "Unsanctioned terraforming impact detected. Hazard level high."
                    : "Emissions within stable parameters.",
                trace: ["case_id: ATRO-88"]
            },
            bra: {
                department: "Bureau of Resource Allocation",
                verdict: (proposal.waterUsage > 80 || proposal.energyConsumption > 80) ? "CONDITIONAL" : "APPROVE",
                confidence: 0.92,
                risk_score: (proposal.waterUsage > 80 || proposal.energyConsumption > 80) ? 0.6 : 0.15,
                matched_cases: 8,
                justification: "Resource drain evaluated based on current grid capacity.",
                trace: ["case_id: RES-919"]
            }
        }
    };

    // Determine final decision based on the three departments deterministic rules
    const verdicts = Object.values(defaultResponse.departments).map(d => d.verdict);
    const rejectCount = verdicts.filter(v => v === "REJECT").length;
    const approveCount = verdicts.filter(v => v === "APPROVE").length;

    let finalDecision;
    if (rejectCount >= 2) {
        finalDecision = "REJECT";
    } else if (approveCount === 3) {
        finalDecision = "APPROVE";
    } else {
        finalDecision = "CONDITIONAL";
    }

    defaultResponse.finalDecision = finalDecision;

    res.json(defaultResponse);
});

app.listen(PORT, () => {
    console.log(`Martian Arbitration Backend running on http://localhost:${PORT}`);
});
