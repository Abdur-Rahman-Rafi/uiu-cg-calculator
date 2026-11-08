import React, { useState, useEffect, useRef } from "react";

const gradeScale = [
  { grade: "A (Plain)", point: 4.00, range: "90 – 100", assessment: "Outstanding" },
  { grade: "A- (Minus)", point: 3.67, range: "86 – 89", assessment: "Excellent" },
  { grade: "B+ (Plus)", point: 3.33, range: "82 – 85", assessment: "Very Good" },
  { grade: "B (Plain)", point: 3.00, range: "78 – 81", assessment: "Good" },
  { grade: "B- (Minus)", point: 2.67, range: "74 – 77", assessment: "Above Average" },
  { grade: "C+ (Plus)", point: 2.33, range: "70 – 73", assessment: "Average" },
  { grade: "C (Plain)", point: 2.00, range: "66 – 69", assessment: "Below Average" },
  { grade: "C- (Minus)", point: 1.67, range: "62 – 65", assessment: "Poor" },
  { grade: "D+ (Plus)", point: 1.33, range: "58 – 61", assessment: "Very Poor" },
  { grade: "D (Plain)", point: 1.00, range: "55 – 57", assessment: "Pass" },
  { grade: "F", point: 0.00, range: "0 – 54", assessment: "Fail" }
];

const gradePoints = Object.fromEntries(gradeScale.map(g => [g.grade, g.point]));

