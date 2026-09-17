import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="h-7 bg-transparent py-0 pl-1 pr-6 text-xs font-medium text-slate-700 cursor-pointer flex items-center min-w-[80px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label}</span>
        <svg className={`w-3.5 h-3.5 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
          {options.map(opt => (
            <div 
              key={opt.value}
              className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${value === opt.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [caseStatusFilter, setCaseStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', desc: '' });

  const [patients, setPatients] = useState([
    {
      id: 'P-1021', name: 'Rahul Deshmukh', age: '32', gender: 'Male', blood: 'B+',
      weight: '68 kg', address: 'Pune, MH', contact: '+91 98765 43210',
      cases: '3 Cases', active: true, date: '06 Jul 2026'
    },
    {
      id: 'P-1022', name: 'Anita Shah', age: '35', gender: 'Female', blood: 'O+',
      weight: '54 kg', address: 'Mumbai, MH', contact: '+91 97654 32142',
      cases: '2 Cases', active: true, date: '12 Jul 2026'
    },
    {
      id: 'P-1023', name: 'Rohan Patil', age: '28', gender: 'Male', blood: 'A+',
      weight: '72 kg', address: 'Thane, MH', contact: '+91 99876 54318',
      cases: '1 Case', active: true, date: '18 Aug 2026'
    },
    {
      id: 'P-1024', name: 'Sneha Kulkarni', age: '51', gender: 'Female', blood: 'AB+',
      weight: '61 kg', address: 'Nashik, MH', contact: '+91 96543 21664',
      cases: '4 Cases', active: true, date: '21 Jun 2026'
    },
    {
      id: 'P-1025', name: 'Arjun Deshmukh', age: '46', gender: 'Male', blood: 'A-',
      weight: '76 kg', address: 'Nagpur, MH', contact: '+91 98765 43275',
      cases: '2 Cases', active: true, date: '28 Aug 2026'
    },
    {
      id: 'P-1026', name: 'Priya Nair', age: '29', gender: 'Female', blood: 'O-',
      weight: '58 kg', address: 'Pune, MH', contact: '+91 98234 56789',
      cases: '2 Cases', active: true, date: '02 Sep 2026'
    },
    {
      id: 'P-1027', name: 'Vikram Sen', age: '62', gender: 'Male', blood: 'AB-',
      weight: '81 kg', address: 'Navi Mumbai, MH', contact: '+91 97123 45678',
      cases: '5 Cases', active: true, date: '14 Sep 2026'
    }
  ]);

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
    setIsDrawerOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setBloodFilter('ALL');
    setGenderFilter('ALL');
    setCaseStatusFilter('ALL');
    setDateFilter('ALL');
  };

  const handleNewPatientSubmit = (e) => {
    e.preventDefault();
    
    const name = e.target.formFullName.value.trim();
    const age = e.target.formAge.value.trim();
    const gender = e.target.formGender.value;
    const blood = e.target.formBloodGroup.value;
    const contact = e.target.formContact.value.trim();
    const weight = e.target.formWeight.value.trim();
    const address = e.target.formAddress.value.trim();
    
    const newPatient = {
      id: 'P-1028',
      name,
      age,
      gender,
      blood,
      weight: weight ? weight + ' kg' : '-',
      address: address || '-',
      contact,
      cases: '0 Cases',
      active: false,
      date: 'Today'
    };

    setPatients([newPatient, ...patients]);
    setIsModalOpen(false);
    
    setToastMessage({ title: 'Patient Record Created', desc: 'P-1028 (' + name + ') registered successfully.' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = !query || p.id.toLowerCase().includes(query) || p.name.toLowerCase().includes(query) || p.contact.toLowerCase().includes(query);
    const matchesBlood = bloodFilter === 'ALL' || p.blood === bloodFilter;
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;
    
    let matchesCase = true;
    if (caseStatusFilter === 'ACTIVE') matchesCase = p.active;
    if (caseStatusFilter === 'NO_ACTIVE') matchesCase = !p.active;
    
    return matchesQuery && matchesBlood && matchesGender && matchesCase;
  });

  return (
    <div className="space-y-6 flex-1 max-w-7xl w-full mx-auto pb-10">
      {/* 1. Page Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">Patients</h1>
          <p className="text-xs text-slate-500 mt-1">Manage patient records and access associated cases.</p>
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0d9488] hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2" 
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
            <span>+ New Patient</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Patients</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">1,248</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">All registered patients</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 shadow-sm">
            <svg className="w-4 h-4 text-teal-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Patients</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">86</div>
            <div className="text-[11px] text-teal-600 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Patients with active cases
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
            <svg className="w-4 h-4 text-emerald-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Today</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">12</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">New patient records today</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-sm">
            <svg className="w-4 h-4 text-sky-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect height="18" rx="2" width="18" x="3" y="4"></rect><path d="M3 10h18"></path><path d="M10 14h4"></path><path d="M12 12v4"></path></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Cases</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">18</div>
            <div className="text-[11px] text-amber-600/80 mt-1 font-medium">Cases awaiting review</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
            <svg className="w-4 h-4 text-amber-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect height="4" rx="1" width="8" x="8" y="2"></rect><path d="M12 11v4"></path><path d="M12 15h2"></path></svg>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all" 
              placeholder="Search by patient name, ID, phone number, city, or case ID..." 
              type="text" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" 
                type="button"
              >
                <svg className="w-3.5 h-3.5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            )}
          </div>
          <div className="flex items-center justify-end shrink-0">
            <button 
              onClick={clearFilters}
              className="h-9 px-3 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm" 
              type="button"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18"></path><path d="M7 12h10"></path><path d="M10 18h4"></path></svg>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Blood:</span>
            <CustomSelect 
              value={bloodFilter} 
              onChange={setBloodFilter} 
              options={[
                { value: 'ALL', label: 'All Groups' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gender:</span>
            <CustomSelect 
              value={genderFilter} 
              onChange={setGenderFilter} 
              options={[
                { value: 'ALL', label: 'All Genders' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Case Status:</span>
            <CustomSelect 
              value={caseStatusFilter} 
              onChange={setCaseStatusFilter} 
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Case' },
                { value: 'NO_ACTIVE', label: 'No Active Case' }
              ]} 
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered:</span>
            <CustomSelect 
              value={dateFilter} 
              onChange={setDateFilter} 
              options={[
                { value: 'ALL', label: 'All Time' },
                { value: 'TODAY', label: 'Today' },
                { value: 'WEEK', label: 'This Week' },
                { value: 'MONTH', label: 'This Month' }
              ]} 
            />
          </div>
        </div>
      </div>

      {/* 4. Patient Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Patient ID</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Patient Name</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Age</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Gender</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Blood</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Weight</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Address</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Contact</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Cases</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPatients.map(patient => (
                <tr 
                  key={patient.id}
                  onClick={() => handleRowClick(patient)}
                  className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-teal-700 whitespace-nowrap">{patient.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{patient.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{patient.age} yrs</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{patient.gender}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block bg-slate-100 text-slate-700 font-semibold font-mono text-[11px] px-2 py-0.5 rounded">{patient.blood}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{patient.weight}</td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap truncate max-w-[140px]">{patient.address}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{patient.contact}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800">{patient.cases}</span>
                      {patient.active && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold px-1.5 py-0.5 rounded">Active</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">{patient.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No patients found matching your search</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">There are no records matching the specified criteria. Try resetting the query or removing filters.</p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              <span>Clear search and filters</span>
            </button>
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-semibold text-slate-800">{filteredPatients.length}</span> of <span className="font-mono font-semibold text-slate-800">1,248</span> registered patients
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed text-xs font-medium" disabled>Previous</button>
            <span className="px-2 font-mono text-xs text-slate-700">Page 1 of 179</span>
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Patient Profile Drawer */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-opacity duration-200 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsDrawerOpen(false)}
      ></div>
      <aside 
        className={`fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
              {selectedPatient ? selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : ''}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{selectedPatient?.name}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60">{selectedPatient?.id}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedPatient?.age} yrs · {selectedPatient?.gender} · Blood Group {selectedPatient?.blood}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Phone Contact</span>
              <span className="font-mono text-xs text-slate-800 font-medium">{selectedPatient?.contact}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Registration Date</span>
              <span className="font-mono text-xs text-slate-800 font-medium">{selectedPatient?.date}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Active Case</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">In AI Analysis</span>
            </div>
            <div className="border border-slate-200/80 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900">Case #CAS-2026-0894</span>
                  <p className="text-[11px] text-slate-400">Peripheral Blood Smear (100x Oil Immersion)</p>
                </div>
                <button className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded text-xs font-semibold transition-colors">
                  Open Smear
                </button>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-teal-600"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
                  <span>AI Morphological Differential</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block">Normocytes</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">84.2%</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block">Hypochromic</span>
                    <span className="font-mono font-bold text-amber-600 text-xs">11.8%</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block">Target Cells</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">4.0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">Case History & Reports</span>
            <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
              <div className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m9 15 2 2 4-4"></path></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">CAS-2026-0412 · Complete Hemogram</span>
                    <span className="text-[11px] text-slate-400">Verified by Dr. Evelyn Vance · 14 May 2026</span>
                  </div>
                </div>
                <span className="text-xs text-teal-700 font-semibold cursor-pointer hover:underline">Download PDF</span>
              </div>
              <div className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m9 15 2 2 4-4"></path></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">CAS-2025-1108 · Routine Smear AI Screen</span>
                    <span className="text-[11px] text-slate-400">Verified by Dr. Evelyn Vance · 20 Nov 2025</span>
                  </div>
                </div>
                <span className="text-xs text-teal-700 font-semibold cursor-pointer hover:underline">Download PDF</span>
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Clinical Indication / Lab Notes</span>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-xs leading-relaxed">
              Referred for mild fatigue and pallor examination. High-magnification blood film prepared via Wright-Giemsa staining. Standard RBC indices differential scheduled.
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2.5">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors" 
            type="button"
          >
            Close Drawer
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
            <span>Create New Case For Patient</span>
          </button>
        </div>
      </aside>

      {/* New Patient Modal */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden transform transition-all duration-200 ${isModalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Register New Patient</h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">Auto ID: P-1028</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Create clinical laboratory patient record</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" 
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          
          <form onSubmit={handleNewPatientSubmit} className="px-6 pb-6 pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient ID</label>
                <input className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-xs cursor-not-allowed" disabled type="text" value="P-1028" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input name="formFullName" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" required type="text" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Age (Yrs) <span className="text-rose-500">*</span></label>
                <input name="formAge" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" max="120" min="0" required type="number" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender <span className="text-rose-500">*</span></label>
                <select name="formGender" className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" required defaultValue="">
                  <option disabled value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Blood <span className="text-rose-500">*</span></label>
                <select name="formBloodGroup" className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" required defaultValue="">
                  <option disabled value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Weight (kg)</label>
                <input name="formWeight" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" max="300" min="1" type="number" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Number <span className="text-rose-500">*</span></label>
                <input name="formContact" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" required type="tel" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input name="formEmail" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" type="email" />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address / City</label>
              <input name="formAddress" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" type="text" />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinical Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea name="formNotes" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600" rows="2"></textarea>
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors" 
                type="button"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5" type="submit">
                <svg className="w-3.5 h-3.5" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Create Patient Record</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs transform transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
        </div>
        <div>
          <div className="font-semibold">{toastMessage.title}</div>
          <div className="text-slate-400 text-[11px]">{toastMessage.desc}</div>
        </div>
      </div>
    </div>
  );
}
