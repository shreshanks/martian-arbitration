// departments.js
const client = require('./es-client');

// Utility: compute avg of an array (safe)
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

async function evaluateMLUA(proposal) {
    // Focus: land use precedent matching by sector + development_type + population_impact proximity
    const { sector, developmentType, populationImpact } = proposal;

    // Query: match sector & development_type, sort by population closeness
    const resp = await client.search({
        index: 'martian-precedents',
        size: 5,
        body: {
            query: {
                bool: {
                    must: [
                        { term: { sector: sector } },
                        { term: { development_type: developmentType } }
                    ]
                }
            },
            sort: [
                {
                    "_script": {
                        "type": "number",
                        "script": {
                            "lang": "painless",
                            // smaller population difference → higher score (we want closeness first)
                            "source": "Math.abs(doc['population_impact'].value - params.pi)",
                            "params": { "pi": populationImpact || 0 }
                        },
                        "order": "asc"
                    }
                }
            ]
        }
    });

    const hits = resp.body.hits.hits;
    const caseIds = hits.map(h => h._source.case_id || h._id);
    const landRisks = hits.map(h => +h._source.land_use_risk || 0);

    const risk_score = Number(avg(landRisks).toFixed(3));
    const matched_cases = resp.body.hits.total?.value || hits.length;

    // confidence: simple formula -> more matches and lower variance => higher confidence
    const variance = landRisks.length ? landRisks.map(x => Math.pow(x - risk_score, 2)).reduce((a, b) => a + b, 0) / landRisks.length : 0;
    const confidence = Number(Math.max(0.1, Math.min(0.99, 1 - Math.min(1, variance * 2))).toFixed(2));

    const verdict = riskToVerdict(risk_score);

    return {
        department: "Martian Land Use Authority",
        verdict,
        confidence,
        risk_score,
        matched_cases,
        justification: `Land use risk derived from ${matched_cases} precedent(s).`,
        trace: caseIds
    };
}

async function evaluateDAS(proposal) {
    // Focus: atmospheric risk (terraforming flag, atmospheric_risk proximity)
    const { terraformingImpact, sector } = proposal;

    // Use terraformingImpact as a filter because it massively shifts risk
    const must = [];
    if (terraformingImpact) must.push({ term: { terraforming_impact: true } });

    // Also prefer same sector but allow others
    must.push({ term: { sector } });

    const resp = await client.search({
        index: 'martian-precedents',
        size: 5,
        body: {
            query: {
                bool: {
                    must
                }
            },
            sort: [{ "atmospheric_risk": { "order": "desc" } }]
        }
    });

    const hits = resp.body.hits.hits;
    const caseIds = hits.map(h => h._source.case_id || h._id);
    const atmoRisks = hits.map(h => +h._source.atmospheric_risk || 0);

    const risk_score = Number(avg(atmoRisks).toFixed(3));
    const matched_cases = resp.body.hits.total?.value || hits.length;
    const variance = atmoRisks.length ? atmoRisks.map(x => Math.pow(x - risk_score, 2)).reduce((a, b) => a + b, 0) / atmoRisks.length : 0;
    const confidence = Number(Math.max(0.1, Math.min(0.99, 1 - Math.min(1, variance * 2))).toFixed(2));

    const verdict = riskToVerdict(risk_score);

    return {
        department: "Department of Atmospheric Stability",
        verdict,
        confidence,
        risk_score,
        matched_cases,
        justification: `Atmospheric risk computed from ${matched_cases} precedent(s).`,
        trace: caseIds
    };
}

async function evaluateBRA(proposal) {
    // Focus: resource risk based on water_usage + resource_risk field
    const { waterUsage } = proposal;

    // Prefer records with similar water_usage (approx match). We'll use a script sort on diff.
    const resp = await client.search({
        index: 'martian-precedents',
        size: 5,
        body: {
            query: {
                bool: {
                    // relaxed: allow all but prefer similar
                    must: []
                }
            },
            sort: [
                {
                    "_script": {
                        "type": "number",
                        "script": {
                            "lang": "painless",
                            "source": "Math.abs(doc['water_usage'].value - params.wu)",
                            "params": { "wu": waterUsage || 0 }
                        },
                        "order": "asc"
                    }
                }
            ]
        }
    });

    const hits = resp.body.hits.hits;
    const caseIds = hits.map(h => h._source.case_id || h._id);
    const resourceRisks = hits.map(h => +h._source.resource_risk || 0);

    const risk_score = Number(avg(resourceRisks).toFixed(3));
    const matched_cases = resp.body.hits.total?.value || hits.length;
    const variance = resourceRisks.length ? resourceRisks.map(x => Math.pow(x - risk_score, 2)).reduce((a, b) => a + b, 0) / resourceRisks.length : 0;
    const confidence = Number(Math.max(0.1, Math.min(0.99, 1 - Math.min(1, variance * 2))).toFixed(2));

    const verdict = riskToVerdict(risk_score);

    return {
        department: "Bureau of Resource Allocation",
        verdict,
        confidence,
        risk_score,
        matched_cases,
        justification: `Resource risk based on nearest water-usage precedents.`,
        trace: caseIds
    };
}

function riskToVerdict(score) {
    if (score > 0.65) return "REJECT";
    if (score < 0.35) return "APPROVE";
    return "CONDITIONAL";
}

module.exports = { evaluateMLUA, evaluateDAS, evaluateBRA };