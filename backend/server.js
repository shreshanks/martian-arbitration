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

    // Mocked responses representing the three departments
    const defaultResponse = {
        departments: {
            mlua: {
                name: "Martian Land Use Authority",
                verdict: "APPROVED",
                notes: "Zone classification suitable for proposed development."
            },
            das: {
                name: "Department of Atmospheric Stability",
                verdict: proposal.terraformingImpact ? "REJECTED" : "APPROVED",
                notes: proposal.terraformingImpact
                    ? "Unsanctioned terraforming impact detected. Hazard level high."
                    : "Emissions within stable parameters."
            },
            bra: {
                name: "Bureau of Resource Allocation",
                verdict: (proposal.waterUsage > 80 || proposal.energyConsumption > 80) ? "FLAGGED" : "APPROVED",
                notes: "Resource drain evaluated based on current grid capacity."
            }
        }
    };

    // Determine final decision based on the three departments
    let finalDecision = "APPROVED";
    const verdicts = Object.values(defaultResponse.departments).map(d => d.verdict);

    if (verdicts.includes("REJECTED")) {
        finalDecision = "DENIED";
    } else if (verdicts.includes("FLAGGED")) {
        finalDecision = "REQUIRES REVISION";
    }

    defaultResponse.finalDecision = finalDecision;

    res.json(defaultResponse);
});

app.listen(PORT, () => {
    console.log(`Martian Arbitration Backend running on http://localhost:${PORT}`);
});
