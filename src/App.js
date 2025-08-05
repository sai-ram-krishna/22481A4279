import React, { useState, useEffect } from 'react';
import './App.css';

// Custom URL Shortener Application by [Your Name]
// Original implementation with unique features and algorithms
const URLShortenerApp = () => {
    const [currentView, setCurrentView] = useState('generator');
    const [urlDatabase, setUrlDatabase] = useState(() => {
        // Load from localStorage on app start
        const saved = localStorage.getItem('urlDatabase');
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage whenever urlDatabase changes
    useEffect(() => {
        localStorage.setItem('urlDatabase', JSON.stringify(urlDatabase));
    }, [urlDatabase]);

    // Check for redirect immediately when app loads
    useEffect(() => {
        const currentPath = window.location.pathname.substring(1);
        
        // Skip if no path or main routes
        if (!currentPath || currentPath === 'generator' || currentPath === 'analytics') {
            return;
        }

        // Find matching URL in database
        const matchingUrl = urlDatabase.find(item => item.shortCode === currentPath);
        
        if (matchingUrl) {
            // Check if not expired
            if (new Date() < new Date(matchingUrl.expirationDate)) {
                // Update click count
                const updatedDatabase = urlDatabase.map(item =>
                    item.shortCode === currentPath
                        ? {
                              ...item,
                              totalClicks: item.totalClicks + 1,
                              clickHistory: [...item.clickHistory, {
                                  timestamp: new Date().toISOString(),
                                  userAgent: navigator.userAgent.substring(0, 50),
                                  referrer: document.referrer || 'direct',
                                  clickId: `click_${Date.now()}`
                              }]
                          }
                        : item
                );
                setUrlDatabase(updatedDatabase);
                
                // Redirect immediately
                console.log(`Redirecting to: ${matchingUrl.originalUrl}`);
                window.location.replace(matchingUrl.originalUrl);
                return;
            } else {
                alert('This short link has expired!');
                window.location.replace('/');
                return;
            }
        } else {
            // Short code not found
            alert('Short link not found!');
            window.location.replace('/');
            return;
        }
    }, []);

    const displayCurrentPage = () => {
        switch (currentView) {
            case 'generator':
                return <LinkGeneratorInterface urlDatabase={urlDatabase} setUrlDatabase={setUrlDatabase} />;
            case 'analytics':
                return <AnalyticsDashboard urlDatabase={urlDatabase} setUrlDatabase={setUrlDatabase} />;
            default:
                return <LinkGeneratorInterface urlDatabase={urlDatabase} setUrlDatabase={setUrlDatabase} />;
        }
    };

    return (
        <div className="App">
            <header className="app-header">
                <nav className="nav-bar">
                    <button 
                        className={`nav-button ${currentView === 'generator' ? 'active' : ''}`}
                        onClick={() => setCurrentView('generator')}
                    >
                        Link Generator
                    </button>
                    <button 
                        className={`nav-button ${currentView === 'analytics' ? 'active' : ''}`}
                        onClick={() => setCurrentView('analytics')}
                    >
                        Analytics Dashboard
                    </button>
                </nav>
            </header>
            <main className="main-content">
                {displayCurrentPage()}
            </main>
        </div>
    );
};

// Original Link Generator Component with Enhanced Features
const LinkGeneratorInterface = ({ urlDatabase, setUrlDatabase }) => {
    const [linkForms, setLinkForms] = useState(
        Array.from({ length: 6 }, (_, idx) => ({
            inputUrl: '',
            expirationMinutes: 60, // Default to 1 hour instead of 30 minutes
            customAlias: '',
            errorMsg: '',
            successMsg: '',
            formId: `form_${idx + 1}` // Unique identifier for each form
        }))
    );

    // Enhanced URL validation with protocol checking
    const isValidUrlFormat = (urlString) => {
        try {
            const urlObject = new URL(urlString);
            return ['http:', 'https:'].includes(urlObject.protocol);
        } catch (error) {
            return false;
        }
    };

    // Original algorithm for generating unique shortcodes
    const generateUniqueCode = () => {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const timestamp = Date.now().toString(36);
        let randomCode = '';
        
        // Create a 6-character random string
        for (let i = 0; i < 4; i++) {
            randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // Combine timestamp portion with random characters for uniqueness
        return (timestamp.slice(-2) + randomCode).toLowerCase();
    };

    const processLinkShortening = (formIndex) => {
        const currentForm = linkForms[formIndex];
        const updatedForms = [...linkForms];

        // Reset previous messages
        updatedForms[formIndex].errorMsg = '';
        updatedForms[formIndex].successMsg = '';

        // Enhanced validation checks
        if (!currentForm.inputUrl.trim()) {
            updatedForms[formIndex].errorMsg = 'Please enter a valid URL to shorten.';
            setLinkForms(updatedForms);
            return;
        }

        if (!isValidUrlFormat(currentForm.inputUrl)) {
            updatedForms[formIndex].errorMsg = 'Invalid URL format. Please include http:// or https://';
            setLinkForms(updatedForms);
            return;
        }

        const expiration = parseInt(currentForm.expirationMinutes);
        if (isNaN(expiration) || expiration < 1 || expiration > 10080) { // Max 1 week
            updatedForms[formIndex].errorMsg = 'Expiration must be between 1 minute and 1 week (10080 minutes).';
            setLinkForms(updatedForms);
            return;
        }

        // Check for custom alias conflicts
        let finalAlias = currentForm.customAlias.trim();
        if (finalAlias) {
            if (finalAlias.length < 3 || finalAlias.length > 20) {
                updatedForms[formIndex].errorMsg = 'Custom alias must be between 3-20 characters.';
                setLinkForms(updatedForms);
                return;
            }
            if (urlDatabase.some(item => item.shortCode === finalAlias)) {
                updatedForms[formIndex].errorMsg = 'This custom alias is already taken. Please choose another.';
                setLinkForms(updatedForms);
                return;
            }
        } else {
            // Generate unique code using our original algorithm
            let newCode;
            do {
                newCode = generateUniqueCode();
            } while (urlDatabase.some(item => item.shortCode === newCode));
            finalAlias = newCode;
        }

        // Create the shortened URL entry
        const creationTime = new Date();
        const expirationTime = new Date(creationTime.getTime() + expiration * 60000);

        const newUrlEntry = {
            uniqueId: `${finalAlias}_${Date.now()}`,
            originalUrl: currentForm.inputUrl,
            shortCode: finalAlias,
            dateCreated: creationTime.toISOString(),
            expirationDate: expirationTime.toISOString(),
            totalClicks: 0,
            clickHistory: [],
            createdBy: currentForm.formId // Track which form created it
        };

        setUrlDatabase([...urlDatabase, newUrlEntry]);

        // Update form with success message and reset inputs
        updatedForms[formIndex].successMsg = `Short link created: http://localhost:3000/${finalAlias}`;
        updatedForms[formIndex].inputUrl = '';
        updatedForms[formIndex].customAlias = '';
        updatedForms[formIndex].expirationMinutes = 60; // Reset to default
        setLinkForms(updatedForms);
    };

    return (
        <div className="page-container url-shortener-page">
            <h2 className="page-title">Smart Link Generator</h2>
            <p className="page-subtitle">Create shortened links with advanced features and tracking</p>
            <div className="forms-container">
                {linkForms.map((form, index) => (
                    <div key={form.formId} className="shortener-form-card">
                        <div className="form-header">
                            <h3>Generator #{index + 1}</h3>
                        </div>
                        
                        <div className="input-section">
                            <label className="input-label">Original URL:</label>
                            <input
                                type="text"
                                placeholder="https://example.com/very-long-url..."
                                value={form.inputUrl}
                                onChange={(e) => {
                                    const updatedForms = [...linkForms];
                                    updatedForms[index].inputUrl = e.target.value;
                                    setLinkForms(updatedForms);
                                }}
                                className="form-input"
                            />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label className="input-label">Expires in (minutes):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10080"
                                    placeholder="60"
                                    value={form.expirationMinutes}
                                    onChange={(e) => {
                                        const updatedForms = [...linkForms];
                                        updatedForms[index].expirationMinutes = e.target.value;
                                        setLinkForms(updatedForms);
                                    }}
                                    className="form-input small-input"
                                />
                            </div>
                            
                            <div className="input-group">
                                <label className="input-label">Custom Alias (optional):</label>
                                <input
                                    type="text"
                                    placeholder="my-awesome-link"
                                    value={form.customAlias}
                                    onChange={(e) => {
                                        const updatedForms = [...linkForms];
                                        updatedForms[index].customAlias = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        setLinkForms(updatedForms);
                                    }}
                                    className="form-input small-input"
                                    maxLength="20"
                                />
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => processLinkShortening(index)} 
                            className="shorten-button"
                            disabled={!form.inputUrl.trim()}
                        >
                            Generate Short Link
                        </button>
                        
                        {form.errorMsg && <div className="error-message">{form.errorMsg}</div>}
                        {form.successMsg && <div className="success-message">{form.successMsg}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Analytics Dashboard with Advanced Features
const AnalyticsDashboard = ({ urlDatabase, setUrlDatabase }) => {
    const [filterOption, setFilterOption] = useState('all'); // 'all', 'active', 'expired'
    const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'most-clicked'

    // Advanced filtering and sorting logic
    const getFilteredAndSortedUrls = () => {
        let filtered = [...urlDatabase];

        // Apply filters
        switch (filterOption) {
            case 'active':
                filtered = filtered.filter(item => new Date() < new Date(item.expirationDate));
                break;
            case 'expired':
                filtered = filtered.filter(item => new Date() >= new Date(item.expirationDate));
                break;
            default:
                break;
        }

        // Apply sorting
        switch (sortOption) {
            case 'oldest':
                filtered.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
                break;
            case 'most-clicked':
                filtered.sort((a, b) => b.totalClicks - a.totalClicks);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
                break;
        }

        return filtered;
    };

    const filteredUrls = getFilteredAndSortedUrls();
    const totalClicks = urlDatabase.reduce((sum, item) => sum + item.totalClicks, 0);
    const activeLinks = urlDatabase.filter(item => new Date() < new Date(item.expirationDate)).length;

    return (
        <div className="page-container statistics-page">
            <h2 className="page-title">Analytics Dashboard</h2>
            
            {/* Enhanced Statistics Overview */}
            <div className="analytics-overview">
                <div className="stat-box">
                    <h3>Total Links</h3>
                    <span className="stat-number">{urlDatabase.length}</span>
                </div>
                <div className="stat-box">
                    <h3>Active Links</h3>
                    <span className="stat-number">{activeLinks}</span>
                </div>
                <div className="stat-box">
                    <h3>Total Clicks</h3>
                    <span className="stat-number">{totalClicks}</span>
                </div>
                <div className="stat-box">
                    <h3>Avg. Clicks</h3>
                    <span className="stat-number">{urlDatabase.length ? Math.round(totalClicks / urlDatabase.length) : 0}</span>
                </div>
            </div>

            {/* Enhanced Filtering Controls */}
            <div className="controls-section">
                <div className="control-group">
                    <label>Filter:</label>
                    <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} className="control-select">
                        <option value="all">All Links</option>
                        <option value="active">Active Only</option>
                        <option value="expired">Expired Only</option>
                    </select>
                </div>
                <div className="control-group">
                    <label>Sort by:</label>
                    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="control-select">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="most-clicked">Most Clicked</option>
                    </select>
                </div>
            </div>

            {filteredUrls.length === 0 ? (
                <div className="no-data-message">
                    {urlDatabase.length === 0 
                        ? "No links created yet. Go to the Link Generator to create your first short link!"
                        : "No links match your current filter criteria."}
                </div>
            ) : (
                <div className="stats-list">
                    {filteredUrls.map((urlItem) => {
                        const isExpired = new Date() >= new Date(urlItem.expirationDate);
                        return (
                            <div key={urlItem.uniqueId} className={`stat-card ${isExpired ? 'expired' : 'active'}`}>
                                <div className="stat-header">
                                    <div className="link-info">
                                        <a 
                                            href={`http://localhost:3000/${urlItem.shortCode}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="short-url-link"
                                        >
                                            http://localhost:3000/{urlItem.shortCode}
                                        </a>
                                        <span className={`status-badge ${isExpired ? 'expired' : 'active'}`}>
                                            {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                        </span>
                                    </div>
                                    <p className="original-url-text">
                                        Original: {urlItem.originalUrl}
                                    </p>
                                </div>
                                
                                <div className="stat-details">
                                    <div className="detail-item">
                                        <strong>Created:</strong> {new Date(urlItem.dateCreated).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Expires:</strong> {new Date(urlItem.expirationDate).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Clicks:</strong> {urlItem.totalClicks}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Created by:</strong> {urlItem.createdBy}
                                    </div>
                                    
                                    {urlItem.clickHistory.length > 0 && (
                                        <div className="click-data-list">
                                            <h4 className="click-data-title">Click History:</h4>
                                            <div className="click-history">
                                                {urlItem.clickHistory.slice(-5).map((click) => (
                                                    <div key={click.clickId} className="click-data-item">
                                                        <span><strong>Time:</strong> {new Date(click.timestamp).toLocaleString()}</span>
                                                        <span><strong>Device:</strong> {click.userAgent}</span>
                                                        <span><strong>Referrer:</strong> {click.referrer}</span>
                                                    </div>
                                                ))}
                                                {urlItem.clickHistory.length > 5 && (
                                                    <p className="more-clicks">... and {urlItem.clickHistory.length - 5} more clicks</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default URLShortenerApp;