
import React, { useState, useRef } from 'react';
import { AppTab, Machine, SystemFlow } from '../types';
import { extractMachineDetails, getDetailedMachineSpecs, generateMachineryImage } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface MachinesListProps {
  onNavigate: (tab: AppTab) => void;
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
}

const MachinesList: React.FC<MachinesListProps> = ({ onNavigate, machines, setMachines }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isFetchingSpecs, setIsFetchingSpecs] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [newMachine, setNewMachine] = useState({ id: '', name: '', make: '', type: '' });
  const [activeSpecTab, setActiveSpecTab] = useState<Record<string, string>>({});
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [generatingDiagram, setGeneratingDiagram] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateHours = (machineId: string, hours: number) => {
    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, hours } : m));
  };

  const handleGenerateDiagram = async (machine: Machine, system: SystemFlow) => {
    const diagramId = `${machine.id}-${system.systemName}`;
    setGeneratingDiagram(diagramId);
    
    try {
      const prompt = `Detailed professional technical schematic diagram of the ${system.systemName} for a ${machine.make} ${machine.name} heavy machinery. Include labels for components like ${system.components.slice(0, 5).join(', ')}. Engineering blueprint style, clean white background, high detail.`;
      const imageUrl = await generateMachineryImage(prompt, '16:9', '1K');
      
      if (imageUrl) {
        setMachines(prev => prev.map(m => {
          if (m.id === machine.id && m.specs) {
            const updatedFlow = m.specs.internalSystemsFlow?.map(f => 
              f.systemName === system.systemName ? { ...f, diagramUrl: imageUrl } : f
            );
            return { ...m, specs: { ...m.specs, internalSystemsFlow: updatedFlow } };
          }
          return m;
        }));
      }
    } catch (err) {
      alert("Nimeshindwa kutengeneza mchoro. Jaribu tena.");
    } finally {
      setGeneratingDiagram(null);
    }
  };

  const handleRefreshSpecs = async (m: Machine) => {
    setIsRefreshing(m.id);
    try {
      const detailedSpecs = await getDetailedMachineSpecs(m.make, m.name);
      if (detailedSpecs) {
        setMachines(prev => prev.map(x => x.id === m.id ? { ...x, specs: detailedSpecs } : x));
      } else {
        alert("Nimeshindwa kupata taarifa. Hakikisha una internet.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(null);
    }
  };

  const handleNameplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const details = await extractMachineDetails(base64);
        if (details) {
          setNewMachine({
            id: details.id || newMachine.id,
            make: details.make || newMachine.make,
            name: details.name || newMachine.name,
            type: details.type || newMachine.type
          });
        } else {
          setScanError("Sikuweza kusoma plate hii. Jaribu picha ya wazi.");
        }
      } catch (err) {
        setScanError("Hitilafu ya mtandao. Jaribu tena.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachine.id || !newMachine.name || !newMachine.make) return;

    setIsFetchingSpecs(true);
    try {
      const detailedSpecs = await getDetailedMachineSpecs(newMachine.make, newMachine.name);

      const machineToAdd: Machine = {
        id: newMachine.id.toUpperCase(),
        name: newMachine.name,
        make: newMachine.make,
        type: newMachine.type || 'General Machinery',
        status: 'Healthy',
        hours: 0,
        lastService: new Date().toISOString().split('T')[0],
        specs: detailedSpecs || undefined
      };

      setMachines([machineToAdd, ...machines]);
      setNewMachine({ id: '', name: '', make: '', type: '' });
      setIsModalOpen(false);
    } catch (err) {
      alert("Nimeshindwa kupata maelezo. Jaribu tena.");
    } finally {
      setIsFetchingSpecs(false);
    }
  };

  const exportMachineToPDF = async (machine: Machine) => {
    setIsExporting(machine.id);
    
    try {
      const doc = new jsPDF() as any;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(234, 179, 8); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('DR. MITAMBO AI', 15, 20);
      
      doc.setFontSize(10);
      doc.text('TECHNICAL SPECIFICATION REPORT', 15, 30);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, 30, { align: 'right' });

      let currentY = 50;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MACHINE OVERVIEW', 15, currentY);
      currentY += 10;
      
      const overviewData = [
        ['Make / Manufacturer', machine.make],
        ['Model / Series', machine.name],
        ['Machine ID (S/N)', machine.id],
        ['Category / Type', machine.type],
        ['CURRENT OPERATING HOURS', `${machine.hours} hrs`],
        ['Current Status', machine.status],
      ];
      
      doc.autoTable({
        startY: currentY,
        head: [['Field', 'Value']],
        body: overviewData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;

      if (machine.specs) {
        // Internal Systems Flow with Diagrams
        machine.specs.internalSystemsFlow?.forEach((sys, idx) => {
          if (currentY > 200) { doc.addPage(); currentY = 20; }
          doc.setFontSize(12);
          doc.setTextColor(126, 34, 206); // Purple
          doc.text(`SYSTEM: ${sys.systemName}`, 15, currentY);
          currentY += 8;
          
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          const splitDescription = doc.splitTextToSize(sys.description, pageWidth - 30);
          doc.text(splitDescription, 15, currentY);
          currentY += (splitDescription.length * 5) + 5;

          if (sys.diagramUrl) {
            try {
              doc.addImage(sys.diagramUrl, 'PNG', 15, currentY, 180, 100);
              currentY += 110;
            } catch (e) {
              console.error("PDF Image add error", e);
            }
          }
        });
      }

      doc.save(`Report_${machine.make}_${machine.name}_${machine.id}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Imeshindwa kutengeneza PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  const SpecTabButton = ({ machineId, tabId, label, isSpecial, colorClass }: { machineId: string, tabId: string, label: string, isSpecial?: boolean, colorClass?: string }) => (
    <button 
      onClick={() => setActiveSpecTab(prev => ({ ...prev, [machineId]: tabId }))}
      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
        (activeSpecTab[machineId] || 'engine') === tabId 
        ? colorClass || 'bg-yellow-500 text-black border-yellow-500' 
        : 'bg-white/5 text-gray-400 border-white/10 hover:border-yellow-500/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Fleet <span className="text-yellow-500">Manager</span></h1>
          <p className="text-gray-400 text-sm italic">Usimamizi wa mitambo ya kitaalam.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setScanError(null); }}
          className="bg-yellow-500 text-black px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-500/20 active:scale-95 transition-all"
        >
          SAJILI MTAMBO MPYA
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-24 flex flex-col items-center justify-center text-center opacity-40">
           <svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
           <h2 className="text-2xl font-black uppercase italic tracking-tighter">Fleet Empty</h2>
        </div>
      ) : (
        <div className="space-y-6">
          {machines.map((m) => (
            <div key={m.id} className="bg-neutral-900 border border-white/5 rounded-[40px] overflow-hidden group shadow-lg transition-all">
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center border border-white/10 text-yellow-500 group-hover:border-yellow-500/50 transition-all">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none">{m.make} {m.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">{m.id}</span>
                       <span className="text-[10px] text-gray-500 font-bold uppercase">{m.hours} HRS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setExpandedMachine(expandedMachine === m.id ? null : m.id)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${expandedMachine === m.id ? 'bg-yellow-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <svg className={`w-4 h-4 transition-transform ${expandedMachine === m.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    Taarifa & Elimu
                  </button>
                  <button onClick={() => setMachines(prev => prev.filter(x => x.id !== m.id))} className="p-3.5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>

              {expandedMachine === m.id && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="border-t border-white/5 pt-8">
                    {/* Reporting Config Header */}
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                          <div className="flex flex-col gap-1.5 flex-1">
                             <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Masaa ya Sasa (Current Hours)</label>
                             <div className="relative">
                               <input 
                                 type="number" 
                                 value={m.hours} 
                                 onChange={(e) => handleUpdateHours(m.id, parseInt(e.target.value) || 0)}
                                 className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs font-black focus:border-yellow-500 outline-none"
                                 placeholder="Weka masaa ya sasa..."
                               />
                               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600">HRS</span>
                             </div>
                          </div>
                          <div className="hidden md:block h-10 w-px bg-white/10"></div>
                       </div>
                       <button 
                         onClick={() => exportMachineToPDF(m)} 
                         disabled={isExporting === m.id} 
                         className="w-full md:w-auto bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10 disabled:opacity-50"
                       >
                         {isExporting === m.id ? 'GENERATING PDF...' : 'TOA RIPORTI (PDF)'}
                       </button>
                    </div>

                    {m.specs ? (
                      <>
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                          <SpecTabButton machineId={m.id} tabId="engine" label="Injini" />
                          <SpecTabButton machineId={m.id} tabId="internalSystems" label="Mifumo ya Ndani (Flow & Michoro)" isSpecial colorClass="bg-purple-600 text-white border-purple-600" />
                          <SpecTabButton machineId={m.id} tabId="education" label="Elimu ya Mifumo" isSpecial colorClass="bg-blue-600 text-white border-blue-600" />
                          <SpecTabButton machineId={m.id} tabId="guide" label="Uendeshaji & Alama" isSpecial colorClass="bg-green-600 text-white border-green-600" />
                          <SpecTabButton machineId={m.id} tabId="filters" label="Filters" colorClass="bg-orange-500 text-white border-orange-500" />
                          <SpecTabButton machineId={m.id} tabId="lube" label="Vilainishi" />
                          <SpecTabButton machineId={m.id} tabId="service" label="Service" />
                        </div>

                        <div className="bg-black/40 rounded-[32px] p-8 border border-white/5 shadow-inner min-h-[200px]">
                          {(() => {
                            const tab = activeSpecTab[m.id] || 'engine';
                            switch (tab) {
                              case 'engine': return <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap font-medium">{m.specs?.engine}</p>;
                              
                              case 'internalSystems': return (
                                <div className="space-y-16">
                                   {m.specs?.internalSystemsFlow?.map((sys, idx) => (
                                      <div key={idx} className="relative">
                                         <div className="flex items-center gap-4 mb-8">
                                            <div className="bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{sys.systemName}</div>
                                            <div className="flex-1 h-px bg-white/10"></div>
                                         </div>
                                         
                                         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                            <div className="xl:col-span-4 space-y-6">
                                               <div>
                                                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest italic">Flow ya Vipengele:</h4>
                                                  <div className="space-y-2">
                                                     {sys.components.map((comp, ci) => (
                                                        <div key={ci} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 group">
                                                           <span className="text-purple-500 font-black text-[10px] w-5">{ci + 1}.</span>
                                                           <span className="text-xs font-bold text-gray-200">{comp}</span>
                                                        </div>
                                                     ))}
                                                  </div>
                                               </div>
                                               <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                                  <h4 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest italic">Ufafanuzi:</h4>
                                                  <p className="text-xs text-gray-300 leading-relaxed font-medium">{sys.description}</p>
                                               </div>
                                            </div>
                                            
                                            <div className="xl:col-span-8">
                                               <div className="bg-black rounded-[40px] border border-white/5 overflow-hidden relative group min-h-[300px] flex flex-col">
                                                  {sys.diagramUrl ? (
                                                    <>
                                                      <img src={sys.diagramUrl} className="w-full h-auto object-contain" alt="Technical Diagram" />
                                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                                         <button 
                                                            onClick={() => {
                                                              const link = document.createElement('a');
                                                              link.href = sys.diagramUrl!;
                                                              link.download = `${m.make}_${m.name}_${sys.systemName}_Schematic.png`;
                                                              link.click();
                                                            }}
                                                            className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                                         >
                                                            Download Picha
                                                         </button>
                                                         <button 
                                                            onClick={() => handleGenerateDiagram(m, sys)}
                                                            className="bg-purple-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                                         >
                                                            Tengeneza Tena
                                                         </button>
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                                       <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mb-4 text-purple-500">
                                                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                       </div>
                                                       <h4 className="text-xs font-black uppercase text-gray-400">Mchoro wa {sys.systemName}</h4>
                                                       <p className="text-[10px] text-gray-600 mt-2 max-w-xs mb-6 italic">Bonyeza hapa chini AI itengeneze mchoro wa kiufundi wa mfumo huu kwa mwanzo hadi mwisho.</p>
                                                       <button 
                                                         onClick={() => handleGenerateDiagram(m, sys)}
                                                         disabled={generatingDiagram === `${m.id}-${sys.systemName}`}
                                                         className="bg-purple-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50"
                                                       >
                                                         {generatingDiagram === `${m.id}-${sys.systemName}` ? 'INACHORA (AI)...' : 'TENGENEZA MCHORO'}
                                                       </button>
                                                    </div>
                                                  )}
                                               </div>
                                            </div>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                              );

                              case 'education': return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                      <h4 className="text-[10px] font-black text-blue-400 uppercase mb-3 tracking-widest">Mfumo wa Injini & Mafuta</h4>
                                      <p className="text-xs text-gray-400 leading-relaxed italic">{m.specs?.systemsEducation?.engineDetails}</p>
                                   </div>
                                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                      <h4 className="text-[10px] font-black text-blue-400 uppercase mb-3 tracking-widest">Hydraulic Systems</h4>
                                      <p className="text-xs text-gray-400 leading-relaxed italic">{m.specs?.systemsEducation?.hydraulicDetails}</p>
                                   </div>
                                </div>
                              );

                              case 'guide': return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {m.specs?.operationGuide?.symbolsAndAlerts.map((s, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase text-white mb-1">{s.symbol}</p>
                                        <p className="text-[10px] text-gray-500 italic leading-tight">{s.meaning}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                              
                              case 'filters': return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {m.specs?.filters?.map((f, i) => (
                                      <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-start gap-4">
                                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                                        </div>
                                        <div>
                                          <span className="text-xs font-black uppercase text-white truncate block">{f.name} (x{f.quantity})</span>
                                          <p className="text-[10px] text-gray-500 italic mt-1">{f.location}</p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              );
                              
                              case 'lube': return (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-[11px]">
                                    <thead>
                                      <tr className="border-b border-white/10 text-gray-500 uppercase font-black">
                                        <th className="py-3">Component</th>
                                        <th className="py-3">Oil Type</th>
                                        <th className="py-3 text-right">Qty</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {m.specs?.lubricants?.map((l, i) => (
                                        <tr key={i} className="border-b border-white/5">
                                          <td className="py-4 font-bold text-gray-200">{l.component}</td>
                                          <td className="py-4 text-yellow-500/80">{l.type}</td>
                                          <td className="py-4 text-right font-black text-white">{l.quantity}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );

                              case 'service': return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {m.specs?.serviceSchedule?.map((s, i) => (
                                    <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Baada ya {s.hours}</span>
                                      <div className="flex flex-wrap gap-2 mt-3 mb-3">
                                        {s.components?.map((c, ci) => <span key={ci} className="text-[9px] bg-black px-2.5 py-1 rounded-lg border border-white/10 text-gray-300 font-bold">{c}</span>)}
                                      </div>
                                      <p className="text-[10px] text-gray-500 italic leading-relaxed">{s.description}</p>
                                    </div>
                                  ))}
                                </div>
                              );
                              default: return null;
                            }
                          })()}
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[32px] p-12 text-center flex flex-col items-center">
                         <svg className="w-12 h-12 text-yellow-500 opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                         <h4 className="text-sm font-black uppercase text-gray-300">Taarifa bado hazijapatikana</h4>
                         <button 
                           onClick={() => handleRefreshSpecs(m)}
                           disabled={isRefreshing === m.id}
                           className="mt-6 bg-white/5 border border-white/10 hover:border-yellow-500 text-yellow-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                         >
                           {isRefreshing === m.id ? 'INAVUTA...' : 'VUTA TAARIFA TENA (AI REFRESH)'}
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => !isFetchingSpecs && setIsModalOpen(false)}></div>
          <div className="relative bg-neutral-900 border border-white/10 w-full max-w-lg rounded-[40px] p-10 shadow-3xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-8">Sajili <span className="text-yellow-500">Mtambo</span></h2>

            <form onSubmit={handleAddMachine} className="space-y-5">
              <div className="mb-8">
                <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleNameplateUpload}/>
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full py-6 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center group ${scanError ? 'border-red-500/50 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40'}`}>
                  {isScanning ? (
                    <span className="animate-pulse text-yellow-500 font-black text-xs uppercase">Scanning...</span>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mb-2 text-yellow-500 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                      <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Piga Picha Plate</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="S/N" value={newMachine.id} onChange={e => setNewMachine({...newMachine, id: e.target.value})} className="bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-yellow-500 outline-none" />
                <input required placeholder="Make" value={newMachine.make} onChange={e => setNewMachine({...newMachine, make: e.target.value})} className="bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-yellow-500 outline-none" />
              </div>
              <input required placeholder="Model" value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-yellow-500 outline-none" />
              
              <button 
                type="submit" 
                disabled={isFetchingSpecs}
                className="w-full bg-yellow-500 text-black py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isFetchingSpecs ? (
                  <>
                    <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>UNAVUTA ELIMU...</span>
                  </>
                ) : 'ANZA USIMAMIZI'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachinesList;
