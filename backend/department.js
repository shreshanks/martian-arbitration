// department.js
const client = require('./es-client');

const INDEX = 'martian_precedents';

const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

function riskToVerdict(score) {
    if (score > 0.65) return "REJECT";
    if (score < 0.35) return "APPROVE";
    return "CONDITIONAL";
}

// Aggregation helper (shows tool usage beyond search)
async function getSectorAvg(sector, field) {
    try {
        const resp = await client.search({
            index: INDEX,
            size: 0,
            body: {
                query: { term: { sector } },
                aggs: {
                    avg_value: { avg: { field } }
                }
            }
        });

        return resp.body.aggregations?.avg_value?.value ?? 0;
    } catch (err) {
        console.warn('Aggregation error:', err);
        return 0;
    }
}

async function evaluateMLUA(proposal) {
    const { sector, developmentType, populationImpact } = proposal;

    const resp = await client.search({
        index: INDEX,
        size: 5,
        body: {
            query: {
                bool: {
                    must: [
                        { term: { sector } },
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
    const risks = hits.map(h => +h._source.land_use_risk || 0);

    const risk_score = Number(avg(risks).toFixed(3));
    const matched_cases = hits.length;
    const confidence = Number((1 - Math.min(1, Math.abs(risk_score - 0.5))).toFixed(2));

    const agg_trend = await getSectorAvg(sector, 'land_use_risk');

    return {
        department: "Martian Land Use Authority",
        verdict: riskToVerdict(risk_score),
        confidence,
        risk_score,
        matched_cases,
        justification: `Land-use risk from ${matched_cases} precedent(s).`,
        trace: caseIds,
        agg_trend
    };
}

async function evaluateDAS(proposal) {
    const { terraformingImpact, sector } = proposal;

    const must = [{ term: { sector } }];
    if (terraformingImpact) must.push({ term: { terraforming_impact: true } });

    const resp = await client.search({
        index: INDEX,
        size: 5,
        body: {
            query: { bool: { must } },
            sort: [{ atmospheric_risk: { order: "desc" } }]
        }
    });

    const hits = resp.body.hits.hits;
    const caseIds = hits.map(h => h._source.case_id || h._id);
    const risks = hits.map(h => +h._source.atmospheric_risk || 0);

    const risk_score = Number(avg(risks).toFixed(3));
    const matched_cases = hits.length;
    const confidence = Number((1 - Math.min(1, Math.abs(risk_score - 0.5))).toFixed(2));

    const agg_trend = await getSectorAvg(sector, 'atmospheric_risk');

    return {
        department: "Department of Atmospheric Stability",
        verdict: riskToVerdict(risk_score),
        confidence,
        risk_score,
        matched_cases,
        justification: `Atmospheric risk from ${matched_cases} precedent(s).`,
        trace: caseIds,
        agg_trend
    };
}

async function evaluateBRA(proposal) {
    const { waterUsage, sector } = proposal;

    const resp = await client.search({
        index: INDEX,
        size: 5,
        body: {
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
    const risks = hits.map(h => +h._source.resource_risk || 0);

    const risk_score = Number(avg(risks).toFixed(3));
    const matched_cases = hits.length;
    const confidence = Number((1 - Math.min(1, Math.abs(risk_score - 0.5))).toFixed(2));

    const agg_trend = await getSectorAvg(sector, 'resource_risk');

    return {
        department: "Bureau of Resource Allocation",
        verdict: riskToVerdict(risk_score),
        confidence,
        risk_score,
        matched_cases,
        justification: `Resource risk from ${matched_cases} precedent(s).`,
        trace: caseIds,
        agg_trend
    };
}

module.exports = { evaluateMLUA, evaluateDAS, evaluateBRA };