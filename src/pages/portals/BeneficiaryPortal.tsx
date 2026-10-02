import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge, UrgencyBadge } from '../../components/common/Badge';
import { AiService } from '../../services/aiService';
import { CAUSES_LIST, STATES_AND_CITIES } from '../../data/causes';
import type { CaseUrgency, HelpRequest } from '../../types/models';

export const BeneficiaryPortal: React.FC<{ onNavigate: (view: string) => void }> = () => {
  const { cases, submitHelpRequest, messages, sendMessage } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'my_cases' | 'new_request' | 'messaging'>('my_cases');
  const [selectedCase, setSelectedCase] = useState<HelpRequest | null>(null);

  // New Request Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('healthcare');
  const [urgency, setUrgency] = useState<CaseUrgency>('HIGH');
  const [supportType, setSupportType] = useState<HelpRequest['requiredSupportType']>('MEDICAL');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [state, setState] = useState(currentUser.profile.state || 'West Bengal');
  const [city, setCity] = useState(currentUser.profile.city || 'Kolkata');
  const [address, setAddress] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState('');

  // AI Auto-Classification Feedback
  const [aiDetected, setAiDetected] = useState<{
    predictedCategory: string;
    predictedUrgency: CaseUrgency;
    reasoning: string;
  } | null>(null);

  // Chat message input
  const [chatMessage, setChatMessage] = useState('');

  const myCases = cases.filter(c => c.beneficiaryId === currentUser.id);

  // Natural language description trigger for AI
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);

    if (val.length > 25) {
      const prediction = AiService.classifyRequestDescription(val);
      setAiDetected(prediction);
      setCategory(prediction.predictedCategory);
      setUrgency(prediction.predictedUrgency);
      setSupportType(prediction.suggestedSupportType);
    } else {
      setAiDetected(null);
    }
  };

  const [isSubmittingCase, setIsSubmittingCase] = useState(false);

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmittingCase(true);
    try {
      const newReq = await submitHelpRequest({
        title,
        category,
        urgency,
        description,
        city,
        state,
        address,
        requiredSupportType: supportType,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        documents: uploadedDocName ? [{ name: uploadedDocName, url: '#', type: 'application/pdf' }] : []
      });

      setTitle('');
      setDescription('');
      setEstimatedCost('');
      setAddress('');
      setUploadedDocName('');
      setAiDetected(null);
      setSelectedCase(newReq);
      setActiveTab('my_cases');
    } catch (err) {
      console.error('Case submission error:', err);
    } finally {
      setIsSubmittingCase(false);
    }
  };

  const caseMessages = selectedCase ? messages.filter(m => m.caseId === selectedCase.id) : [];

  const handleSendCaseMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedCase || !selectedCase.assignedNgoId) return;

    const toSend = chatMessage;
    setChatMessage('');
    try {
      await sendMessage(
        selectedCase.assignedNgoId,
        selectedCase.assignedNgoName || 'Assigned NGO Caseworker',
        toSend,
        selectedCase.id
      );
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Portal Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-active" style={{ marginBottom: '0.25rem' }}>Beneficiary Portal</span>
          <h1 style={{ fontSize: '2rem' }}>Welcome, {currentUser.profile.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Submit urgent help requests with verified privacy, track lifecycle progress, and consult directly with your assigned NGO.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('my_cases')}
            className={`btn ${activeTab === 'my_cases' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Icons.FileText size={16} />
            <span>My Requests ({myCases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('new_request')}
            className={`btn ${activeTab === 'new_request' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Icons.Plus size={16} />
            <span>Submit New Need</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MY REQUESTS & LIVE TRACKER */}
      {activeTab === 'my_cases' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedCase ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          {/* List of Cases */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active & Past Requests</h2>

            {myCases.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Icons.Heart size={40} color="var(--text-light)" />
                <h3 style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>No requests filed yet</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                  If you or someone in your community needs medical assistance, rations, or schooling, submit a request.
                </p>
                <button onClick={() => setActiveTab('new_request')} className="btn btn-primary">
                  Submit Your First Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myCases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="card card-hover"
                    style={{
                      cursor: 'pointer',
                      borderLeft: `4px solid ${selectedCase?.id === c.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: selectedCase?.id === c.id ? 'var(--primary-light)' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Case #{c.id} • {new Date(c.submittedAt).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <UrgencyBadge urgency={c.urgency} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{c.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                      <span>📍 {c.location.city}, {c.location.state}</span>
                      <span>Assigned: <strong>{c.assignedNgoName || 'Pending Triage'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Status Visualizer & Caseworker Channel */}
          {selectedCase && (
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '5rem', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Case Dossier #{selectedCase.id}</span>
                  <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{selectedCase.title}</h2>
                </div>
                <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Icons.X size={18} />
                </button>
              </div>

              {/* Status Machine Visualizer */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Icons.Clock size={16} color="var(--primary)" />
                  <span>Current State: <strong style={{ color: 'var(--primary)' }}>{selectedCase.status}</strong></span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '2px solid var(--primary)', paddingLeft: '0.75rem', marginLeft: '0.5rem' }}>
                  {selectedCase.statusHistory.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{h.status}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{new Date(h.updatedAt).toLocaleString()} by {h.updatedBy}</div>
                      {h.note && <div style={{ color: 'var(--text-main)', marginTop: '1px' }}>"{h.note}"</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution details if resolved */}
              {selectedCase.status === 'RESOLVED' && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <Icons.CheckCircle size={18} />
                    <span>Case Successfully Resolved</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#047857', marginBottom: '0.5rem' }}>
                    {selectedCase.resolutionNotes}
                  </p>
                  {selectedCase.resolutionEvidenceUrl && (
                    <a href={selectedCase.resolutionEvidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      View Verifiable Photographic Evidence ↗
                    </a>
                  )}
                </div>
              )}

              {/* Secure Caseworker Messaging Channel */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Icons.MessageSquare size={16} />
                  <span>Caseworker Direct Channel</span>
                </h4>

                {selectedCase.assignedNgoId ? (
                  <>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {caseMessages.length === 0 ? (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                          No messages yet. Send a note to {selectedCase.assignedNgoName}.
                        </p>
                      ) : (
                        caseMessages.map(m => (
                          <div
                            key={m.id}
                            style={{
                              alignSelf: m.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                              background: m.senderId === currentUser.id ? 'var(--primary)' : '#ffffff',
                              color: m.senderId === currentUser.id ? '#ffffff' : 'var(--text-main)',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              maxWidth: '85%',
                              border: m.senderId === currentUser.id ? 'none' : '1px solid var(--border)'
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.6875rem', opacity: 0.8 }}>{m.senderName}</div>
                            <div>{m.content}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleSendCaseMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Message your assigned caseworker..."
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        style={{ fontSize: '0.8125rem', padding: '0.4rem 0.6rem' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Icons.Send size={14} />
                      </button>
                    </form>
                  </>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    A caseworker channel will open as soon as an accredited NGO accepts your request during verification.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTAKE WIZARD WITH REAL-TIME AI CLASSIFIER */}
      {activeTab === 'new_request' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Express Your Need</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Describe what you require. Our natural language classifier will automatically detect the cause category and triage priority.
            </p>
          </div>

          <form onSubmit={handleCaseSubmit}>
            <div className="form-group">
              <label className="form-label">Request Title / Headline</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Critical surgery fees for pediatric heart patient"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description of Situation</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Explain the background, patient/family situation, medical diagnosis, school fee requirement, or flood damage..."
                value={description}
                onChange={handleDescriptionChange}
                required
              />

              {/* AI Detection Banner */}
              {aiDetected && (
                <div style={{ marginTop: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Icons.Sparkles size={18} color="#16a34a" />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong style={{ color: '#166534' }}>AI Auto-Assisted Categorization:</strong>
                    <div style={{ color: '#15803d' }}>
                      Predicted <strong>{aiDetected.predictedCategory}</strong> with <strong>{aiDetected.predictedUrgency}</strong> priority. ({aiDetected.reasoning})
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Cause Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CAUSES_LIST.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <select
                  className="form-select"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as CaseUrgency)}
                >
                  <option value="LOW">Low (Within Months)</option>
                  <option value="MEDIUM">Medium (Within Weeks)</option>
                  <option value="HIGH">High (Within Days)</option>
                  <option value="CRITICAL">Critical (Immediate Emergency)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Support Type</label>
                <select
                  className="form-select"
                  value={supportType}
                  onChange={e => setSupportType(e.target.value as HelpRequest['requiredSupportType'])}
                >
                  <option value="MEDICAL">Medical Treatment / Surgeries</option>
                  <option value="FINANCIAL">Direct Financial Relief</option>
                  <option value="FOOD_RATION">Dry Ration / Meals</option>
                  <option value="EDUCATION">School Fees / Books</option>
                  <option value="SHELTER">Emergency Shelter</option>
                  <option value="EQUIPMENT">Medical / Solar Equipment</option>
                  <option value="VOLUNTEER_HELP">Volunteer Assistance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Financial Need (INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50000"
                  value={estimatedCost}
                  onChange={e => setEstimatedCost(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <select
                  className="form-select"
                  value={state}
                  onChange={e => {
                    setState(e.target.value);
                    setCity(STATES_AND_CITIES[e.target.value]?.[0] || '');
                  }}
                >
                  {Object.keys(STATES_AND_CITIES).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City / Village</label>
                <select
                  className="form-select"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                >
                  {(STATES_AND_CITIES[state] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Private Street Landmark (Secured - Never Public)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. House 42, Near Primary Health Sub-Center"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Document Upload Simulator */}
            <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                Supporting Verification Documents (Hospital Estimate / School Certificate)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Simulate Document File Name (e.g. NRS_Hospital_Estimate.pdf)"
                  value={uploadedDocName}
                  onChange={e => setUploadedDocName(e.target.value)}
                  style={{ margin: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setUploadedDocName('Hospital_Treatment_Certificate_Signed.pdf')}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Attach Sample PDF
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setActiveTab('my_cases')} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                disabled={isSubmittingCase}
              >
                {isSubmittingCase ? (
                  <>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Submitting to Supabase...</span>
                  </>
                ) : (
                  <span>Submit Request into Triage Queue</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
