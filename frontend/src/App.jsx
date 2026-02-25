import { useState, useEffect } from 'react'
import './index.css'

function App() {
    const [formData, setFormData] = useState({
        sector: '',
        developmentType: '',
        waterUsage: '',
        energyConsumption: '',
        populationImpact: 'low',
        terraformingImpact: false,
    });

    const [loadingStep, setLoadingStep] = useState(0);
    const [results, setResults] = useState(null);

    const [showTrace, setShowTrace] = useState(false);
    const [status, setStatus] = useState({
        elastic: 'UNKNOWN',
        arbitration: 'ACTIVE',
        version: 'IZA v1.0'
    });

    useEffect(() => {
        if (results) {
            setShowTrace(false);
            const t = setTimeout(() => setShowTrace(true), 600);
            return () => clearTimeout(t);
        } else {
            setShowTrace(false);
        }
    }, [results]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingStep(1);

        setTimeout(() => setLoadingStep(2), 1000);
        setTimeout(() => setLoadingStep(3), 2000);

        setTimeout(async () => {
            try {
                const response = await fetch('http://localhost:3001/evaluate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        waterUsage: Number(formData.waterUsage),
                        energyConsumption: Number(formData.energyConsumption),
                        populationImpact:
                            formData.populationImpact === 'low'
                                ? 50
                                : formData.populationImpact === 'medium'
                                    ? 500
                                    : 1500,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setStatus(prev => ({ ...prev, elastic: 'ONLINE' }));
                setResults(data);
                setLoadingStep(4);

            } catch (error) {
                console.error("Evaluation failed", error);
                setLoadingStep(0);
                alert("Failed to connect to Interplanetary Bureaucracy.");
            }
        }, 3000);
    };

    return (
        <div className="container">
            <header>
                <h1>Martian Arbitration</h1>
                <p className="subtitle">Interplanetary Development Proposal Evaluation System</p>
            </header>

            <div className="status-bar">
                <span className="status-item">🛰 Elasticsearch: <strong>{status.elastic}</strong></span>
                <span className="status-item">⚖ Arbitration Engine: <strong>{status.arbitration}</strong></span>
                <span className="status-item">🏷 {status.version}</span>
            </div>

            {loadingStep === 0 && (
                <form onSubmit={handleSubmit} className="form-panel">

                    <div className="form-group">
                        <label>Sector</label>
                        <select name="sector" value={formData.sector} onChange={handleChange} required>
                            <option value="">Select Sector...</option>
                            <option value="olympus">Olympus Mons Region</option>
                            <option value="valles">Valles Marineris</option>
                            <option value="hellas">Hellas Basin</option>
                            <option value="arcadia">Arcadia Planitia</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Development Type</label>
                        <select name="developmentType" value={formData.developmentType} onChange={handleChange} required>
                            <option value="">Select Type...</option>
                            <option value="residential">Residential Habitat</option>
                            <option value="industrial">Industrial Complex</option>
                            <option value="agricultural">Agricultural Dome</option>
                            <option value="research">Research Outpost</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Water Usage (MegaLiters/Sol)</label>
                        <input
                            type="number"
                            name="waterUsage"
                            value={formData.waterUsage}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Energy Consumption (MW)</label>
                        <input
                            type="number"
                            name="energyConsumption"
                            value={formData.energyConsumption}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>Population Impact</label>
                        <select name="populationImpact" value={formData.populationImpact} onChange={handleChange}>
                            <option value="low">Low (&lt; 100)</option>
                            <option value="medium">Medium (100 - 1000)</option>
                            <option value="high">High (&gt; 1000)</option>
                        </select>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="terraformingImpact"
                                checked={formData.terraformingImpact}
                                onChange={handleChange}
                            />
                            <span className="checkbox-text">Involves Terraforming Impact</span>
                        </label>
                    </div>

                    <button type="submit" className="submit-btn">
                        Submit to Interplanetary Bureaucracy
                    </button>
                </form>
            )}

            {loadingStep > 0 && loadingStep < 4 && (
                <div className="processing-panel">
                    <h2>Evaluation in Progress...</h2>
                    <div className={`dept-panel ${loadingStep >= 1 ? 'active' : ''}`}>
                        <h3>Martian Land Use Authority</h3>
                    </div>
                    <div className={`dept-panel ${loadingStep >= 2 ? 'active' : ''}`}>
                        <h3>Department of Atmospheric Stability</h3>
                    </div>
                    <div className={`dept-panel ${loadingStep >= 3 ? 'active' : ''}`}>
                        <h3>Bureau of Resource Allocation</h3>
                    </div>
                </div>
            )}

            {loadingStep === 4 && results && (
                <div className="results-panel">
                    <h2>Final Arbitration Verdict</h2>

                    <div className="judgement-grid">
                        {Object.values(results.departments).map((dept, i) => (
                            <div
                                className="dept-result"
                                key={i}
                                style={{ animationDelay: `${i * 140}ms` }}
                            >
                                <h4>{dept.department}</h4>
                                <span className={`badge ${dept.verdict.toLowerCase()}`}>
                                    {dept.verdict}
                                </span>

                                <div className="metrics">
                                    <span>Risk Score: {Number(dept.risk_score).toFixed(3)}</span> |
                                    <span> Confidence: {Math.round(dept.confidence * 100)}%</span>
                                </div>

                                <div className="risk-bar">
                                    <div
                                        className="risk-fill"
                                        style={{ width: `${Math.min(100, Math.max(0, dept.risk_score * 100))}%` }}
                                    />
                                </div>

                                <p className="justification">"{dept.justification}"</p>

                                {!showTrace ? (
                                    <p className="retrieving">⟲ Querying Martian Archives...</p>
                                ) : (
                                    <p className="trace-data">
                                        Retrieved {dept.matched_cases} historical precedent
                                        {dept.matched_cases !== 1 ? 's' : ''} from Elasticsearch —
                                        {dept.trace.join(', ')}
                                    </p>
                                )}

                                <p className="small-muted">
                                    Explainable precedent trace available
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="final-decision">
                        <h3>Final Bureaucratic Status:</h3>
                        <div className={`huge-badge ${results.finalDecision.toLowerCase()}`}>
                            {results.finalDecision}
                        </div>
                    </div>

                    <button
                        className="reset-btn"
                        onClick={() => {
                            setLoadingStep(0);
                            setResults(null);
                        }}
                    >
                        Submit New Proposal
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;