export default function CGPACalculator({ isDarkMode, setIsDarkMode, activeTab, setActiveTab }) {
  const [courses, setCourses] = useState([{ id: Date.now(), credit: 3, grade: "A (Plain)", isRetake: false, prevGrade: "C (Plain)" }]);
  const [prevCGPA, setPrevCGPA] = useState("");
  const [prevCredits, setPrevCredits] = useState("");
  const [result, setResult] = useState(null);
  const [targetCGPA, setTargetCGPA] = useState("");
  const [targetResult, setTargetResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistoryExpandedMobile, setIsHistoryExpandedMobile] = useState(false);

  const simulationRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("uiu-cgpa-premium-v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.prevCGPA) {
          setPrevCGPA(parsed.prevCGPA);
          setIsHistoryExpandedMobile(true);
        }
        if (parsed.prevCredits) setPrevCredits(parsed.prevCredits);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const calculateResults = () => {
      let termCredits = 0;
      let termPoints = 0;
      let retakeAdjustment = 0;
      let retakeCrAdjustment = 0;

      courses.forEach((c) => {
        const cr = Number(c.credit);
        const gp = gradePoints[c.grade];
        termCredits += cr;
        termPoints += cr * gp;
        if (c.isRetake) {
          retakeAdjustment += cr * gradePoints[c.prevGrade];
          retakeCrAdjustment += cr;
        }
      });

      const pCGPA = Number(prevCGPA) || 0;
      const pCredits = Number(prevCredits) || 0;
      const finalCredits = pCredits + termCredits - retakeCrAdjustment;
      const finalPoints = (pCGPA * pCredits) + termPoints - retakeAdjustment;
      const finalCGPA = finalPoints / (finalCredits || 1);

      setResult({
        gpa: termPoints / (termCredits || 1),
        cgpa: finalCGPA,
        totalCredits: finalCredits,
        termCredits
      });

      if (targetCGPA) {
        const nextCredits = 12; 
        const currentPoints = finalPoints;
        const currentCredits = finalCredits;
        const target = Number(targetCGPA);
        const neededGPA = (target * (currentCredits + nextCredits) - currentPoints) / nextCredits;
        setTargetResult(neededGPA > 4.0 ? "Impossible" : neededGPA < 0 ? "0.00" : neededGPA.toFixed(2));
      } else {
        setTargetResult(null);
      }

      localStorage.setItem("uiu-cgpa-premium-v1", JSON.stringify({ courses, prevCGPA, prevCredits }));
    };

    calculateResults();
  }, [courses, prevCGPA, prevCredits, targetCGPA]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), credit: 3, grade: "A (Plain)", isRetake: false, prevGrade: "C (Plain)" }]);
  };

  const removeCourse = (id) => {
    if (courses.length === 1) return;
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setCourses([{ id: Date.now(), credit: 3, grade: "A (Plain)", isRetake: false, prevGrade: "C (Plain)" }]);
      setPrevCGPA("");
      setPrevCredits("");
      setResult(null);
      setTargetCGPA("");
      setTargetResult(null);
      localStorage.removeItem("uiu-cgpa-premium-v1");
    }
  };

  const scrollToSimulation = () => {
    simulationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-orange-200 dark:selection:bg-orange-900/40 pb-28 md:pb-12">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass dark:bg-gray-900/80 border-b border-white/50 dark:border-white/5 px-3 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <span className="text-white font-black text-lg sm:text-xl italic drop-shadow-sm">U</span>
            </div>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight truncate">
                UIU HELPER <span className="text-orange-600 font-black">PRO</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none hidden xs:block">
                Academic Suite
              </p>
            </div>
          </div>
          
          {/* Desktop Tab Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-white/5">
             <button 
                onClick={() => setActiveTab('cgpa')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'cgpa' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
                CGPA Calculator
             </button>
             <button 
                onClick={() => setActiveTab('fee')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'fee' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
                Tuition Fee
             </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Scheme Modal Button */}
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-gray-800/70 border border-slate-200/80 dark:border-white/10 hover:border-orange-500/50 hover:text-orange-600 transition-all active:scale-95 shadow-sm"
              title="Grading Standard Scheme"
            >
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden xs:inline">Scheme</span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-gray-800/70 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                title="Toggle Dark Mode"
                aria-label="Toggle Dark Mode"
            >
                {isDarkMode ? (
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                ) : (
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
            </button>

            {/* Clear All Data */}
            <button 
              onClick={clearAll}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition-all active:scale-95"
              title="Reset All Data"
              aria-label="Reset All Data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* Sidebar toggle for desktop/tablet drawer */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-md active:scale-95 transition-all"
              title="Academic History & Goals"
              aria-label="Open Academic History & Goals"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Tabs Switcher */}
        <div className="md:hidden grid grid-cols-2 gap-1.5 mt-3 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl">
           <button 
              onClick={() => setActiveTab('cgpa')}
              className={`py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'cgpa' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
           >
              CGPA Calculator
           </button>
           <button 
              onClick={() => setActiveTab('fee')}
              className={`py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'fee' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
           >
              Tuition Fee
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-5 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10">
          
          {/* Left Panel: Desktop Sidebar / Mobile Fullscreen Drawer */}
          <aside className={`lg:col-span-4 space-y-6 ${isSidebarOpen ? 'fixed inset-0 z-50 p-5 sm:p-8 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm flex justify-end' : 'hidden lg:block'}`}>
            <div className={`${isSidebarOpen ? 'w-full max-w-md bg-white dark:bg-gray-900 h-full rounded-3xl p-6 overflow-y-auto space-y-6 shadow-2xl border dark:border-white/10' : 'space-y-6'}`}>
              
              {isSidebarOpen && (
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Academic Preferences</h2>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-bold active:scale-95"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Academic History Card */}
              <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/5 shadow-sm animate-slide-up">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">Academic History</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Prior Completed Credits & CGPA</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Current Overall CGPA</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g. 3.82"
                        value={prevCGPA}
                        onChange={(e) => setPrevCGPA(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 font-bold text-base text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-600 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300 dark:text-slate-600 font-black group-focus-within:text-orange-500">GPA</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Completed Credits</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        placeholder="e.g. 96"
                        value={prevCredits}
                        onChange={(e) => setPrevCredits(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3.5 font-bold text-base text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-600 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300 dark:text-slate-600 font-black group-focus-within:text-orange-500">CR</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Projection Goal Card */}
              <section className="bg-slate-900 dark:bg-gray-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up border dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/10 dark:bg-orange-950/40 text-orange-400 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">Future Goal</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Next 12 credits projection</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Set Target e.g. 3.50"
                      value={targetCGPA}
                      onChange={(e) => setTargetCGPA(e.target.value)}
                      className="w-full bg-white/5 dark:bg-black/30 border border-white/10 dark:border-white/10 rounded-2xl px-4 py-3.5 text-base font-bold text-white focus:border-orange-500 focus:ring-0 outline-none transition-all placeholder:text-slate-500"
                    />
                  </div>
                  
                  {targetResult && (
                    <div className="bg-orange-600 rounded-2xl p-5 border border-orange-500 shadow-lg shadow-orange-900/30 animate-scale-in">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100 opacity-90 block mb-1">Required Avg. GPA:</span>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-black text-white">{targetResult}</span>
                         {targetResult !== "Impossible" && <span className="text-xs font-bold text-orange-200">/ 4.00</span>}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <button 
                onClick={() => window.print()}
                className="w-full py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Export PDF Report
              </button>

              {isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Done
                </button>
              )}
            </div>
          </aside>

          {/* Right Panel: Main Calculator */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-8">
            
            {/* Visual Result Dashboard */}
            <section 
              ref={simulationRef}
              className="bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-slate-200/80 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-orange-500/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                
                {/* Left side: Stats info */}
                <div className="w-full md:flex-1 text-center md:text-left">
                  <header className="mb-3 sm:mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      Live Simulation
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      Performance Metrics
                    </h2>
                  </header>
                  
                  {/* Stat badges */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-sm mx-auto md:mx-0">
                    <div className="bg-slate-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Term GPA</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                        {result ? result.gpa.toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Total Credits</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                        {result ? result.totalCredits : "0.0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Circular Gauge on Mobile & Desktop */}
                <div className="relative shrink-0 my-2 md:my-0">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full border-[12px] sm:border-[14px] md:border-[16px] border-slate-100 dark:border-gray-800 flex flex-col items-center justify-center bg-white dark:bg-gray-900 shadow-xl relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="50%" cy="50%" r="46%" 
                        fill="none" 
                        stroke="#f26522" 
                        strokeWidth="14" 
                        strokeDasharray={Math.PI * 2 * 46 + "%"}
                        strokeDashoffset={`${100 - (result ? (result.cgpa / 4) * 100 : 0)}%`}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Overall CGPA</span>
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {result ? result.cgpa.toFixed(2) : "0.00"}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] font-bold text-green-500 uppercase">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                       UIU Official Scale
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile-Friendly Inline Academic History & Target Drawer / Accordion */}
            <div className="lg:hidden bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/5 p-4 sm:p-5 shadow-sm">
              <button 
                onClick={() => setIsHistoryExpandedMobile(!isHistoryExpandedMobile)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {prevCGPA ? `Prior: ${prevCGPA} CGPA • ${prevCredits || 0} Credits` : "Include Previous CGPA & Goal (Optional)"}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {isHistoryExpandedMobile ? "Tap to collapse" : prevCGPA ? "Tap to edit previous records or target goal" : "Tap to add your completed credits and previous CGPA"}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500">
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isHistoryExpandedMobile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isHistoryExpandedMobile && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-4 animate-slide-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Current CGPA</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g. 3.82"
                        value={prevCGPA}
                        onChange={(e) => setPrevCGPA(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-3 font-bold text-base text-slate-900 dark:text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Completed Credits</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 96"
                        value={prevCredits}
                        onChange={(e) => setPrevCredits(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-3 font-bold text-base text-slate-900 dark:text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Future Goal Target (Next 12 Cr)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g. 3.80"
                        value={targetCGPA}
                        onChange={(e) => setTargetCGPA(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 font-bold text-base text-slate-900 dark:text-white focus:border-orange-500 outline-none"
                      />
                      {targetResult && (
                        <div className="bg-orange-600 text-white px-3.5 py-2 rounded-xl flex items-center justify-center font-black text-sm whitespace-nowrap">
                          Req: {targetResult}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Courses Management */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-sm relative overflow-hidden">
               <div className="bg-slate-50/70 dark:bg-gray-800/40 px-4 sm:px-8 md:px-10 py-4 sm:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">Current Trimester</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {courses.length} Course{courses.length > 1 ? 's' : ''} • {result ? result.termCredits : 0} Term Credits
                    </p>
                  </div>
                  <button 
                    onClick={() => setCourses([{ id: Date.now(), credit: 3, grade: "A (Plain)", isRetake: false, prevGrade: "C (Plain)" }])}
                    className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest px-2 py-1"
                  >
                    Reset List
                  </button>
               </div>

               <div className="p-3 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
                  {courses.map((course, index) => (
                    <div 
                      key={course.id} 
                      className="group bg-slate-50/40 dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800/30 rounded-2xl border border-slate-200/80 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all p-3.5 sm:p-5"
                    >
                      {/* Top row of course card: Index + Actions */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-black">
                            {index + 1}
                          </span>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                            Course {index + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => updateCourse(course.id, "isRetake", !course.isRetake)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${course.isRetake ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200/70 dark:bg-gray-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300'}`}
                          >
                            {course.isRetake ? 'Retake ✓' : 'Retake?'}
                          </button>
                          
                          {courses.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => removeCourse(course.id)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete Course"
                              aria-label="Delete Course"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main selectors: Side by side on phone! */}
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">
                             Credits
                           </label>
                           <select 
                            value={course.credit}
                            onChange={(e) => updateCourse(course.id, "credit", e.target.value)}
                            className="select-custom w-full bg-white dark:bg-gray-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 sm:py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none cursor-pointer appearance-none shadow-sm"
                           >
                            {[1, 1.5, 2, 3, 4].map(c => <option key={c} value={c} className="bg-white dark:bg-gray-900">{c.toFixed(1)} Credits</option>)}
                           </select>
                        </div>

                        <div>
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">
                             Grade Earned
                           </label>
                           <select 
                            value={course.grade}
                            onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                            className="select-custom w-full bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 rounded-xl px-3 py-2.5 sm:py-3 text-sm font-black text-orange-600 dark:text-orange-400 focus:border-orange-500 outline-none cursor-pointer appearance-none shadow-sm"
                           >
                            {gradeScale.map(g => (
                              <option key={g.grade} value={g.grade} className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">
                                {g.grade} ({g.point.toFixed(2)})
                              </option>
                            ))}
                           </select>
                        </div>
                      </div>

                      {/* Retake specification panel */}
                      {course.isRetake && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-orange-50/40 dark:bg-orange-950/10 p-3 rounded-xl">
                           <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                Previous grade will be replaced in calculation
                              </span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Prev Grade:</span>
                             <select 
                                value={course.prevGrade}
                                onChange={(e) => updateCourse(course.id, "prevGrade", e.target.value)}
                                className="select-custom bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 focus:outline-none cursor-pointer appearance-none"
                             >
                                {gradeScale.map(g => <option key={g.grade} value={g.grade} className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white">{g.grade}</option>)}
                             </select>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Append Course Button */}
                  <button 
                    onClick={addCourse}
                    className="w-full py-4 sm:py-5 border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-98 shadow-sm"
                  >
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    Add Another Course
                  </button>
               </div>

               <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-gray-800/30 border-t border-slate-100 dark:border-white/5 text-center">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    Real-time calculation • Instant feedback
                  </p>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Floating Sticky Bottom Quick Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-white/10 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 pb-safe">
        <button 
          onClick={scrollToSimulation}
          className="flex items-center gap-3 text-left active:scale-98"
          title="Scroll to Top Metrics"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
            <span className="text-[8px] font-bold uppercase leading-none opacity-80">CGPA</span>
            <span className="text-sm font-black leading-tight">{result ? result.cgpa.toFixed(2) : "0.00"}</span>
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">
              Term GPA: {result ? result.gpa.toFixed(2) : "0.00"}
            </div>
            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              {result ? result.termCredits : 0} Term Cr • Tap to review
            </div>
          </div>
        </button>

        <button 
          onClick={addCourse}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-orange-600 text-white text-xs font-black shadow-md active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          <span>Add Course</span>
        </button>
      </div>

      {/* Grade Scale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl sm:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-slate-200 dark:border-white/10">
            <div className="bg-slate-900 dark:bg-black p-5 sm:p-7 flex justify-between items-center border-b border-slate-800 dark:border-white/5">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">University Grading Standard</h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">United International University</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white text-lg transition-all active:scale-95"
              >
                ✕
              </button>
            </div>
            <div className="p-3 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {gradeScale.map(g => (
                  <div key={g.grade} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                    <div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200">{g.grade.split(' ')[0]}</div>
                      <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{g.assessment}</div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{g.range}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-500">{g.point.toFixed(2)}</div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase">Pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-gray-800/30 flex justify-end">
              <button onClick={() => setShowModal(false)} className="w-full sm:w-auto bg-slate-900 dark:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-10 sm:py-16 text-center border-t border-slate-200/60 dark:border-white/5 mt-8">
        <div className="opacity-30 dark:opacity-50 hover:opacity-100 transition-all mb-4 inline-block">
          <div className="w-10 h-10 bg-slate-900 dark:bg-gray-800 rounded-xl flex items-center justify-center font-black text-white text-xl italic">U</div>
        </div>
        <div className="space-y-1.5">
           <p className="text-[10px] sm:text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest">United International University</p>
           <p className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-600 max-w-md mx-auto leading-relaxed">
             Integrated Academic Management Suite. Standard university credit & grading regulation.
           </p>
        </div>
      </footer>

    </div>
  );
}
