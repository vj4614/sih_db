import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, setLogLevel } from 'firebase/firestore';

// Note: Replace these with your actual Firebase config environment variables.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inline CSS for the component
const componentStyles = `
    body {
        font-family: 'Inter', sans-serif;
        background-color: #0a1027;
        color: #e0e0e0;
    }
    .diagram-node {
        transition: all 0.3s ease;
        cursor: pointer;
        border-width: 2px;
        border-style: solid;
        position: relative;
    }
    .diagram-node.active {
        border-color: #22d3ee;
        transform: translateY(-5px) scale(1.05);
        animation: node-breathing-glow 1.5s infinite ease-in-out;
    }
    @keyframes node-breathing-glow {
        0% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3); transform: translateY(-5px) scale(1.05); }
        50% { box-shadow: 0 0 25px rgba(34, 211, 238, 1), 0 0 40px rgba(34, 211, 238, 0.8), 0 0 60px rgba(34, 211, 238, 0.5); transform: translateY(-5px) scale(1.08); }
        100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3); transform: translateY(-5px) scale(1.05); }
    }
    .diagram-arrow {
        position: relative;
        height: 40px;
        width: 2px;
        background-color: #334155;
        margin: 0 auto;
    }
    .diagram-arrow::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #334155;
    }
    .horizontal-arrow {
        position: relative;
        width: 15rem;
        height: 25px;
        overflow: hidden;
        background: rgba(0,0,0,0);
        top: -11px;
    }
    .horizontal-arrow::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 2px;
        background-image: radial-gradient(circle, #475569 1px, transparent 1px);
        background-size: 10px 100%;
        transform: translateY(-50%);
        animation: flow-dots 2s linear infinite;
    }
    .horizontal-arrow.active::before {
        background-image: radial-gradient(circle, #22d3ee 1px, transparent 1px);
    }
    .horizontal-arrow::after {
        content: '';
        position: absolute;
        top: 50%;
        left: -40px;
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #475569, #475569);
        transform: translateY(-50%);
        filter: drop-shadow(0 0 5px #475569);
        opacity: 0.8;
    }
    .horizontal-arrow.animate-preview::after, .horizontal-arrow.active::after {
        animation: data-packet-flow 2s linear infinite;
    }
    .horizontal-arrow.active::after {
        background: linear-gradient(90deg, transparent, #22d3ee, #22d3ee);
        filter: drop-shadow(0 0 10px #22d3ee);
        opacity: 1;
    }
    @keyframes flow-dots {
        0% { left: 0; }
        100% { left: 10px; }
    }
    @keyframes data-packet-flow {
        0% { left: -40px; }
        100% { left: 100%; }
    }
    .content-fade-in {
        animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .icon-glow {
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.7);
    }
    .fade-in-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .fade-in-section.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s ease-out;
    }
    .faq-item h3 .plus-icon {
        position: relative;
        width: 1.25rem;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .faq-item h3 .plus-icon::before,
    .faq-item h3 .plus-icon::after {
        content: '';
        position: absolute;
        background-color: #ffffff;
        transition: transform 0.3s ease;
    }
    .faq-item h3 .plus-icon::before {
        width: 100%;
        height: 2px;
        transform-origin: center center;
    }
    .faq-item h3 .plus-icon::after {
        width: 2px;
        height: 100%;
        transform-origin: center center;
    }
    .faq-item.active h3 .plus-icon::before {
        transform: rotate(45deg);
    }
    .faq-item.active h3 .plus-icon::after {
        transform: rotate(-45deg);
    }
    .hexagon {
        position: relative;
        width: 100px;
        height: 57.74px;
        background: #22d3ee;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease-in-out;
    }
    .hexagon:hover {
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(34, 211, 238, 0.7);
    }
    .hexagon.active-bg {
        background: rgba(34, 211, 238, 0.7) !important;
    }
    .hexagon-inner {
        position: absolute;
        width: 90%;
        height: 90%;
        background-color: #0a1027;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: white;
        padding: 5px;
    }
    .details-panel-background {
        position: absolute;
        inset: 0;
        background-image: url('data:image/svg+xml,%3Csvg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h1v1H0zM2 2h1v1H2zM4 4h1v1H4zM6 6h1v1H6zM8 8h1v1H8z" fill="%232e3a52"/%3E%3C/svg%3E');
        opacity: 0.2;
        animation: background-move 60s infinite linear;
        z-index: -1;
    }
    @keyframes background-move {
        from { background-position: 0 0; }
        to { background-position: 100% 100%; }
    }
`;

