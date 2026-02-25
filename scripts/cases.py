import json

sectors = ["residential","industrial","research","agriculture","commercial"]
dev_types = ["dome","mining","lab","greenhouse","habitat","power_station"]

def deterministic_case(i):
    cid = f"case_{i:03d}"

    sector = sectors[i % len(sectors)]
    dev = dev_types[i % len(dev_types)]

    water = round(5 + (i % 50) * 0.8, 2)
    energy = round(100 + (i % 70) * 22.5, 1)
    population = (i * 3) % 250
    terraforming = (i % 11 == 0)

    atmospheric_risk = round(min(1.0, (i % 17) / 16), 2)
    resource_risk = round(min(1.0, (i % 23) / 22), 2)
    land_use_risk = round(min(1.0, (i % 19) / 18), 2)

    avg = (atmospheric_risk + resource_risk + land_use_risk) / 3

    if avg > 0.65:
        verdict = "REJECT"
    elif avg < 0.35:
        verdict = "APPROVE"
    else:
        verdict = "CONDITIONAL"

    doc = {
        "case_id": cid,
        "sector": sector,
        "development_type": dev,
        "water_usage": water,
        "energy_consumption": energy,
        "population_impact": population,
        "terraforming_impact": terraforming,
        "atmospheric_risk": atmospheric_risk,
        "resource_risk": resource_risk,
        "land_use_risk": land_use_risk,
        "final_verdict": verdict,
        "summary": f"{dev} in {sector} sector. Synthetic governance record."
    }

    meta = {
        "index": {
            "_index": "martian_precedents",
            "_id": cid
        }
    }

    return meta, doc


with open("martian_precedents.ndjson", "w") as f:
    for i in range(1, 201):
        meta, doc = deterministic_case(i)
        f.write(json.dumps(meta) + "\n")
        f.write(json.dumps(doc) + "\n")

print("Generated martian_precedents.ndjson with 200 cases.")