import { useState } from 'react'
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

    const [loadingStep, setLoadingStep] = useState(0); // 0: input, 1: mlua, 2: das, 3: bra, 4: done
    const [results, setResults] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingStep(1);

        // Staged processing simulation
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
                    }),
                });
                const data = await response.json();
                setResults(data);
                setLoadingStep(4);
            } catch (error) {
                console.error("Evaluation failed", error);
                setLoadingStep(0);
                alert("Failed to connect to Interplanetary Bureaucracy.");
            }
        }, 3000);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="container">
            <header>
                <h1>Martian Arbitration</h1>
                <p className="subtitle">Interplanetary Development Proposal Evaluation System</p>
            </header>

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

                    <button type="submit" className="submit-btn">Submit to Interplanetary Bureaucracy</button>
                </form>
            )}

            {loadingStep > 0 && loadingStep < 4 && (
                <div className="processing-panel">
                    <h2>Evaluation in Progress...</h2>

                    <div className={`dept-panel ${loadingStep >= 1 ? 'active' : ''}`}>
                        <h3>Martian Land Use Authority</h3>
                        {loadingStep === 1 && <p className="loading-text">Reviewing historical precedents...</p>}
                        {loadingStep > 1 && <p className="done-text">Review Complete</p>}
                    </div>

                    <div className={`dept-panel ${loadingStep >= 2 ? 'active' : ''}`}>
                        <h3>Department of Atmospheric Stability</h3>
                        {loadingStep === 2 && <p className="loading-text">Evaluating atmospheric parameters...</p>}
                        {loadingStep > 2 && <p className="done-text">Review Complete</p>}
                    </div>

                    <div className={`dept-panel ${loadingStep >= 3 ? 'active' : ''}`}>
                        <h3>Bureau of Resource Allocation</h3>
                        {loadingStep === 3 && <p className="loading-text">Calculating grid stress...</p>}
                        {loadingStep > 3 && <p className="done-text">Review Complete</p>}
                    </div>
                </div>
            )}

            {loadingStep === 4 && results && (
                <div className="results-panel">
                    <h2>Final Arbitration Verdict</h2>

                    <div className="judgement-grid">
                        <div className="dept-result">
                            <h4>{results.departments.mlua.name}</h4>
                            <span className={`badge ${results.departments.mlua.verdict.toLowerCase()}`}>
                                {results.departments.mlua.verdict}
                            </span>
                            <p>"{results.departments.mlua.notes}"</p>
                        </div>

                        <div className="dept-result">
                            <h4>{results.departments.das.name}</h4>
                            <span className={`badge ${results.departments.das.verdict.toLowerCase()}`}>
                                {results.departments.das.verdict}
                            </span>
                            <p>"{results.departments.das.notes}"</p>
                        </div>

                        <div className="dept-result">
                            <h4>{results.departments.bra.name}</h4>
                            <span className={`badge ${results.departments.bra.verdict.toLowerCase()}`}>
                                {results.departments.bra.verdict}
                            </span>
                            <p>"{results.departments.bra.notes}"</p>
                        </div>
                    </div>

                    <div className="final-decision">
                        <h3>Final Bureaucratic Status:</h3>
                        <div className={`huge-badge ${results.finalDecision.toLowerCase().replace(' ', '-')}`}>
                            {results.finalDecision}
                        </div>
                    </div>

                    <button className="reset-btn" onClick={() => { setLoadingStep(0); setResults(null); }}>
                        Submit New Proposal
                    </button>
                </div>
            )}
        </div>
    )
}

export default App
