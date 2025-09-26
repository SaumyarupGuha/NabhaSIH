import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { LanguageDropdown } from './LanguageDropdown';
import { FloatingAlerts } from './FloatingAlerts';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, User, LogOut } from 'lucide-react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation('common');

  const getNavigationItems = () => {
    const baseItems = [{ href: "/", label: t('nav.home') }];

    if (!user) {
      return [
        ...baseItems,
        { href: "/consultations", label: t('nav.consultations') },
        { href: "/pharmacies", label: t('nav.pharmacies') },
        { href: "/hospitals", label: t('nav.hospitals') },
      ];
    }

    switch (user.role) {
      case "patient":
        return [
          ...baseItems,
          { href: "/patient", label: t('nav.myDashboard') },
          { href: "/consultations", label: t('nav.consultations') },
          { href: "/pharmacies", label: t('nav.pharmacies') },
        ];
      case "doctor":
        return [
          ...baseItems,
          { href: "/hospital-dashboard", label: t('nav.doctorDashboard') },
          { href: "/doctor-consultations", label: "Online Consultations" },
          { href: "/hospitals", label: t('nav.hospitals') },
        ];
      case "pharmacist":
        return [
          ...baseItems,
          { href: "/pharmacy-dashboard", label: t('nav.pharmacyDashboard') },
        ];
      case "admin":
        return [
          ...baseItems,
          { href: "/admin", label: t('nav.admin') },
          { href: "/hospital-dashboard", label: t('nav.hospitalView') },
          { href: "/pharmacy-dashboard", label: t('nav.pharmacyView') },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <img src="/nabha_logo.png" className="h-12 w-auto" alt="Nabha Health Logo"/>
            <span>Nabha Health</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-foreground hover:text-primary transition-colors font-medium ${
                  location.pathname === item.href ? 'text-primary' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageDropdown />
            
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">({user.role})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-border pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground capitalize">{user.role}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.signup')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Alerts for doctors */}
      {user && user.role === 'doctor' && (
        <FloatingAlerts doctorId={user.id || user._id} />
      )}
    </nav>
  );
}