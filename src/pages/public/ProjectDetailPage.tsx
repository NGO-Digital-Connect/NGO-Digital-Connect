import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/Badge';
import { MetricProgressBar } from '../../components/common/ProgressBar';

export const ProjectDetailPage: React.FC<{
  projectId: string;
  onNavigate: (view: string, id?: string) => void;
}> = ({ projectId, onNavigate }) => {
  const { projects, utilizations, makeDonation } = useData();
  const { t } = useTranslation();

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorMessage, setDonorMessage] = useState('');
  const [donationSuccessReceipt, setDonationSuccessReceipt] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--secondary)' }}>{t('common.noResults', 'Project Not Found')}</h2>
        <button onClick={() => onNavigate('projects')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          {t('common.back', 'Back to Projects')}
        </button>
      </div>
    );
  }

  const projectUtils = utilizations.filter(u => u.projectId === project.id);
  const totalUtilized = projectUtils.reduce((sum, u) => sum + u.amount, 0);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : donateAmount;
    if (finalAmount <= 0) return;

    try {
      const donation = await makeDonation({
        projectId: project.id,
        amount: finalAmount,
        paymentMethod,
        isAnonymous,
        donorMessage
      });
      setDonationSuccessReceipt(donation.receiptNumber);
      setShowDonateModal(false);
      setCustomAmount('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Donation failed');
    }
  };

  const causeLocalized = t(`causes.${project.cause}`, project.cause);

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      <button
        onClick={() => onNavigate('projects')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      >
        <Icons.ArrowLeft size={16} />
        <span>{t('common.back', 'Back to Projects Catalog')}</span>
      </button>

      {/* Success Banner if just donated */}
      {donationSuccessReceipt && (
        <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icons.CheckCircle size={24} color="var(--accent)" />
            <div>
              <strong style={{ color: 'var(--accent)' }}>{t('common.success', 'Contribution Successfully Recorded!')}</strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                Your 80G tax receipt number is <strong>{donationSuccessReceipt}</strong>. Funds are now allocated to this project's active ledger.
              </div>
            </div>
          </div>
          <button onClick={() => setDonationSuccessReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
            <Icons.X size={18} />
          </button>
        </div>
      )}

      {/* Top Project Hero Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left: Image & Problem Statement */}
        <div>
          <div style={{ height: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
            <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
            {t('common.description', 'Project Purpose & Field Need')}
          </h2>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            {project.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('common.location', 'Operating Location')}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{project.location.city}, {project.location.state}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('common.organization', 'Initiative Lead')}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{project.ngoName}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('common.date', 'Timeline')}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{project.startDate} to {project.endDate}</div>
            </div>
          </div>
        </div>

        {/* Right: Multi-Metric Scorecard & Action Box */}
        <div>
          <div className="card" style={{ padding: '2rem', position: 'sticky', top: '5rem', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {causeLocalized}
              </span>
              <StatusBadge status={project.status} />
            </div>

            <h1 style={{ fontSize: '1.625rem', marginBottom: '1.5rem', lineHeight: '1.25', color: 'var(--secondary)' }}>
              {project.title}
            </h1>

            {/* Multi-Metric Progress */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <MetricProgressBar
                label={t('common.raised', 'Capital Funding')}
                current={project.fundingRaised}
                target={project.fundingTarget}
                unitPrefix="₹"
                color="var(--primary)"
              />
              <MetricProgressBar
                label={t('home.beneficiariesReached', 'Beneficiaries Reached')}
                current={project.reachedBeneficiaries}
                target={project.targetBeneficiaries}
                color="#059669"
              />
              <MetricProgressBar
                label={t('home.volunteersEngaged', 'Volunteers Mobilized')}
                current={project.volunteersEnrolled}
                target={project.volunteersNeeded}
                color="#7c3aed"
              />
            </div>

            <button
              onClick={() => setShowDonateModal(true)}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              <Icons.Heart size={18} />
              <span>{t('portals.donor.donateNowBtn', 'Contribute to this Project (80G Tax Eligible)')}</span>
            </button>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🔒 {t('footer.traceable100', '100% Traceable')}. {t('footer.auditFundDesc', 'Audited with itemized vendor receipts.')}
            </div>
          </div>
        </div>
      </div>

      {/* Audited Fund Utilization Ledger */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>
              {t('portals.ngo.utilizationProofTitle', 'Audited Fund Utilization Ledger')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Total Disbursed: <strong style={{ color: 'var(--secondary)' }}>₹{totalUtilized.toLocaleString('en-IN')}</strong> of ₹{project.fundingRaised.toLocaleString('en-IN')} raised.
            </p>
          </div>
          <span className="badge badge-verified" style={{ padding: '0.4rem 0.75rem' }}>
            ✓ {t('common.verified', 'Real-Time Expenditure Audit')}
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('common.date', 'Date')}</th>
                <th>{t('common.category', 'Category')}</th>
                <th>{t('common.description', 'Description')}</th>
                <th>{t('portals.ngo.expenseVendor', 'Vendor / Partner')}</th>
                <th>{t('common.amount', 'Amount')}</th>
                <th>{t('common.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {projectUtils.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No expenses logged yet. Capital is preserved in escrow.
                  </td>
                </tr>
              ) : (
                projectUtils.map(u => (
                  <tr key={u.id}>
                    <td>{u.spentDate}</td>
                    <td><span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{u.category.replace('_', ' ')}</span></td>
                    <td>{u.description}</td>
                    <td>{u.vendorName}</td>
                    <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>₹{u.amount.toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-verified" style={{ fontSize: '0.6875rem' }}>Voucher Verified</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestones & Field Bulletins */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Milestones */}
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
            <Icons.Target size={20} color="var(--primary)" />
            <span>Operational Milestones</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {project.milestones.map(m => (
              <div
                key={m.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: m.isCompleted ? 'var(--accent-light)' : 'var(--bg-subtle)',
                  border: `1px solid ${m.isCompleted ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {m.isCompleted ? (
                    <Icons.CheckCircle size={18} color="var(--accent)" />
                  ) : (
                    <Icons.Clock size={18} color="var(--text-muted)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {m.isCompleted ? `Completed on ${m.completedDate}` : `Target: ${m.targetDate}`}
                  </div>
                  {m.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{m.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Updates */}
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
            <Icons.FileText size={20} color="var(--primary)" />
            <span>Field Bulletins & Updates</span>
          </h3>

          {project.updates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No field updates posted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {project.updates.map(u => (
                <div key={u.id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.date}</div>
                  <h4 style={{ fontSize: '0.9375rem', margin: '2px 0 4px 0', color: 'var(--secondary)' }}>{u.title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {u.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Donation Checkout Modal */}
      {showDonateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{t('portals.donor.makeDonationTab', 'Support this Initiative')}</h3>
              <button onClick={() => setShowDonateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label={t('common.close', 'Close')}>
                <Icons.X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Contributing to <strong>{project.title}</strong>. Your donation is backed by Indian Income Tax Section 80G deductions.
            </p>

            <form onSubmit={handleDonateSubmit}>
              {/* Preset Amounts */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">{t('common.amount', 'Select Amount (INR)')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDonateAmount(amt);
                        setCustomAmount('');
                      }}
                      className="btn"
                      style={{
                        background: donateAmount === amt && !customAmount ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: donateAmount === amt && !customAmount ? '#fff' : 'var(--text-main)',
                        fontSize: '0.8125rem',
                        padding: '0.5rem',
                        border: '1px solid var(--border)'
                      }}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  className="form-input"
                  placeholder="Or enter custom amount in ₹"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  min="100"
                />
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label className="form-label">{t('portals.donor.paymentModeLabel', 'Payment Channel')}</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI / QR">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card (Visa/Mastercard/RuPay)</option>
                  <option value="NetBanking">NetBanking (SBI/HDFC/ICICI/Axis)</option>
                  <option value="Corporate RTGS/NEFT">Corporate / Institutional Wire (RTGS)</option>
                </select>
              </div>

              {/* Optional Message */}
              <div className="form-group">
                <label className="form-label">{t('portals.donor.donorMessageLabel', 'Words of Encouragement (Optional)')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="E.g. In memory of my mother / Wishing speedy recovery"
                  value={donorMessage}
                  onChange={e => setDonorMessage(e.target.value)}
                />
              </div>

              {/* Anonymous Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonCheck" style={{ fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                  {t('portals.donor.anonymousLabel', 'Make my contribution anonymous on public project donor feed')}
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDonateModal(false)} className="btn btn-secondary">
                  {t('common.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  {t('portals.donor.donateNowBtn', 'Confirm & Generate 80G Receipt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
