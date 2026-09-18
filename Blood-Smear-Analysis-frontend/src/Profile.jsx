import React, { useState } from 'react';

// ─── Field Row ─────────────────────────────────────────────────────────────────
const FieldRow = ({ label, value, editing, onChange, wide }) => (
  <div className={`flex items-start gap-2 ${wide ? 'col-span-2' : ''}`}>
    <span className="w-40 text-[11px] text-slate-400 font-medium shrink-0 pt-0.5">{label}</span>
    {editing ? (
      <input
        className="flex-1 text-xs text-slate-800 font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-slate-50"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    ) : (
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    )}
  </div>
);

// ─── Info Card ─────────────────────────────────────────────────────────────────
const InfoCard = ({ icon, title, children, onEdit, editLabel = 'Edit' }) => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-[18px] text-slate-600">{icon}</span>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {onEdit && (
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
          onClick={onEdit}
          type="button"
        >
          <span className="material-symbols-outlined text-[13px]">edit</span>{editLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

// ─── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ title, fields, onSave, onClose }) => {
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.value])));
  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" onClick={onClose} type="button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-slate-50"
                  value={vals[f.key]}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                >
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-slate-50"
                  type={f.type || 'text'}
                  value={vals[f.key]}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-2">
          <button className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition" onClick={onClose} type="button">Cancel</button>
          <button
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0d9488] hover:bg-teal-700 rounded-lg transition shadow-sm flex items-center gap-1.5"
            onClick={() => { onSave(vals); onClose(); }}
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">save</span>Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Profile Component ────────────────────────────────────────────────────
export default function Profile() {
  const [personal, setPersonal] = useState({
    name: 'Dr. Shriya Kulkarni',
    email: 'shriya.kulkarni@cellinsightlab.com',
    phone: '+91 81495 91740',
    dob: '12 Mar 1990',
    gender: 'Female',
    address: 'Pune, Maharashtra, India',
    department: 'Pathology',
    empId: 'PATH-001',
    joining: '15 Jan 2025',
  });

  const [professional, setProfessional] = useState({
    qualification: 'MD Pathology',
    specialization: 'Hematology',
    regNo: 'MH-PATH-45871',
    institution: 'AISSMS IOIT, Pune',
    experience: '2+ Years',
  });

  const [editModal, setEditModal] = useState(null); // 'personal' | 'professional' | null

  return (
    <>
      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">My Profile</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your personal information and professional details.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
            onClick={() => setEditModal('personal')}
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>Edit Profile
          </button>
        </div>

        {/* ── Hero Card ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-teal-50 text-teal-700 font-bold text-2xl flex items-center justify-center shrink-0 border-2 border-teal-100 shadow-sm">
              SK
            </div>
            {/* Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="inline-block px-3 py-0.5 text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60">
                Pathologist
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{personal.name}</h2>
              <p className="text-xs text-slate-500 font-medium">
                Pathologist <span className="mx-2 text-slate-300">|</span> ID: {personal.empId}
              </p>
              <div className="flex flex-wrap items-center gap-5 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                  <span>{personal.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                  <span>{personal.phone}</span>
                </div>
              </div>
            </div>
            {/* Status chip */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                Active Account
              </span>
            </div>
          </div>
        </div>

        {/* ── Two Column Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Personal Information */}
            <InfoCard icon="person" title="Personal Information" onEdit={() => setEditModal('personal')}>
              <div className="space-y-3 text-xs">
                {[
                  ['Full Name', personal.name],
                  ['Email', personal.email],
                  ['Phone', personal.phone],
                  ['Date of Birth', personal.dob],
                  ['Gender', personal.gender],
                  ['Address', personal.address],
                  ['Department', personal.department],
                  ['Employee ID', personal.empId],
                  ['Joining Date', personal.joining],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="w-36 text-slate-400 font-medium shrink-0">{k}</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </InfoCard>

            {/* Account Information */}
            <InfoCard icon="shield" title="Account Information">
              <div className="space-y-3 text-xs">
                {[
                  ['Role', 'Pathologist'],
                  ['Last Login', '18 Sep 2026, 10:14 AM'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="w-36 text-slate-400 font-medium shrink-0">{k}</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2">
                  <span className="w-36 text-slate-400 font-medium shrink-0">Account Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Active
                  </span>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Professional Information */}
            <InfoCard icon="work" title="Professional Information" onEdit={() => setEditModal('professional')}>
              <div className="space-y-3 text-xs">
                {[
                  ['Qualification', professional.qualification],
                  ['Specialization', professional.specialization],
                  ['Medical Reg. No.', professional.regNo],
                  ['Institution', professional.institution],
                  ['Years of Experience', professional.experience],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="w-44 text-slate-400 font-medium shrink-0">{k}</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </InfoCard>

            {/* Digital Signature */}
            <InfoCard icon="draw" title="Digital Signature" onEdit={() => {}} editLabel="Update">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Signature Preview */}
                <div className="h-28 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-4">
                  <span
                    style={{ fontFamily: "'Caveat', cursive", fontSize: '1.8rem', color: '#1e3a5f', transform: 'rotate(-2deg)', display: 'block' }}
                    className="select-none tracking-wide"
                  >
                    Shriya Kulkarni
                  </span>
                </div>
                {/* Upload Box */}
                <div className="h-28 border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center group">
                  <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-teal-600 transition-colors mb-1">upload_file</span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-teal-800">Upload Signature</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG (Max 2 MB)</span>
                </div>
              </div>
              {/* Status */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="leading-tight">
                  <span className="text-slate-700 font-semibold">Signature uploaded</span>
                  <span className="text-slate-400 block text-[11px]">Last updated on 10 Jan 2025</span>
                </div>
              </div>
            </InfoCard>

            {/* Notice Banner */}
            <div className="bg-sky-50 border border-sky-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-800">
              <span className="material-symbols-outlined text-[18px] text-sky-600 mt-0.5 shrink-0">info</span>
              <p className="leading-relaxed">
                Your information is used for report signatory, identification and official communication within CellInsight Lab.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Personal Modal ───────────────────────────────────────────────── */}
      {editModal === 'personal' && (
        <EditModal
          title="Edit Personal Information"
          fields={[
            { key: 'name',       label: 'Full Name',    value: personal.name },
            { key: 'email',      label: 'Email',        value: personal.email, type: 'email' },
            { key: 'phone',      label: 'Phone',        value: personal.phone },
            { key: 'dob',        label: 'Date of Birth',value: personal.dob },
            { key: 'gender',     label: 'Gender',       value: personal.gender, type: 'select', options: ['Female', 'Male', 'Other'] },
            { key: 'address',    label: 'Address',      value: personal.address },
            { key: 'department', label: 'Department',   value: personal.department },
          ]}
          onSave={vals => setPersonal(p => ({ ...p, ...vals }))}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* ── Edit Professional Modal ───────────────────────────────────────────── */}
      {editModal === 'professional' && (
        <EditModal
          title="Edit Professional Information"
          fields={[
            { key: 'qualification',  label: 'Qualification',          value: professional.qualification },
            { key: 'specialization', label: 'Specialization',          value: professional.specialization },
            { key: 'regNo',          label: 'Medical Registration No.', value: professional.regNo },
            { key: 'institution',    label: 'Institution',             value: professional.institution },
            { key: 'experience',     label: 'Years of Experience',     value: professional.experience },
          ]}
          onSave={vals => setProfessional(p => ({ ...p, ...vals }))}
          onClose={() => setEditModal(null)}
        />
      )}
    </>
  );
}
