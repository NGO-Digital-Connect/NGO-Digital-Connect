import React from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/Badge';
import { AiService } from '../../services/aiService';

export const VolunteerPortal: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { applications, opportunities, applyForOpportunity } = useData();
  const { currentUser } = useAuth();

  const details = currentUser.profile.volunteerDetails || {
    skills: ['Teaching & Tutoring', 'Photography & Media'],
    causes: ['education', 'environment'],
    availability: 'WEEKENDS',
    hoursLogged: 48
  };

  const myApplications = applications.filter(a => a.volunteerId === currentUser.id);
  const totalHours = myApplications.reduce((sum, a) => sum + (a.hoursLogged || 0), details.hoursLogged || 0);

  // Smart AI Recommendations based on volunteer's profile
  const smartMatches = AiService.matchOpportunitiesForVolunteer(
    details.skills,
    details.causes,
    opportunities
  ).filter(match => !myApplications.some(a => a.opportunityId === match.opp.id));

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-active">Field Volunteer Portal</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Welcome, {currentUser.profile.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track your applied roles, log verified field service hours, and view opportunities matched to your skills.
          </p>
        </div>

        <button onClick={() => onNavigate('opportunities')} className="btn btn-primary">
          <Icons.Search size={16} />
          <span>Explore All Open Roles</span>
        </button>
      </div>

      {/* KPI Scorecard */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Service Credit</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            {totalHours} Hours
          </div>
          <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
            ✓ Verified on platform impact ledger
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Applications</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            {myApplications.length} Initiatives
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {myApplications.filter(a => a.status === 'ACCEPTED').length} Confirmed Assignments
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Availability</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '0.5rem' }}>
            {details.availability}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
            {details.skills.map(s => (
              <span key={s} className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Applications & Assignments Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Applications & Assignments</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Opportunity Role</th>
                <th>Managing NGO</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Hours Logged</th>
                <th>Caseworker Briefing</th>
              </tr>
            </thead>
            <tbody>
              {myApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    You have not applied for any volunteer opportunities yet. Check out the matched opportunities below!
                  </td>
                </tr>
              ) : (
                myApplications.map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.opportunityTitle}</strong></td>
                    <td>Prerona Mission / Vidya Jyoti</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td><strong>{app.hoursLogged || 0} hrs</strong></td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {app.status === 'ACCEPTED' ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>✓ Ready for Weekend Field Service</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Pending NGO Review</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart AI Recommendations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Icons.Sparkles size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem' }}>Smart Matched Opportunities for You</h2>
        </div>

        <div className="grid-2">
          {smartMatches.slice(0, 2).map(({ opp, score, matchReasons }) => (
            <div key={opp.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-active">{opp.cause}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {score}% Match Score
                </span>
              </div>

              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.35rem' }}>{opp.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flex: 1 }}>
                {opp.description}
              </p>

              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                {matchReasons.map((r, i) => (
                  <div key={i} style={{ color: '#059669' }}>✓ {r}</div>
                ))}
              </div>

              <button
                onClick={() => {
                  applyForOpportunity(opp.id);
                  alert('Application submitted successfully!');
                }}
                className="btn btn-primary"
              >
                Apply for this Slot
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
