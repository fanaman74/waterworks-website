import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Eyebrow } from '../components/Shared';


export default function VisitorAccount({ go }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [leads, setLeads] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageBoxes, setMessageBoxes] = useState({}); // leadId -> { open, text, sending, sent }

  const openMessageBox = (leadId) =>
    setMessageBoxes(prev => ({ ...prev, [leadId]: { open: true, text: '', sending: false, sent: false } }));

  const updateMessageBox = (leadId, patch) =>
    setMessageBoxes(prev => ({ ...prev, [leadId]: { ...prev[leadId], ...patch } }));

  const handleSendMessage = async (lead) => {
    const box = messageBoxes[lead.id];
    if (!box?.text?.trim()) return;
    updateMessageBox(lead.id, { sending: true });
    const { error } = await supabase.from('lead_messages').insert({
      lead_id: lead.id,
      from_email: user.email,
      message: box.text.trim()
    });
    if (error) {
      updateMessageBox(lead.id, { sending: false });
      alert('Could not send message. Please try again.');
    } else {
      updateMessageBox(lead.id, { sending: false, sent: true, text: '' });
      setTimeout(() => updateMessageBox(lead.id, { open: false, sent: false }), 2000);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        go('home');
        return;
      }
      const u = session.user;
      setUser(u);
      Promise.all([
        supabase.from('profiles').select('*').eq('id', u.id).single(),
        supabase.from('leads').select('*').or(`submitted_by.eq.${u.id},email.ilike.${u.email}`).order('created_at', { ascending: false })
      ]).then(([profileRes, leadsRes]) => {
        if (profileRes.error) {
          console.error('Failed to load profile:', profileRes.error.message);
        } else if (profileRes.data) {
          setProfile(profileRes.data);
          setEditForm({
            name: profileRes.data.name || '',
            phone: profileRes.data.phone || '',
            address: profileRes.data.address || ''
          });
        }
        if (leadsRes.error) {
          console.error('Failed to load leads:', leadsRes.error.message);
        } else if (leadsRes.data) {
          setLeads(leadsRes.data);
        }
        setLoading(false);
      }).catch(err => {
        console.error('Account load error:', err);
        setLoading(false);
      });
    }).catch(err => {
      console.error('Session error:', err);
      setLoading(false);
    });
  }, []); // go is stable (defined in App.jsx without useCallback but never reassigned)

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    go('home');
  };

  const handleEdit = () => {
    setEditForm({ name: profile.name || '', phone: profile.phone || '', address: profile.address || '' });
    setEditing(true);
    setSaveError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setProfile(prev => ({ ...prev, ...editForm }));
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError('');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading your account...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px' }}>

      {/* Profile section */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <Eyebrow>My Account</Eyebrow>
            <h2 style={{ marginTop: 4, fontSize: 22 }}>{profile.name || user?.email?.split('@')[0] || 'Visitor'}</h2>
          </div>
          <button className="btn" style={{ fontSize: 13 }} onClick={handleSignOut}>Sign Out</button>
        </div>

        {!editing ? (
          <div>
            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              <ProfileRow label="Email" value={user?.email} />
              <ProfileRow label="Name" value={profile.name} />
              <ProfileRow label="Phone" value={profile.phone} />
              <ProfileRow label="Address" value={profile.address} />
            </div>
            <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={handleEdit}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Email</label>
                <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="edit-name">Name</label>
                <input id="edit-name" type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="edit-phone">Phone</label>
                <input id="edit-phone" type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="Your phone number" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="edit-address">Address</label>
                <input id="edit-address" type="text" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} placeholder="Your address" />
              </div>
            </div>
            {saveError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{saveError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ fontSize: 13 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn" type="button" onClick={handleCancel} style={{ fontSize: 13 }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Request history section */}
      <div>
        <h3 style={{ fontSize: 18, marginBottom: 16 }}>Service Request History</h3>
        {leads.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>No service requests yet. <button className="btn btn-ghost" style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontSize: 14 }} onClick={() => go('contact')}>Submit a request</button></div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {leads.map(lead => {
              const box = messageBoxes[lead.id] || {};
              return (
                <div key={lead.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {lead.service_type && (
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{lead.service_type}</span>
                    )}
                  </div>
                  {lead.notes && (
                    <p style={{ fontSize: 13, color: 'var(--primary)', margin: '8px 0 0', fontStyle: 'italic' }}>
                      Note from us: {lead.notes}
                    </p>
                  )}
                  <div style={{ marginTop: 12 }}>
                    {!box.open ? (
                      <button
                        className="btn"
                        style={{ fontSize: 12, padding: '5px 12px' }}
                        onClick={() => openMessageBox(lead.id)}
                      >
                        Send a message
                      </button>
                    ) : box.sent ? (
                      <p style={{ fontSize: 13, color: '#16a34a' }}>✓ Message sent</p>
                    ) : (
                      <div>
                        <textarea
                          value={box.text || ''}
                          onChange={e => updateMessageBox(lead.id, { text: e.target.value })}
                          placeholder="Type your message..."
                          rows={3}
                          style={{ width: '100%', fontSize: 13, padding: 8, borderRadius: 6, border: '1px solid var(--border)', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: 12, padding: '5px 14px' }}
                            onClick={() => handleSendMessage(lead)}
                            disabled={box.sending || !box.text?.trim()}
                          >
                            {box.sending ? 'Sending…' : 'Send'}
                          </button>
                          <button
                            className="btn"
                            style={{ fontSize: 12, padding: '5px 12px' }}
                            onClick={() => updateMessageBox(lead.id, { open: false })}
                          >
                            Cancel
                          </button>
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
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not set</span>}</span>
    </div>
  );
}
