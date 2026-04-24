import React, { useState, useEffect } from "react";

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

export default function CGPACalculator() {
  const [courses, setCourses] = useState([{ id: Date.now(), credit: 3, grade: "A (Plain)", isRetake: false, prevGrade: "C (Plain)" }]);
  const [prevCGPA, setPrevCGPA] = useState("");
  const [prevCredits, setPrevCredits] = useState("");
  const [result, setResult] = useState(null);
  const [targetCGPA, setTargetCGPA] = useState("");
  const [targetResult, setTargetResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("uiu-cgpa-theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const saved = localStorage.getItem("uiu-cgpa-premium-v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.prevCGPA) setPrevCGPA(parsed.prevCGPA);
        if (parsed.prevCredits) setPrevCredits(parsed.prevCredits);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("uiu-cgpa-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("uiu-cgpa-theme", "light");
    }
  }, [isDarkMode]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-orange-200 dark:selection:bg-orange-900/40">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass dark:bg-gray-900/70 border-b border-white/50 dark:border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
              <span className="text-white font-black text-xl italic drop-shadow-sm">U</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                UIU CGPA <span className="text-orange-600 font-black">PRO</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Intelligence Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Toggle Dark Mode"
            >
                {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 6.343l.707.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Scheme
            </button>
            <button 
              onClick={clearAll}
              className="p-2.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Clear all data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white shadow-lg active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Panel: Inputs & Stats */}
          <aside className={`lg:col-span-4 space-y-8 ${isSidebarOpen ? 'block' : 'hidden lg:block'} fixed lg:static inset-0 z-40 bg-slate-50/95 dark:bg-gray-950/95 backdrop-blur-md lg:bg-transparent p-6 lg:p-0 overflow-y-auto`}>
            <div className="flex items-center justify-between lg:hidden mb-8">
               <h2 className="text-xl font-bold dark:text-white">Preferences</h2>
               <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">×</button>
            </div>

            {/* Academic History Card */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-200/60 dark:border-white/5 shadow-sm animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Academic History</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 block">Current Overall CGPA</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 3.82"
                      value={prevCGPA}
                      onChange={(e) => setPrevCGPA(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-600 focus:ring-4 focus:ring-orange-50/50 dark:focus:ring-orange-900/20 transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 font-bold group-focus-within:text-orange-500">GPA</div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 block">Completed Credits</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      placeholder="e.g. 96"
                      value={prevCredits}
                      onChange={(e) => setPrevCredits(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 font-bold text-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-600 focus:ring-4 focus:ring-orange-50/50 dark:focus:ring-orange-900/20 transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 font-bold group-focus-within:text-orange-500">CR</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Projection Goal Card */}
            <section className="bg-slate-900 dark:bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none animate-slide-up stagger-1 border dark:border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-white/10 dark:bg-orange-900/20 text-orange-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h3 className="font-bold text-white">Future Goal</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Calculate the GPA needed in your next 12 credits to reach your target CGPA.</p>
              
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Set Target e.g. 3.50"
                    value={targetCGPA}
                    onChange={(e) => setTargetCGPA(e.target.value)}
                    className="w-full bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-2xl px-5 py-5 text-xl font-bold text-white focus:border-orange-500 focus:ring-0 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
                
                {targetResult && (
                  <div className="bg-orange-600 rounded-2xl p-6 border border-orange-500 shadow-lg shadow-orange-900/20 animate-scale-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100 opacity-80 block mb-1">Required Avg. GPA:</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-white">{targetResult}</span>
                       {targetResult !== "Impossible" && <span className="text-xs font-bold text-orange-200">/ 4.00</span>}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <button 
              onClick={() => window.print()}
              className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-all flex items-center justify-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Export PDF Report
            </button>
          </aside>

          {/* Right Panel: Main Calculator */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual Result Dashboard */}
            <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-950/20 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                  <header className="mb-4">
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.4em] mb-2 block">Projection Status</span>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Active Simulation</h2>
                  </header>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-slate-50 dark:bg-gray-800/50 px-6 py-4 rounded-3xl border border-slate-100 dark:border-white/5 min-w-[140px]">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Term GPA</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{result ? result.gpa.toFixed(2) : "0.00"}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800/50 px-6 py-4 rounded-3xl border border-slate-100 dark:border-white/5 min-w-[140px]">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Total Credits</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{result ? result.totalCredits : "0.0"}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-[16px] border-slate-50 dark:border-gray-800 flex flex-col items-center justify-center bg-white dark:bg-gray-900 shadow-2xl relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="50%" cy="50%" r="46%" 
                        fill="none" 
                        stroke="#f26522" 
                        strokeWidth="16" 
                        strokeDasharray={Math.PI * 2 * 46 + "%"}
                        strokeDashoffset={`${100 - (result ? (result.cgpa / 4) * 100 : 0)}%`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Overall CGPA</span>
                    <span className="text-6xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {result ? result.cgpa.toFixed(2) : "0.00"}
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-500 uppercase">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       Verified
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Courses Management */}
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm relative overflow-hidden">
               <div className="bg-slate-50/50 dark:bg-gray-800/30 px-8 md:px-12 py-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Current Trimester</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Add subjects and grades to calculate this term's performance.</p>
                  </div>
                  <button 
                    onClick={() => setCourses([{ id: Date.now(), credit: 3, grade: "A (Plain)", isRetake: false, prevGrade: "C (Plain)" }])}
                    className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest"
                  >
                    Reset List
                  </button>
               </div>

               <div className="p-4 md:p-8 space-y-4">
                  {courses.map((course, index) => (
                    <div key={course.id} className="group overflow-hidden bg-white dark:bg-gray-900 hover:bg-slate-50/50 dark:hover:bg-gray-800/20 rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300 animate-fade-in p-5 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                        <div className="md:col-span-1 hidden md:flex items-center justify-center">
                           <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-slate-400 dark:text-slate-600">
                             {index + 1}
                           </span>
                        </div>
                        
                        <div className="md:col-span-4">
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Credits</label>
                           <select 
                            value={course.credit}
                            onChange={(e) => updateCourse(course.id, "credit", e.target.value)}
                            className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-950/20 focus:border-orange-500 outline-none transition-all cursor-pointer appearance-none"
                           >
                            {[1, 1.5, 2, 3, 4].map(c => <option key={c} value={c} className="bg-white dark:bg-gray-900">{c.toFixed(1)} Credits</option>)}
                           </select>
                        </div>

                        <div className="md:col-span-4">
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Grade Earned</label>
                           <select 
                            value={course.grade}
                            onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                            className="w-full bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-900/20 rounded-xl px-4 py-3 text-sm font-bold text-orange-600 dark:text-orange-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-950/20 focus:border-orange-500 outline-none transition-all cursor-pointer appearance-none"
                           >
                            {gradeScale.map(g => <option key={g.grade} value={g.grade} className="bg-white dark:bg-gray-900">{g.grade}</option>)}
                           </select>
                        </div>

                        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-6">
                           <button 
                            onClick={() => updateCourse(course.id, "isRetake", !course.isRetake)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${course.isRetake ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-gray-700'}`}
                           >
                             Retake
                           </button>
                           <button 
                            onClick={() => removeCourse(course.id)}
                            className="p-3 text-slate-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                      </div>

                      {course.isRetake && (
                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center gap-4 animate-slide-up">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-wider text-center sm:text-left">Adjustment: Replace previous grade with current performance</span>
                           </div>
                           <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5">
                             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">Previous Grade:</span>
                             <select 
                                value={course.prevGrade}
                                onChange={(e) => updateCourse(course.id, "prevGrade", e.target.value)}
                                className="bg-transparent text-[11px] font-black text-orange-600 dark:text-orange-500 focus:outline-none cursor-pointer"
                             >
                                {gradeScale.map(g => <option key={g.grade} value={g.grade} className="bg-white dark:bg-gray-900">{g.grade}</option>)}
                             </select>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <button 
                    onClick={addCourse}
                    className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl text-slate-400 dark:text-slate-700 hover:text-orange-500 dark:hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-900/50 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    Append Course
                  </button>
               </div>

               <div className="p-8 md:p-12 bg-slate-50/50 dark:bg-gray-800/30 border-t border-slate-100 dark:border-white/5 text-center">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    Live Calculation Active • Results update instantly
                  </p>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Grade Scale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border dark:border-white/5">
            <div className="bg-slate-900 dark:bg-black p-8 flex justify-between items-center border-b border-slate-800 dark:border-white/5">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">University Grading Standard</h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mt-1">Official United International University Metrics</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl text-white text-xl transition-all"
              >
                ×
              </button>
            </div>
            <div className="p-4 md:p-10 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradeScale.map(g => (
                  <div key={g.grade} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5 group-hover:border-orange-100 dark:group-hover:border-orange-500/30 transition-all">
                        <span className="text-lg font-black text-slate-800 dark:text-slate-200">{g.grade.split(' ')[0]}</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{g.assessment}</div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{g.range} Marks</div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black text-orange-600 dark:text-orange-500">{g.point.toFixed(2)}</div>
                       <div className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter">Points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-gray-800/30 flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-slate-900 dark:bg-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-slate-200 dark:hover:shadow-none transition-all">Dismiss Guide</button>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center border-t border-slate-200/60 dark:border-white/5 mt-12">
        <div className="opacity-20 dark:opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all mb-8 inline-block cursor-help">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-2xl italic tracking-tighter">U</div>
        </div>
        <div className="space-y-2">
           <p className="text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-[0.5em]">United International University</p>
           <p className="text-xs font-medium text-slate-400 dark:text-slate-600 max-w-lg mx-auto leading-relaxed">
             Integrated Academic Management Tool. Designed for precision and ease of use. 
             Calculations follow the standard university credit system regulation.
           </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .dark { --uiu-bg: white; --text-main: black; }
          nav, aside, button, footer, .md\\:col-span-3, .p-8.bg-slate-900 { display: none !important; }
          main { display: block !important; padding: 0 !important; max-width: 100% !important; }
          .lg\\:col-span-8 { width: 100% !important; }
          .bg-white, .bg-slate-50, .dark\\:bg-gray-900, .dark\\:bg-gray-800 { background: white !important; border: 1px solid #efefef !important; box-shadow: none !important; border-radius: 0 !important; }
          .rounded-[2.5rem], .rounded-3xl, .rounded-2xl { border-radius: 12px !important; }
          .text-slate-900, .dark\\:text-white, .dark\\:text-slate-200 { color: black !important; }
          .text-orange-600, .dark\\:text-orange-500 { color: #f26522 !important; }
          .shadow-xl, .shadow-2xl { box-shadow: none !important; }
        }
      `}} />
    </div>
  );
}
