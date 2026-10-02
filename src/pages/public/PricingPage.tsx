import React, { useState } from 'react';
import { useSubscription } from '../../store/SubscriptionContext';
import { useAuth } from '../../store/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import type { PlanTier } from '../../types/subscription';

interface PricingPageProps {
  onNavigate: (view: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const {
    availablePlans,
    currentPlan,
    status,
    subscription,
    subscribe,
    cancel,
    isLoading,
    isProcessingPayment,
    paymentModalMessage,
    dismissPaymentModal,
    error,
  } = useSubscription();
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [subscribingTier, setSubscribingTier] = useState<PlanTier | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSubscribe = async (tier: PlanTier) => {
    setActionError(null);
    if (!currentUser.id) {
      onNavigate('login');
      return;
    }

    try {
      setSubscribingTier(tier);
      await subscribe(tier);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Subscription initialization failed');
    } finally {
      setSubscribingTier(null);
    }
  };

  const handleCancel = async () => {
    setActionError(null);
    try {
      await cancel();
      setShowCancelConfirm(false);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || 'Failed to cancel subscription');
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '3.5rem 1.5rem', maxWidth: '1200px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-verified" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8125rem' }}>
            {t('pricing.badge', 'Verified Social Impact Plans')}
          </span>
          <span className="badge badge-active" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8125rem' }}>
            {t('pricing.billingCycle', 'Monthly Billing • Cancel Anytime')}
          </span>
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', color: 'var(--text-main)' }}>
          {t('pricing.title', 'Transparent Plans for Transparent Impact')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
          {t(
            'pricing.subtitle',
            'Scale your NGO operations with AI copilot intake triage, real-time analytics, and direct institutional CSR grant co-funding.'
          )}
        </p>

        {/* Current Active Plan Pill */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-card)',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Organization Tier:</span>
          <span
            className={`badge ${
              currentPlan === 'enterprise'
                ? 'badge-completed'
                : currentPlan === 'pro'
                ? 'badge-active'
                : 'badge-low'
            }`}
            style={{ fontWeight: 700 }}
          >
            {currentPlan.toUpperCase()}
          </span>
          {status === 'cancelled' && (
            <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>
              Cancelling at period end
            </span>
          )}
          {subscription?.end_date && status === 'cancelled' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Access until {new Date(subscription.end_date).toLocaleDateString()})
            </span>
          )}
        </div>
      </div>

      {/* Global Error Banner */}
      {(error || actionError) && (
        <div
          style={{
            background: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.AlertCircle size={20} color="var(--danger)" />
            <span>{error || actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
          >
            <Icons.X size={16} />
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid-3" style={{ gap: '2rem', alignItems: 'stretch', marginBottom: '4rem' }}>
        {availablePlans.map(plan => {
          const isCurrent = currentPlan === plan.id;
          const isPro = plan.id === 'pro';
          const isEnterprise = plan.id === 'enterprise';

          return (
            <div
              key={plan.id}
              className={`card ${isCurrent ? 'current-plan-card' : 'card-hover'}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: isCurrent
                  ? '2px solid var(--primary)'
                  : isPro
                  ? '1px solid #38bdf8'
                  : '1px solid var(--border)',
                boxShadow: isCurrent ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                transform: isPro && !isCurrent ? 'scale(1.02)' : 'none',
              }}
            >
              {/* Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isPro ? '#0284c7' : isEnterprise ? '#059669' : 'var(--text-muted)',
                  }}
                >
                  {plan.name}
                </span>
                {isCurrent && (
                  <span className="badge badge-active" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    ACTIVE PLAN
                  </span>
                )}
                {!isCurrent && isPro && (
                  <span
                    className="badge"
                    style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    POPULAR
                  </span>
                )}
                {!isCurrent && isEnterprise && (
                  <span
                    className="badge"
                    style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    INSTITUTIONAL
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                    ₹{plan.priceINR.toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    /{plan.billingPeriod}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  {plan.tagline}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0 1.5rem 0' }} />

              {/* Features List */}
              <div style={{ flex: 1, marginBottom: '2rem' }}>
                <h4
                  style={{
                    fontSize: '0.8125rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                  }}
                >
                  Key Capabilities
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem' }}>
                      <div
                        style={{
                          marginTop: '3px',
                          color: isPro ? '#0284c7' : isEnterprise ? '#059669' : '#10b981',
                          flexShrink: 0,
                        }}
                      >
                        <Icons.CheckCircle size={16} />
                      </div>
                      <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits highlight */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Operating Limits:</div>
                  <div>• Case Triage: {plan.limits.casesPerMonth > 10000 ? 'Unlimited' : `${plan.limits.casesPerMonth} / month`}</div>
                  <div>• Active Projects: {plan.limits.projectsLimit > 10000 ? 'Unlimited' : `${plan.limits.projectsLimit} max`}</div>
                  <div>• Volunteer Drives: {plan.limits.volunteersPerDrive > 10000 ? 'Unlimited' : `${plan.limits.volunteersPerDrive} per drive`}</div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      disabled
                      className="btn btn-secondary"
                      style={{ width: '100%', cursor: 'default', opacity: 0.8 }}
                    >
                      <Icons.CheckCircle size={16} />
                      <span>Current Active Tier</span>
                    </button>
                    {plan.id !== 'free' && status !== 'cancelled' && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="btn"
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                      >
                        Cancel subscription at cycle end
                      </button>
                    )}
                  </div>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="btn btn-secondary"
                    style={{ width: '100%', opacity: 0.6 }}
                  >
                    Default Starter
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribingTier !== null || isLoading}
                    className={`btn ${isPro ? 'btn-primary' : 'btn-success'}`}
                    style={{ width: '100%', fontWeight: 700 }}
                  >
                    {subscribingTier === plan.id ? (
                      <span>Opening Razorpay Checkout...</span>
                    ) : (
                      <>
                        <span>{currentPlan === 'free' ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}</span>
                        <Icons.ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Trust Badges */}
      <div
        className="card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          Enterprise Trust, Compliance & Security Standards
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.75rem', borderRadius: '50%' }}>
              <Icons.ShieldCheck size={24} />
            </div>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Razorpay Subscriptions</strong>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              256-bit encrypted recurring payments compliant with RBI auto-debit regulations.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '50%' }}>
              <Icons.Award size={24} />
            </div>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Schedule VII Aligned</strong>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Tax 80G and CSR-1 certified project reporting for institutional accountability.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: '50%' }}>
              <Icons.Sparkles size={24} />
            </div>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Immediate Webhook Sync</strong>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              PostgreSQL source-of-truth synced directly through verified webhook signatures.
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--modal-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade"
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'var(--modal-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--danger)' }}>
                <Icons.AlertCircle size={24} color="var(--danger)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Confirm Cancellation</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel your paid subscription? You will continue to maintain premium access until the end of your current monthly billing period. After that date, your account will smoothly revert to the Free Starter tier.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowCancelConfirm(false)} className="btn btn-secondary">
                Keep Subscription
              </button>
              <button onClick={handleCancel} className="btn btn-danger">
                Yes, Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Payment Modal (Critical Flow: Never assumes success, polls webhook) */}
      {(isProcessingPayment || paymentModalMessage) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--modal-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade"
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'var(--modal-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {isProcessingPayment ? (
              <>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid var(--border)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1.5rem auto',
                  }}
                />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Processing Subscription...
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  {paymentModalMessage ||
                    'Verifying transaction with Razorpay Webhook. Our backend PostgreSQL database is updating your authoritative tier...'}
                </p>
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: 'var(--text-light)',
                  }}
                >
                  <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '4px' }}>
                    <Icons.ShieldCheck size={14} />
                  </span>
                  Cryptographic webhook verification in progress. Do not close this window.
                </div>
              </>
            ) : (
              <>
                <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                  <Icons.CheckCircle size={48} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Status Notice
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  {paymentModalMessage}
                </p>
                <button onClick={dismissPaymentModal} className="btn btn-primary" style={{ width: '100%' }}>
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .current-plan-card {
          position: relative;
        }
      `}</style>
    </div>
  );
};
