import React, { useState, useEffect } from "react";

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
    
    // Step 3: FYDP (Excluded from scholarship eligibility)
    // FYDP and Repeat Retake credits are billed at full price, so we just exclude them from the discount eligibility below.
    
    // Step 4: Eligibility & Waiver Application
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
    // 40% / 30% / 30% split on the Net Tuition+Reg, then add specific extras/fines
    const inst1 = (netTuitionAndReg * 0.4) + extras + pLateReg;
    const inst2 = (netTuitionAndReg * 0.3) + pFirst;
    const inst3 = (netTuitionAndReg * 0.3) + pSecond;
    const inst4 = pThird; // Paid after 3rd

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

  const ExtrasInput = ({ label, enabled, setEnabled, amount, setAmount, options }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
      <div className="flex items-center gap-3 w-full sm:w-1/3">
        <input 
          type="checkbox" 
          checked={enabled} 
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-5 h-5 accent-orange-600 rounded"
        />
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
      </div>
      <div className="w-full sm:w-2/3">
        <select 
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={!enabled}
          className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none disabled:opacity-50"
        >
          {options.map(opt => (
             <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

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
                UIU HELPER <span className="text-orange-600 font-black">PRO</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Intelligence Suite</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-white/5">
             <button 
                onClick={() => setActiveTab('cgpa')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'cgpa' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
                CGPA
             </button>
             <button 
                onClick={() => setActiveTab('fee')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'fee' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
                Tuition Fee
             </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
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
          </div>
        </div>
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-4">
           <button 
              onClick={() => setActiveTab('cgpa')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'cgpa' ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
           >
              CGPA
           </button>
           <button 
              onClick={() => setActiveTab('fee')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'fee' ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
           >
              Fee
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
             
             {/* Configuration */}
             <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Term & Unit Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">System</label>
                     <select 
                       value={academicSystem}
                       onChange={(e) => setAcademicSystem(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none"
                     >
                        <option>Trimester</option>
                        <option>Semester</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Credit Fee (৳)</label>
                     <select 
                       value={creditFee}
                       onChange={(e) => setCreditFee(Number(e.target.value))}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option value="5000">5,000</option>
                        <option value="5500">5,500</option>
                        <option value="6000">6,000</option>
                        <option value="6500">6,500</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Reg. Fee (৳)</label>
                     <select 
                       value={registrationFee}
                       onChange={(e) => setRegistrationFee(Number(e.target.value))}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option value="5000">5,000</option>
                        <option value="5500">5,500</option>
                        <option value="6000">6,000</option>
                        <option value="6500">6,500</option>
                     </select>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Waiver Percentage (%)</label>
                     <select 
                       value={waiver}
                       onChange={(e) => setWaiver(Number(e.target.value))}
                       className="w-full bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 text-orange-600 rounded-xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none cursor-pointer"
                     >
                        <option value="0">0% (None)</option>
                        <option value="25">25% (A+ / 3.5+ CGPA)</option>
                        <option value="50">50% (Golden A+)</option>
                        <option value="100">100% (Full Waiver)</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Scholarship (%)</label>
                     <select 
                       value={scholarship}
                       onChange={(e) => setScholarship(Number(e.target.value))}
                       className="w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 text-blue-600 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none cursor-pointer"
                     >
                        <option value="0">0% (None)</option>
                        <option value="25">25% (Trimester Result)</option>
                        <option value="50">50% (Trimester Result)</option>
                        <option value="100">100% (Full Scholarship)</option>
                     </select>
                   </div>
                </div>
             </section>

             {/* Credits */}
             <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Credits Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Total Enrolled Credits</label>
                     <input 
                       type="number" placeholder="e.g. 14"
                       value={totalCredits} onChange={(e) => setTotalCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex justify-between">
                       FYDP Credits <span className="text-slate-400 lowercase font-normal">(Excluded from waivers)</span>
                     </label>
                     <input 
                       type="number" placeholder="e.g. 2"
                       value={fydpCredits} onChange={(e) => setFydpCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center justify-between">
                        1st Retake Credits <span className="text-orange-500 font-black">-50%</span>
                     </label>
                     <input 
                       type="number" placeholder="e.g. 3"
                       value={firstRetakeCredits} onChange={(e) => setFirstRetakeCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center justify-between">
                        2nd+ Retake Credits <span className="text-red-500 font-black">No Discount</span>
                     </label>
                     <input 
                       type="number" placeholder="e.g. 3"
                       value={repeatCredits} onChange={(e) => setRepeatCredits(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-orange-500 outline-none"
                     />
                   </div>
                </div>
             </section>

             {/* Extras */}
             <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Other Extras & Fines</h3>
                <div className="space-y-4 mb-8">
                   <ExtrasInput 
                     label="Transportation" enabled={transportEnabled} setEnabled={setTransportEnabled} 
                     amount={transportAmount} setAmount={setTransportAmount}
                     options={[
                       { label: 'Standard Bus (৳4,000)', value: 4000 },
                       { label: 'AC Bus (৳6,000)', value: 6000 }
                     ]}
                   />
                   <ExtrasInput 
                     label="Gym" enabled={gymEnabled} setEnabled={setGymEnabled} 
                     amount={gymAmount} setAmount={setGymAmount}
                     options={[
                       { label: 'Standard (৳1,000)', value: 1000 },
                       { label: 'Advanced (৳1,500)', value: 1500 },
                       { label: 'Premium (৳2,500)', value: 2500 }
                     ]}
                   />
                </div>

                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Late Penalties (৳500 each)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={lateRegistration} onChange={(e) => setLateRegistration(e.target.checked)} className="accent-orange-600" />
                     <span className="text-xs font-bold">Late Reg.</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={firstPenalty} onChange={(e) => setFirstPenalty(e.target.checked)} className="accent-orange-600" />
                     <span className="text-xs font-bold">1st Inst.</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={secondPenalty} onChange={(e) => setSecondPenalty(e.target.checked)} className="accent-orange-600" />
                     <span className="text-xs font-bold">2nd Inst.</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={thirdPenalty} onChange={(e) => setThirdPenalty(e.target.checked)} className="accent-orange-600" />
                     <span className="text-xs font-bold">3rd Inst.</span>
                   </label>
                </div>
             </section>

          </div>

          {/* Right Panel: Installment Summary */}
          <aside className="lg:col-span-5 space-y-6">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl sticky top-32 animate-slide-up">
                <header className="mb-8">
                  <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2 block">Payment Summary</span>
                  <h2 className="text-4xl font-black tracking-tight tabular-nums">
                     ৳ {result ? result.total.toLocaleString() : "0"}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">Total Payable Amount</p>
                </header>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Base Fee (Tuition + Reg)</span>
                      <span className="font-bold">৳ {result?.totalBaseFee.toLocaleString() || "0"}</span>
                   </div>
                   {(result?.firstRetakeDiscount || 0) > 0 && (
                     <div className="flex justify-between items-center text-sm text-green-400">
                        <span className="font-medium">1st Retake Discount (50%)</span>
                        <span className="font-bold">- ৳ {result?.firstRetakeDiscount.toLocaleString()}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-xs opacity-60">
                      <span>Eligible for Waiver/Scholarship</span>
                      <span>৳ {result?.eligibleForDiscount.toLocaleString() || "0"}</span>
                   </div>
                   {(result?.waiverAndScholarshipAmount || 0) > 0 && (
                     <div className="flex justify-between items-center text-sm text-green-400 bg-green-900/20 p-2 -mx-2 rounded">
                        <span className="font-bold">Waiver & Scholarship</span>
                        <span className="font-bold">- ৳ {result?.waiverAndScholarshipAmount.toLocaleString()}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2">
                      <span className="text-slate-300 font-medium">Net Tuition & Reg</span>
                      <span className="font-bold">৳ {result?.netTuitionAndReg.toLocaleString() || "0"}</span>
                   </div>
                   {((result?.extras || 0) + (result?.penalties || 0)) > 0 && (
                     <div className="flex justify-between items-center text-sm text-orange-300">
                        <span className="font-medium">Extras & Fines</span>
                        <span className="font-bold">+ ৳ {((result?.extras || 0) + (result?.penalties || 0)).toLocaleString()}</span>
                     </div>
                   )}
                </div>

                <div className="border-t border-white/10 pt-6">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Installment Breakdown</h4>
                   <div className="space-y-3">
                      <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5 hover:border-orange-500/50 transition-colors">
                         <div>
                            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">1st Installment</div>
                            <div className="text-[10px] text-slate-400">40% Net Tuition/Reg + Extras</div>
                         </div>
                         <div className="text-lg font-black">৳ {result?.inst1.toLocaleString() || "0"}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5 hover:border-orange-500/50 transition-colors">
                         <div>
                            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">2nd Installment</div>
                            <div className="text-[10px] text-slate-400">30% Net Tuition/Reg</div>
                         </div>
                         <div className="text-lg font-black">৳ {result?.inst2.toLocaleString() || "0"}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5 hover:border-orange-500/50 transition-colors">
                         <div>
                            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">3rd Installment</div>
                            <div className="text-[10px] text-slate-400">30% Net Tuition/Reg</div>
                         </div>
                         <div className="text-lg font-black">৳ {result?.inst3.toLocaleString() || "0"}</div>
                      </div>
                      {(result?.inst4 || 0) > 0 && (
                        <div className="bg-red-500/10 rounded-xl p-4 flex justify-between items-center border border-red-500/20">
                           <div>
                              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Post-Trimester Dues</div>
                              <div className="text-[10px] text-red-300/70">3rd Inst. Penalty</div>
                           </div>
                           <div className="text-lg font-black text-red-400">৳ {result?.inst4.toLocaleString()}</div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </aside>

        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-center border-t border-slate-200/60 dark:border-white/5 mt-12">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-600">
          Integrated Academic Management Tool. Designed for precision and ease of use.
        </p>
      </footer>
    </div>
  );
}
