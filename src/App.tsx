import { useState } from 'react';
import { ThemeProvider } from './store/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './store/AuthContext';
import { DataProvider } from './store/DataContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { NgoDirectoryPage } from './pages/public/NgoDirectoryPage';
import { NgoDetailPage } from './pages/public/NgoDetailPage';
import { ProjectDirectoryPage } from './pages/public/ProjectDirectoryPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { OpportunitiesPage } from './pages/public/OpportunitiesPage';
import { ImpactPage } from './pages/public/ImpactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { PricingPage } from './pages/public/PricingPage';
import { SubscriptionProvider } from './store/SubscriptionContext';

// Portals
import { BeneficiaryPortal } from './pages/portals/BeneficiaryPortal';
import { NgoPortal } from './pages/portals/NgoPortal';
import { VolunteerPortal } from './pages/portals/VolunteerPortal';
import { DonorPortal } from './pages/portals/DonorPortal';
import { CsrPortal } from './pages/portals/CsrPortal';
import { GovernmentPortal } from './pages/portals/GovernmentPortal';
import { AdminPortal } from './pages/portals/AdminPortal';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'pricing' || window.location.hash === '#pricing') return 'pricing';
    }
    return 'home';
  });
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) {
      setSelectedEntityId(id);
    } else {
      setSelectedEntityId(null);
    }
    if (typeof window !== 'undefined') {
      const newUrl = view === 'home' ? '/' : `/${view}`;
      window.history.pushState(null, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'pricing':
        return <PricingPage onNavigate={handleNavigate} />;
      case 'ngos':
        return <NgoDirectoryPage onNavigate={handleNavigate} />;
      case 'ngo_detail':
        return <NgoDetailPage ngoId={selectedEntityId || 'ngo_prerona_01'} onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectDirectoryPage onNavigate={handleNavigate} />;
      case 'project_detail':
        return <ProjectDetailPage projectId={selectedEntityId || 'proj_001'} onNavigate={handleNavigate} />;
      case 'opportunities':
        return <OpportunitiesPage />;
      case 'impact':
        return <ImpactPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;

      // Portals
      case 'portal_beneficiary':
        return <BeneficiaryPortal onNavigate={handleNavigate} />;
      case 'portal_ngo':
        return <NgoPortal onNavigate={handleNavigate} />;
      case 'portal_volunteer':
        return <VolunteerPortal onNavigate={handleNavigate} />;
      case 'portal_donor':
        return <DonorPortal onNavigate={handleNavigate} />;
      case 'portal_csr':
        return <CsrPortal onNavigate={handleNavigate} />;
      case 'portal_government':
        return <GovernmentPortal onNavigate={handleNavigate} />;
      case 'portal_admin':
        return <AdminPortal />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>
        {renderView()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <SubscriptionProvider>
              <AppContent />
            </SubscriptionProvider>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