const architectureDetails = {
    ingestion: {
        title: '1. Data Ingestion & Processing',
        icon: '📥',
        content: [
            { heading: 'Source Data', text: 'The pipeline begins with raw ARGO float data, provided in the complex but standard NetCDF (Network Common Data Format).' },
            { heading: 'Processing Pipeline', text: 'A dedicated script ingests these files, extracting key parameters like Temperature, Salinity, and Bio-Geo-Chemical values. This raw data is then converted into highly structured and queryable formats like SQL tables or Parquet files.' }
        ]
    },
    database: {
        title: '2. Database & Retrieval',
        icon: '🗄',
        content: [
            { heading: 'Relational Database (PostgreSQL)', text: 'The structured oceanographic data is stored in a robust relational database. This allows for fast, precise, and complex queries on the vast dataset.' },
            { heading: 'Vector Database (FAISS/Chroma)', text: 'To enable semantic search and AI-powered retrieval, metadata and data summaries are converted into vector embeddings and stored here. This is crucial for the RAG pipeline to find the most relevant context for a user\'s query.' }
        ]
    },
    ai: {
        title: '3. AI & Logic',
        icon: '🧠',
        content: [
            { heading: 'User Interface (Chatbot)', text: 'The user interacts with the system through an intuitive chatbot interface, asking questions in natural, everyday language.' },
            { heading: 'Retrieval-Augmented Generation (RAG)', text: 'The Large Language Model (LLM) first interprets the user\'s intent. It then queries the Vector Database to retrieve relevant context. Finally, using this context, the LLM generates a precise SQL query to fetch the exact data needed from the PostgreSQL database.' }
        ]
    },
    visualization: {
        title: '4. Visualization & Output',
        icon: '📈',
        content: [
            { heading: 'Interactive Dashboard', text: 'The results from the database query are fed into a dynamic frontend dashboard. This allows for the creation of rich, interactive visualizations like geospatial maps of float trajectories (via Leaflet) or depth-time plots (via Plotly).' },
            { heading: 'Chatbot Output', text: 'The system presents the generated visualizations to the user and provides a concise, natural-language summary of the findings, effectively closing the loop from question to insight.' }
        ]
    },
    start: {
        title: 'Welcome to FloatChat',
        icon: '🌊',
        content: [
            { heading: 'Explore the Architecture', text: 'FloatChat is an AI-powered system that makes oceanographic data accessible to everyone. Click "Start Tour" to begin a step-by-step tour of how it works, or click on any hexagon to jump directly to a specific stage.' }
        ]
    },
    tourEnd: {
        title: 'Tour Complete',
        icon: '✅',
        content: [
            { heading: 'Process Concluded', text: 'You have now completed the interactive tour of the FloatChat system. The data has flowed through the entire pipeline, from raw ingestion to a final interactive visualization and summary. You can now use the "Start Tour" button to begin again.' }
            ]
    }
};

const tourNodes = ['ingestion', 'database', 'ai', 'visualization'];

function HexagonNode({ id, label, subLabel, emoji, onClick, isActive, isTourActive, className }) {
    const combinedClassName = `hexagon cursor-pointer ${className} ${isActive ? 'active-bg' : ''}`;
    return (
        <div className="flex flex-col items-center text-center">
            <div className="text-xs sm:text-sm text-slate-400 font-semibold mb-2">{label}</div>
            <div
                id={`node-${id}`}
                data-target={id}
                onClick={onClick}
                className={combinedClassName}
            >
                <div className="hexagon-inner">
                    <span className="text-3xl">{emoji}</span>
                </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-2">{subLabel}</div>
        </div>
    );
}

function HorizontalArrow({ id, isActive, animatePreview }) {
    const className = `horizontal-arrow ${isActive ? 'active' : ''} ${animatePreview ? 'animate-preview' : ''}`;
    return <div id={id} className={className}></div>;
}

