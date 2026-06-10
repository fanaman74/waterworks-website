import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { Eyebrow } from '../components/Shared';

const STATUSES = ['New', 'Contacted', 'Quote Sent', 'Scheduled', 'Completed'];

export default function AdminCRM({ lang }) {
  const [token, setToken] = useState(sessionStorage.getItem('ww-crm-token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [noteText, setNoteText] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    message: '',
    serviceType: 'Repairs',
    status: 'New',
    notes: ''
  });
  const [newLeadErrors, setNewLeadErrors] = useState({});

  useEffect(() => {
    if (token) {
      fetchLeads();
    }
  }, [token]);

  const fetchLeads = () => {
    fetch('/api/leads', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        handleLogout();
        throw new Error('Session expired');
      }
      return res.json();
    })
    .then(data => {
      setLeads(data);
      if (data.length > 0 && !selectedLeadId) {
        setSelectedLeadId(data[0].id);
        setNoteText(data[0].notes || '');
      }
    })
    .catch(err => console.error(err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    .then(res => {
      if (!res.ok) throw new Error('Incorrect password');
      return res.json();
    })
    .then(data => {
      sessionStorage.setItem('ww-crm-token', data.token);
      setToken(data.token);
    })
    .catch(err => setLoginError(err.message));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ww-crm-token');
    setToken('');
    setLeads([]);
    setSelectedLeadId(null);
  };

  const handleUpdateStatus = (id, newStatus) => {
    fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => {
      if (res.status === 401) return handleLogout();
      return res.json();
    })
    .then(updated => {
      setLeads(leads.map(l => l.id === id ? updated : l));
    })
    .catch(err => console.error(err));
  };

  const handleSaveNotes = (id) => {
    setSaveStatus('Saving...');
    fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notes: noteText })
    })
    .then(res => {
      if (res.status === 401) return handleLogout();
      return res.json();
    })
    .then(updated => {
      setLeads(leads.map(l => l.id === id ? updated : l));
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    })
    .catch(err => {
      setSaveStatus('Error');
      console.error(err);
    });
  };

  const handleDeleteLead = (id) => {
    if (!confirm('Are you sure you want to permanently delete this lead?')) return;
    fetch(`/api/leads/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) return handleLogout();
      return res.json();
    })
    .then(() => {
      const remaining = leads.filter(l => l.id !== id);
      setLeads(remaining);
      if (remaining.length > 0) {
        setSelectedLeadId(remaining[0].id);
        setNoteText(remaining[0].notes || '');
      } else {
        setSelectedLeadId(null);
        setNoteText('');
      }
    })
    .catch(err => console.error(err));
  };

  const handleCreateLeadSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!newLeadForm.name.trim()) errs.name = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newLeadForm.email)) errs.email = true;
    setNewLeadErrors(errs);

    if (Object.keys(errs).length === 0) {
      fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLeadForm)
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create lead');
        return res.json();
      })
      .then(data => {
        fetchLeads();
        setIsCreatingLead(false);
        setSelectedLeadId(data.lead.id);
        setNoteText(data.lead.notes || '');
        setNewLeadForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          message: '',
          serviceType: 'Repairs',
          status: 'New',
          notes: ''
        });
      })
      .catch(err => {
        console.error(err);
        alert('Failed to save the new lead. Please try again.');
      });
    }
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // Filter and search
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.phone && lead.phone.toLowerCase().includes(term)) ||
      (lead.address && lead.address.toLowerCase().includes(term)) ||
      (lead.message && lead.message.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  if (!token) {
    return (
      <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="form-card" style={{ maxWidth: 400, width: '100%', padding: 40, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Eyebrow>Waterworks CRM</Eyebrow>
            <h2 style={{ marginTop: 8 }}>Admin Sign In</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Enter CRM Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={loginError ? { borderColor: 'var(--accent)' } : {}}
                required
              />
              {loginError && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: 6 }}>{loginError}</p>}
            </div>
            <button className="btn btn-accent btn-lg" type="submit" style={{ width: '100%', marginTop: 16 }}>
              Log In <Icon name="arrow" size={18} />
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: 'var(--surface-2)', minHeight: '90vh' }}>
      <div className="wrap">
        {/* Header Dashboard Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
          <div>
            <Eyebrow>Control Room</Eyebrow>
            <h1 className="hl" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '8px 0 0' }}>Waterworks Leads CRM</h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn btn-accent" 
              onClick={() => { 
                setIsCreatingLead(true); 
                setSelectedLeadId(null); 
              }}
              style={{ padding: '10px 20px', fontSize: 14.5 }}
            >
              + Add Lead
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={handleLogout}
              style={{ padding: '10px 20px', fontSize: 14.5 }}
            >
              Logout <Icon name="arrow" size={16} style={{ marginLeft: 8 }} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center', background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--line)' }}>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)' }}>
            <Icon name="search" size={18} style={{ color: 'var(--muted)' }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone, details..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 15 }}
            />
          </div>
          <div className="type-chips" style={{ margin: 0 }}>
            {['All', ...STATUSES].map(status => {
              const count = status === 'All' ? leads.length : leads.filter(l => l.status === status).length;
              return (
                <button 
                  key={status} 
                  type="button" 
                  className={'type-chip' + (statusFilter === status ? ' on' : '')} 
                  onClick={() => setStatusFilter(status)}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* CRM Layout Workspace */}
        {leads.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3>No leads captured yet</h3>
            <p style={{ color: 'var(--muted)' }}>Leads submitted via the contact form will appear here.</p>
          </div>
        ) : (
          <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: 24, alignItems: 'start' }}>
            
            {/* Left leads list */}
            <div style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 6px' }}>
              {filteredLeads.map(lead => {
                const isActive = lead.id === selectedLeadId;
                const dateStr = new Date(lead.date).toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                return (
                  <div 
                    key={lead.id}
                    onClick={() => {
                      setIsCreatingLead(false);
                      setSelectedLeadId(lead.id);
                      setNoteText(lead.notes || '');
                    }}
                    className="card"
                    style={{ 
                      cursor: 'pointer',
                      padding: 16,
                      margin: 0,
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--line)',
                      background: isActive ? 'color-mix(in srgb, var(--primary) 6%, var(--bg))' : 'var(--bg)',
                      transform: isActive ? 'translateY(-2px)' : undefined,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 16.5 }}>{lead.name}</h4>
                      <span 
                        style={{ 
                          fontSize: 11, 
                          fontWeight: 'bold', 
                          textTransform: 'uppercase', 
                          padding: '3px 8px', 
                          borderRadius: 20,
                          letterSpacing: '.05em',
                          background: lead.status === 'New' ? 'rgba(235, 87, 87, 0.15)' :
                                      lead.status === 'Contacted' ? 'rgba(47, 128, 237, 0.15)' :
                                      lead.status === 'Quote Sent' ? 'rgba(155, 81, 224, 0.15)' :
                                      lead.status === 'Scheduled' ? 'rgba(242, 201, 76, 0.15)' : 'rgba(39, 174, 96, 0.15)',
                          color: lead.status === 'New' ? '#eb5757' :
                                 lead.status === 'Contacted' ? '#2f80ed' :
                                 lead.status === 'Quote Sent' ? '#9b51e0' :
                                 lead.status === 'Scheduled' ? '#e2a300' : '#27ae60'
                        }}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--muted)' }}>
                      <span>{lead.serviceType || 'Plumbing'}</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                );
              })}
              {filteredLeads.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>No matching leads found</p>
                </div>
              )}
            </div>

            {/* Right detail panel */}
            <div>
              {isCreatingLead ? (
                <div className="card" style={{ padding: 32, margin: 0, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                  <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 20 }}>
                    <Eyebrow>New Lead Registration</Eyebrow>
                    <h2 style={{ marginTop: 6, fontSize: 28 }}>Add New Client</h2>
                  </div>
                  <form onSubmit={handleCreateLeadSubmit}>
                    <div className="field-row">
                      <div className="field">
                        <label>Client Name *</label>
                        <input 
                          type="text" 
                          value={newLeadForm.name}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                          style={newLeadErrors.name ? { borderColor: 'var(--accent)' } : {}}
                          placeholder="Wayne Pettit"
                          required
                        />
                      </div>
                      <div className="field">
                        <label>Email Address *</label>
                        <input 
                          type="email" 
                          value={newLeadForm.email}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                          style={newLeadErrors.email ? { borderColor: 'var(--accent)' } : {}}
                          placeholder="client@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Phone Number</label>
                        <input 
                          type="text" 
                          value={newLeadForm.phone}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                          placeholder="+32 ..."
                        />
                      </div>
                      <div className="field">
                        <label>Property Address</label>
                        <input 
                          type="text" 
                          value={newLeadForm.address}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, address: e.target.value })}
                          placeholder="1050 Ixelles"
                        />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Service / Job Type</label>
                        <select 
                          value={newLeadForm.serviceType}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, serviceType: e.target.value })}
                          style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line)' }}
                        >
                          <option value="Renovation">Renovation</option>
                          <option value="Repairs">Repairs</option>
                          <option value="Boiler">Boiler</option>
                          <option value="Eco">Eco / Sustainability</option>
                          <option value="General">General Plumbing</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Initial Status</label>
                        <select 
                          value={newLeadForm.status}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                          style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line)' }}
                        >
                          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Job Description / Message</label>
                      <textarea 
                        value={newLeadForm.message}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                        placeholder="Details of the quote request or plumbing issues..."
                        style={{ minHeight: 90 }}
                      ></textarea>
                    </div>
                    <div className="field" style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                      <label>Internal Plumber Notes</label>
                      <textarea 
                        value={newLeadForm.notes}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                        placeholder="Measurements, price estimates, scheduling preferences..."
                        style={{ minHeight: 90 }}
                      ></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        onClick={() => {
                          setIsCreatingLead(false);
                          if (leads.length > 0) {
                            setSelectedLeadId(leads[0].id);
                            setNoteText(leads[0].notes || '');
                          }
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-accent">
                        Save Lead Request
                      </button>
                    </div>
                  </form>
                </div>
              ) : selectedLead ? (
                <div className="card" style={{ padding: 32, margin: 0, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                  <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <Eyebrow>{selectedLead.serviceType || 'Request Details'}</Eyebrow>
                        <h2 style={{ marginTop: 6, fontSize: 28 }}>{selectedLead.name}</h2>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label style={{ fontSize: 14, fontWeight: 'bold' }}>Status:</label>
                        <select 
                          value={selectedLead.status} 
                          onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', fontSize: 14.5, fontWeight: 'bold', outline: 'none' }}
                        >
                          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <div>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Email Address</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 500 }}>
                        <a href={`mailto:${selectedLead.email}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{selectedLead.email}</a>
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Phone Number</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 500 }}>
                        {selectedLead.phone ? (
                          <a href={`tel:${selectedLead.phone}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{selectedLead.phone}</a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Property Address</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{selectedLead.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>Client Message</span>
                    <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 8, border: '1px solid var(--line)', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {selectedLead.message || 'No description provided.'}
                    </div>
                  </div>

                  {/* Internal Notes Section */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 14.5, fontWeight: 'bold' }}>Internal Plumber Notes</label>
                      {saveStatus && <span style={{ fontSize: 13, color: saveStatus === 'Error' ? 'var(--accent)' : 'var(--muted)' }}>{saveStatus}</span>}
                    </div>
                    <textarea 
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write down measurements, estimated pricing, or notes from phone conversations here..."
                      style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: 14.5, lineHeight: 1.4 }}
                    ></textarea>
                    <button 
                      className="btn btn-accent btn-sm" 
                      style={{ marginTop: 10 }}
                      onClick={() => handleSaveNotes(selectedLead.id)}
                    >
                      Save Notes
                    </button>
                  </div>

                  {/* Delete lead */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                    <button 
                      className="btn" 
                      style={{ background: 'rgba(235, 87, 87, 0.1)', color: '#eb5757', border: '1px solid rgba(235, 87, 87, 0.2)' }}
                      onClick={() => handleDeleteLead(selectedLead.id)}
                    >
                      Delete Lead Request
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <p style={{ color: 'var(--muted)' }}>Select a lead from the list to view full details.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
