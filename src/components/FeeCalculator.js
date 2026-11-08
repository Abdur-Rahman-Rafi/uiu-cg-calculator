import React, { useState, useEffect, useRef } from "react";

export default function FeeCalculator({ isDarkMode, setIsDarkMode, activeTab, setActiveTab }) {
  const [academicSystem, setAcademicSystem] = useState("Trimester");
  const [creditFee, setCreditFee] = useState(6500);
  const [registrationFee, setRegistrationFee] = useState(6500);
  
  const [waiver, setWaiver] = useState(0);
  const [scholarship, setScholarship] = useState(0);

  const [totalCredits, setTotalCredits] = useState("");
  const [fydpCredits, setFydpCredits] = useState("");
  const [firstRetakeCredits, setFirstRetakeCredits] = useState("");
  const [repeatCredits, setRepeatCredits] = useState("");

  const [transportAmount, setTransportAmount] = useState(4000);
  const [transportEnabled, setTransportEnabled] = useState(false);
  const [gymAmount, setGymAmount] = useState(1000);
  const [gymEnabled, setGymEnabled] = useState(false);

  const [lateRegistration, setLateRegistration] = useState(false);
  const [firstPenalty, setFirstPenalty] = useState(false);
  const [secondPenalty, setSecondPenalty] = useState(false);
  const [thirdPenalty, setThirdPenalty] = useState(false);

  const [result, setResult] = useState(null);
  const summaryRef = useRef(null);

  useEffect(() => {
    calculateFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    academicSystem, creditFee, registrationFee, waiver, scholarship,
    totalCredits, fydpCredits, firstRetakeCredits, repeatCredits,
    transportAmount, transportEnabled, gymAmount, gymEnabled,
    lateRegistration, firstPenalty, secondPenalty, thirdPenalty
  ]);

  const calculateFee = () => {
    const totalCr = Number(totalCredits) || 0;
    const fydpCr = Number(fydpCredits) || 0;
    const firstRetakeCr = Number(firstRetakeCredits) || 0;
    const repeatCr = Number(repeatCredits) || 0;

    // Step 1: Base
    const baseTuition = totalCr * creditFee;
    const totalBaseFee = baseTuition + registrationFee;
    
    // Step 2: 1st Retake Discount
    const firstRetakeDiscount = firstRetakeCr * creditFee * 0.5;
    const feeAfterRetake = totalBaseFee - firstRetakeDiscount;
    
    // Step 3 & 4: Eligibility & Waiver Application
    const regularCredits = Math.max(0, totalCr - fydpCr - firstRetakeCr - repeatCr);
    const eligibleForDiscount = regularCredits * creditFee;
    
    const maxDiscountPercent = Math.max(Number(waiver) || 0, Number(scholarship) || 0);
    const appliedDiscountPercent = Math.min(100, maxDiscountPercent);
    const waiverAndScholarshipAmount = eligibleForDiscount * (appliedDiscountPercent / 100);

    const netTuitionAndReg = feeAfterRetake - waiverAndScholarshipAmount;

    // Step 5: Extras
    const extras = (transportEnabled ? Number(transportAmount) : 0) + 
                   (gymEnabled ? Number(gymAmount) : 0);

    // Step 6: Penalties
    const pLateReg = lateRegistration ? 500 : 0;
    const pFirst = firstPenalty ? 500 : 0;
    const pSecond = secondPenalty ? 500 : 0;
    const pThird = thirdPenalty ? 500 : 0;

    const total = netTuitionAndReg + extras + pLateReg + pFirst + pSecond + pThird;

    // Step 7: Installments
    const inst1 = (netTuitionAndReg * 0.4) + extras + pLateReg;
    const inst2 = (netTuitionAndReg * 0.3) + pFirst;
    const inst3 = (netTuitionAndReg * 0.3) + pSecond;
    const inst4 = pThird;

    setResult({
      totalBaseFee,
      firstRetakeDiscount,
      feeAfterRetake,
      eligibleForDiscount,
      waiverAndScholarshipAmount,
      netTuitionAndReg,
      extras,
      penalties: pLateReg + pFirst + pSecond + pThird,
      inst1,
      inst2,
      inst3,
      inst4,
      total
    });
  };

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const ExtrasInput = ({ label, enabled, setEnabled, amount, setAmount, options }) => (
    <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${enabled ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40' : 'bg-slate-50 dark:bg-gray-800/40 border-slate-200/80 dark:border-white/5'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 accent-orange-600 rounded cursor-pointer shrink-0"
          />
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{label}</span>
        </label>
        
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <select 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={!enabled}
            className="select-custom w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {options.map(opt => (
               <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

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
                Tuition Suite
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
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-8 animate-fade-in">
             
             {/* Configuration Card */}
             <section className="bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-200/80 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-white/5">
                   <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-black text-sm">
                      ৳
                   </div>
                   <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Term & Unit Fees</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Academic System</label>
                     <select 
                       value={academicSystem}
                       onChange={(e) => setAcademicSystem(e.target.value)}
                       className="select-custom w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option>Trimester</option>
                        <option>Semester</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Credit Fee (৳)</label>
                     <select 
                       value={creditFee}
                       onChange={(e) => setCreditFee(Number(e.target.value))}
                       className="select-custom w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option value="5000">৳ 5,000 / cr</option>
                        <option value="5500">৳ 5,500 / cr</option>
                        <option value="6000">৳ 6,000 / cr</option>
                        <option value="6500">৳ 6,500 / cr</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Reg. Fee (৳)</label>
                     <select 
                       value={registrationFee}
                       onChange={(e) => setRegistrationFee(Number(e.target.value))}
                       className="select-custom w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option value="5000">৳ 5,000</option>
                        <option value="5500">৳ 5,500</option>
                        <option value="6000">৳ 6,000</option>
                        <option value="6500">৳ 6,500</option>
                     </select>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Waiver Percentage (%)</label>
                     <select 
                       value={waiver}
                       onChange={(e) => setWaiver(Number(e.target.value))}
                       className="select-custom w-full bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option value="0">0% (None)</option>
                        <option value="25">25% (A+ / 3.5+ CGPA)</option>
                        <option value="50">50% (Golden A+)</option>
                        <option value="100">100% (Full Waiver)</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Scholarship (%)</label>
                     <select 
                       value={scholarship}
                       onChange={(e) => setScholarship(Number(e.target.value))}
                       className="select-custom w-full bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:border-blue-500 outline-none cursor-pointer"
                     >
                        <option value="0">0% (None)</option>
                        <option value="25">25% (Trimester Result)</option>
                        <option value="50">50% (Trimester Result)</option>
                        <option value="100">100% (Full Scholarship)</option>
                     </select>
                   </div>
                </div>
             </section>

             {/* Credits Breakdown Card */}
             <section className="bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-200/80 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-white/5">
                   <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-black text-sm">
                      CR
                   </div>
                   <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Credits Breakdown</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Total Enrolled Credits</label>
                     <input 
                       type="number" 
                       placeholder="e.g. 14"
                       value={totalCredits} 
                       onChange={(e) => setTotalCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-base sm:text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
                       <span>FYDP Credits</span>
                       <span className="text-slate-400 lowercase font-normal">(No waiver)</span>
                     </label>
                     <input 
                       type="number" 
                       placeholder="e.g. 2"
                       value={fydpCredits} 
                       onChange={(e) => setFydpCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-base sm:text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block flex items-center justify-between">
                        <span>1st Retake Credits</span>
                        <span className="text-orange-500 font-black">-50% Off</span>
                     </label>
                     <input 
                       type="number" 
                       placeholder="e.g. 3"
                       value={firstRetakeCredits} 
                       onChange={(e) => setFirstRetakeCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-base sm:text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block flex items-center justify-between">
                        <span>2nd+ Retake Credits</span>
                        <span className="text-slate-400 font-medium">Standard Fee</span>
                     </label>
                     <input 
                       type="number" 
                       placeholder="e.g. 3"
                       value={repeatCredits} 
                       onChange={(e) => setRepeatCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-base sm:text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                </div>
             </section>

             {/* Extras & Penalties Card */}
             <section className="bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-200/80 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-white/5">
                   <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-black text-sm">
                      +
                   </div>
                   <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Other Extras & Fines</h3>
                </div>

                <div className="space-y-3 mb-6">
                   <ExtrasInput 
                     label="Transportation" 
                     enabled={transportEnabled} 
                     setEnabled={setTransportEnabled} 
                     amount={transportAmount} 
                     setAmount={setTransportAmount}
                     options={[
                       { label: 'Standard Bus (৳4,000)', value: 4000 },
                       { label: 'AC Bus (৳6,000)', value: 6000 }
                     ]}
                   />
                   <ExtrasInput 
                     label="Gym Membership" 
                     enabled={gymEnabled} 
                     setEnabled={setGymEnabled} 
                     amount={gymAmount} 
                     setAmount={setGymAmount}
                     options={[
                       { label: 'Standard (৳1,000)', value: 1000 },
                       { label: 'Advanced (৳1,500)', value: 1500 },
                       { label: 'Premium (৳2,500)', value: 2500 }
                     ]}
                   />
                </div>

                {/* Touch-Friendly Late Penalty Buttons */}
                <div>
                   <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                     Late Penalties (৳500 each) — Tap to Toggle
                   </h4>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      <button 
                        type="button"
                        onClick={() => setLateRegistration(!lateRegistration)}
                        className={`p-3 rounded-xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${lateRegistration ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5'}`}
                      >
                         <span className="text-xs font-black">Late Reg.</span>
                         <span className={`text-[10px] font-bold ${lateRegistration ? 'text-orange-100' : 'text-slate-400'}`}>
                           {lateRegistration ? 'Active (৳500)' : '+ ৳500'}
                         </span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setFirstPenalty(!firstPenalty)}
                        className={`p-3 rounded-xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${firstPenalty ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5'}`}
                      >
                         <span className="text-xs font-black">1st Inst.</span>
                         <span className={`text-[10px] font-bold ${firstPenalty ? 'text-orange-100' : 'text-slate-400'}`}>
                           {firstPenalty ? 'Active (৳500)' : '+ ৳500'}
                         </span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setSecondPenalty(!secondPenalty)}
                        className={`p-3 rounded-xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${secondPenalty ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5'}`}
                      >
                         <span className="text-xs font-black">2nd Inst.</span>
                         <span className={`text-[10px] font-bold ${secondPenalty ? 'text-orange-100' : 'text-slate-400'}`}>
                           {secondPenalty ? 'Active (৳500)' : '+ ৳500'}
                         </span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setThirdPenalty(!thirdPenalty)}
                        className={`p-3 rounded-xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${thirdPenalty ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5'}`}
                      >
                         <span className="text-xs font-black">3rd Inst.</span>
                         <span className={`text-[10px] font-bold ${thirdPenalty ? 'text-orange-100' : 'text-slate-400'}`}>
                           {thirdPenalty ? 'Active (৳500)' : '+ ৳500'}
                         </span>
                      </button>
                   </div>
                </div>
             </section>

          </div>

          {/* Right Panel: Installment Summary */}
          <aside className="lg:col-span-5 space-y-6">
             <div 
               ref={summaryRef}
               className="bg-slate-900 dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 text-white shadow-xl sticky top-24 border dark:border-white/5 animate-slide-up"
             >
                <header className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    Payment Calculation
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-white">
                     ৳ {result ? result.total.toLocaleString() : "0"}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">Total Payable Amount</p>
                </header>
                
                <div className="space-y-3 mb-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                   <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-400">Base Fee (Tuition + Reg)</span>
                      <span className="font-bold">৳ {result?.totalBaseFee.toLocaleString() || "0"}</span>
                   </div>
                   {(result?.firstRetakeDiscount || 0) > 0 && (
                     <div className="flex justify-between items-center text-xs sm:text-sm text-green-400">
                        <span>1st Retake Discount (50%)</span>
                        <span className="font-bold">- ৳ {result?.firstRetakeDiscount.toLocaleString()}</span>
                     </div>
                   )}
                   {(result?.waiverAndScholarshipAmount || 0) > 0 && (
                     <div className="flex justify-between items-center text-xs sm:text-sm text-green-400">
                        <span>Waiver & Scholarship</span>
                        <span className="font-bold">- ৳ {result?.waiverAndScholarshipAmount.toLocaleString()}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-xs sm:text-sm border-t border-white/10 pt-2 font-bold text-slate-200">
                      <span>Net Tuition & Reg</span>
                      <span>৳ {result?.netTuitionAndReg.toLocaleString() || "0"}</span>
                   </div>
                   {((result?.extras || 0) + (result?.penalties || 0)) > 0 && (
                     <div className="flex justify-between items-center text-xs sm:text-sm text-orange-400">
                        <span>Extras & Penalties</span>
                        <span className="font-bold">+ ৳ {((result?.extras || 0) + (result?.penalties || 0)).toLocaleString()}</span>
                     </div>
                   )}
                </div>

                <div className="border-t border-white/10 pt-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Installment Breakdown</h4>
                   <div className="space-y-2.5">
                      <div className="bg-white/5 rounded-xl p-3.5 flex justify-between items-center border border-white/5">
                         <div>
                            <div className="text-xs font-black text-orange-400 uppercase tracking-wider">1st Installment</div>
                            <div className="text-[10px] text-slate-400">40% Net Tuition/Reg + Extras</div>
                         </div>
                         <div className="text-base sm:text-lg font-black tabular-nums">৳ {result?.inst1.toLocaleString() || "0"}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3.5 flex justify-between items-center border border-white/5">
                         <div>
                            <div className="text-xs font-black text-orange-400 uppercase tracking-wider">2nd Installment</div>
                            <div className="text-[10px] text-slate-400">30% Net Tuition/Reg</div>
                         </div>
                         <div className="text-base sm:text-lg font-black tabular-nums">৳ {result?.inst2.toLocaleString() || "0"}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3.5 flex justify-between items-center border border-white/5">
                         <div>
                            <div className="text-xs font-black text-orange-400 uppercase tracking-wider">3rd Installment</div>
                            <div className="text-[10px] text-slate-400">30% Net Tuition/Reg</div>
                         </div>
                         <div className="text-base sm:text-lg font-black tabular-nums">৳ {result?.inst3.toLocaleString() || "0"}</div>
                      </div>
                      {(result?.inst4 || 0) > 0 && (
                        <div className="bg-red-500/10 rounded-xl p-3.5 flex justify-between items-center border border-red-500/20">
                           <div>
                              <div className="text-xs font-black text-red-400 uppercase tracking-wider">Post-Trimester Dues</div>
                              <div className="text-[10px] text-red-300/70">3rd Inst. Penalty</div>
                           </div>
                           <div className="text-base sm:text-lg font-black text-red-400 tabular-nums">৳ {result?.inst4.toLocaleString()}</div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </aside>

        </div>
      </main>

      {/* Mobile Floating Sticky Bottom Summary Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 dark:bg-black/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 text-white pb-safe">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Total Payable</span>
          <span className="text-base font-black text-white tabular-nums leading-tight">
            ৳ {result ? result.total.toLocaleString() : "0"}
          </span>
          <span className="text-[9px] text-orange-400 font-semibold">
            1st Inst: ৳ {result ? result.inst1.toLocaleString() : "0"}
          </span>
        </div>

        <button 
          onClick={scrollToSummary}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black shadow-md active:scale-95 shrink-0"
        >
          <span>Breakdown</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-10 sm:py-16 text-center border-t border-slate-200/60 dark:border-white/5 mt-8">
        <p className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-600">
          Integrated Tuition Fee Calculator for United International University students.
        </p>
      </footer>
    </div>
  );
}