export default function FloatChatArchitecture() {
    const [tourIndex, setTourIndex] = useState(0);
    const [isTourStarted, setIsTourStarted] = useState(false);
    const [activeSection, setActiveSection] = useState('start');
    const [userId, setUserId] = useState('Connecting...');
    const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });
    const diagramContainerRef = useRef(null);
    const faqRefs = useRef([]);
    const sectionsRef = useRef([]);

    const currentDetails = architectureDetails[activeSection];
    const isWelcomeOrEnd = activeSection === 'start' || activeSection === 'tourEnd';

    useEffect(() => {
        // Handle fade-in on scroll
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: '0px', threshold: 0.1 }
        );

        sectionsRef.current.forEach((section) => {
            if (section) {
                observer.observe(section);
            }
        });

        // Handle pipeline reset on scroll
        const handleScroll = () => {
            if (diagramContainerRef.current && isTourStarted) {
                const rect = diagramContainerRef.current.getBoundingClientRect();
                const isVisible =
                    rect.top < window.innerHeight &&
                    rect.bottom >= 0 &&
                    rect.left < window.innerWidth &&
                    rect.right >= 0;
                if (!isVisible) {
                    resetPipeline();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Firebase initialization
        const initFirebase = async () => {
            if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.projectId) {
                console.error('Firebase configuration is missing.');
                setUserId('Error');
                return;
            }
            try {
                const app = initializeApp(firebaseConfig);
                const auth = getAuth(app);
                const db = getFirestore(app);
                setLogLevel('debug');
                
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
                const currentUserId = auth.currentUser?.uid || crypto.randomUUID();
                setUserId(currentUserId);

                const feedbackForm = document.getElementById('feedback-form');
                if (feedbackForm) {
                    feedbackForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const feedbackInput = document.getElementById('feedback-input');
                        if (!feedbackInput.value.trim()) return;

                        const feedbackData = {
                            text: feedbackInput.value.trim(),
                            userId: currentUserId,
                            timestamp: serverTimestamp(),
                        };

                        try {
                            const feedbackCollectionPath = `artifacts/${appId}/public/data/feedback`;
                            await addDoc(collection(db, feedbackCollectionPath), feedbackData);
                            feedbackInput.value = '';
                            setFeedbackMessage({ text: 'Feedback submitted! Thank you!', type: 'success' });
                            setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 3000);
                        } catch (error) {
                            console.error('Error adding document: ', error);
                            setFeedbackMessage({ text: 'Error submitting feedback. Please try again.', type: 'error' });
                        }
                    });
                }
            } catch (e) {
                console.error('Firebase initialization failed:', e);
                setUserId('Error');
            }
        };

        initFirebase();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [isTourStarted]);

    const handleStartTour = () => {
        setIsTourStarted(true);
        setTourIndex(0);
        setActiveSection(tourNodes[0]);
    };

    const handleNextTour = () => {
        if (tourIndex < tourNodes.length - 1) {
            const nextIndex = tourIndex + 1;
            setTourIndex(nextIndex);
            setActiveSection(tourNodes[nextIndex]);
        } else {
            setActiveSection('tourEnd');
            setIsTourStarted(false);
            setTourIndex(0);
        }
    };

    const handleResetTour = () => {
        resetPipeline();
    };

    const handleNodeClick = (targetId) => {
        const clickedIndex = tourNodes.indexOf(targetId);
        if (clickedIndex !== -1) {
            setTourIndex(clickedIndex);
            setActiveSection(targetId);
            setIsTourStarted(true);
        }
    };

    const resetPipeline = () => {
        setTourIndex(0);
        setIsTourStarted(false);
        setActiveSection('start');
    };

    const toggleFaq = (index) => {
        const answer = faqRefs.current[index];
        const item = answer.parentElement;

        if (item.classList.contains('active')) {
            item.classList.remove('active');
            answer.style.maxHeight = '0px';
        } else {
            // Close all other open FAQs
            faqRefs.current.forEach((otherAnswer, otherIndex) => {
                if (otherIndex !== index && otherAnswer.parentElement.classList.contains('active')) {
                    otherAnswer.parentElement.classList.remove('active');
                    otherAnswer.style.maxHeight = '0px';
                }
            });

            // Open the clicked one
            item.classList.add('active');
            answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
    };

    const faqItems = [
        { question: 'What is ARGO data?', answer: "ARGO is a global network of autonomous floats that collect temperature, salinity, and other data from the world's oceans, helping scientists study climate and ocean health." },
        { question: 'How does the AI understand my questions?', answer: "The AI uses a process called Retrieval-Augmented Generation (RAG). It first interprets your natural language question, then finds the most relevant data and documentation from our vector database. It uses this information to build a precise query and generate an accurate response, ensuring the answer is factual and up-to-date." },
        { question: 'What kind of data can I query?', answer: "You can ask about a wide range of oceanographic parameters, including temperature, salinity, and bio-geo-chemical (BGC) data like oxygen levels or chlorophyll-a concentrations. You can specify parameters like location, depth, and time to get very specific results." },
        { question: 'Can I use this for my research or school project?', answer: "Absolutely! This tool is designed to be a proof-of-concept for the scientific and educational communities. While it's not yet a formal academic tool, it's perfect for exploratory analysis, preparing for class presentations, or simply satisfying your curiosity about the ocean." },
        { question: 'Is this tool free to use?', answer: "This project is currently a proof-of-concept. The goal is to provide a free and accessible tool for the scientific and educational communities." }
    ];

    const pipelineNodeData = [
        { id: 'ingestion', label: 'Ingestion', subLabel: 'Raw ARGO NetCDF', emoji: '🗃', className: 'bg-gradient-to-r from-orange-400 to-red-500' },
        { id: 'database', label: 'Database', subLabel: 'SQL & Vector DB', emoji: '🔍', className: 'bg-gradient-to-r from-red-500 to-purple-600' },
        { id: 'ai', label: 'AI Core', subLabel: 'RAG & LLM Engine', emoji: '🤖', className: 'bg-gradient-to-r from-purple-600 to-blue-600' },
        { id: 'visualization', label: 'Visualization', subLabel: 'Interactive Dashboard', emoji: '📊', className: 'bg-gradient-to-r from-emerald-500 to-lime-500' }
    ];

    return (
        <div className="antialiased">
            <style>{componentStyles}</style>
            <div className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(to_bottom,white_40%,transparent)]"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <header ref={(el) => (sectionsRef.current[0] = el)} className="text-center mb-16 fade-in-section">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                            FloatChat Architecture
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg sm:text-xl text-slate-300">
                            To bridge the gap between human curiosity and the vast, living story of our oceans by empowering everyone to explore and understand ocean data through natural language.
                        </p>
                    </header>

                    <main ref={(el) => (sectionsRef.current[1] = el)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 fade-in-section">
                        <div className="lg:col-span-1 flex flex-col items-center">
                            <h2 className="text-2xl font-bold text-center mb-6 text-cyan-300">Interactive Pipeline</h2>
                            <div id="diagram-container" ref={diagramContainerRef} className="w-full max-w-lg mx-auto flex flex-row items-center justify-center">
                                {pipelineNodeData.map((node, index) => (
                                    <React.Fragment key={node.id}>
                                        <HexagonNode
                                            id={node.id}
                                            label={node.label}
                                            subLabel={node.subLabel}
                                            emoji={node.emoji}
                                            className={node.className}
                                            onClick={() => handleNodeClick(node.id)}
                                            isActive={!isWelcomeOrEnd && tourNodes.indexOf(activeSection) >= index}
                                            isTourActive={isTourStarted}
                                        />
                                        {index < pipelineNodeData.length - 1 && (
                                            <HorizontalArrow
                                                id={`arrow-${node.id}-${pipelineNodeData[index + 1].id}`}
                                                isActive={!isWelcomeOrEnd && tourNodes.indexOf(activeSection) > index}
                                                animatePreview={!isTourStarted}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="flex space-x-4 mt-6">
                                {!isTourStarted && (
                                    <button
                                        id="start-tour-btn"
                                        onClick={handleStartTour}
                                        className="py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
                                    >
                                        Start Tour
                                    </button>
                                )}
                                {isTourStarted && (
                                    <div id="nav-buttons-container" className="flex space-x-4">
                                        <button
                                            id="next-tour-btn"
                                            onClick={handleNextTour}
                                            className="py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
                                        >
                                            Next
                                        </button>
                                        <button
                                            id="reset-tour-btn"
                                            onClick={handleResetTour}
                                            className="py-2 px-4 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 ease-in-out"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div id="details-panel" className="lg:col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl shadow-2xl p-6 sm:p-8 min-h-[400px] relative">
                            <div className="details-panel-background"></div>
                            <div className="content-fade-in">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-cyan-300 flex items-center">
                                    <span className="text-4xl mr-4">{currentDetails.icon}</span>
                                    {currentDetails.title}
                                </h2>
                                <div className="space-y-6 text-slate-300">
                                    {currentDetails.content.map((item, index) => (
                                        <div key={index}>
                                            <h3 className="font-semibold text-lg text-white">{item.heading}</h3>
                                            <p className="mt-1 text-slate-400">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>

                    <section ref={(el) => (sectionsRef.current[2] = el)} className="mt-20 fade-in-section">
                        <h2 className="text-3xl font-bold text-center mb-10 text-cyan-300">Key Capabilities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            <div className="group bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <p className="text-3xl mb-3 icon-glow">🗺</p>
                                <h3 className="font-bold text-lg text-white mb-2">Geospatial Queries</h3>
                                <p className="text-slate-400">"Show me salinity profiles near the equator in March 2023."</p>
                            </div>
                            <div className="group bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <p className="text-3xl mb-3 icon-glow">📊</p>
                                <h3 className="font-bold text-lg text-white mb-2">Comparative Analysis</h3>
                                <p className="text-slate-400">"Compare BGC parameters in the Arabian Sea for the last 6 months."</p>
                            </div>
                            <div className="group bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <p className="text-3xl mb-3 icon-glow">📍</p>
                                <h3 className="font-bold text-lg text-white mb-2">Proximity Search</h3>
                                <p className="text-slate-400">"What are the nearest ARGO floats to this location?"</p>
                            </div>
                        </div>
                    </section>
                    
                    <section ref={(el) => (sectionsRef.current[3] = el)} className="mt-20 max-w-6xl mx-auto fade-in-section">
                        <h2 className="text-3xl font-bold text-center mb-10 text-cyan-300">Feedback & Contact</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="group bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <h3 className="font-bold text-lg text-white mb-4">Leave Your Feedback</h3>
                                <form id="feedback-form" className="space-y-4">
                                    <div>
                                        <label htmlFor="feedback-input" className="block text-sm font-medium text-slate-400 mb-2">
                                            Share your thoughts, suggestions, or ideas here:
                                        </label>
                                        <textarea
                                            id="feedback-input"
                                            name="feedback"
                                            rows="4"
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        id="submit-btn"
                                        className="w-full py-2 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
                                    >
                                        Submit Feedback
                                    </button>
                                    {feedbackMessage.text && (
                                        <div className={`text-center mt-4 ${feedbackMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {feedbackMessage.text}
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="group bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg transform transition-transform hover:translate-y-[-5px] hover:shadow-xl">
                                <h3 className="font-bold text-lg text-white mb-4">Contact Information</h3>
                                <p className="text-slate-400 mb-2">For business inquiries or collaborations, feel free to reach out to us:</p>
                                <ul className="space-y-2 text-slate-300">
                                    <li><span className="font-medium text-white">Email:</span> contact@floatchat.com</li>
                                    <li><span className="font-medium text-white">Website:</span> www.floatchat.com</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section ref={(el) => (sectionsRef.current[4] = el)} className="mt-20 max-w-6xl mx-auto fade-in-section">
                        <h2 className="text-3xl font-bold text-center mb-10 text-cyan-300">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faqItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="faq-item group bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg cursor-pointer transform transition-transform hover:translate-y-[-5px] hover:shadow-xl"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <h3 className="font-bold text-lg text-white mb-2 flex justify-between items-center">
                                        {item.question}
                                        <div className="plus-icon"></div>
                                    </h3>
                                    <p ref={(el) => (faqRefs.current[index] = el)} className="faq-answer text-slate-400 mt-2">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <footer className="text-center py-6 text-slate-500 text-sm">
                    <p>Your User ID: <span id="user-id">{userId}</span></p>
                    <p>&copy; 2024 FloatChat. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}