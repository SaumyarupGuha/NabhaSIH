import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, User, LogOut } from 'lucide-react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [{ href: "/", label: "Home" }];

    if (!user) {
      return [
        ...baseItems,
        { href: "/consultations", label: "Consultations" },
        { href: "/pharmacies", label: "Pharmacies" },
        { href: "/hospitals", label: "Hospitals" },
      ];
    }

    switch (user.role) {
      case "patient":
        return [
          ...baseItems,
          { href: "/patient", label: "My Dashboard" },
          { href: "/consultations", label: "Consultations" },
          { href: "/pharmacies", label: "Pharmacies" },
        ];
      case "doctor":
        return [
          ...baseItems,
          { href: "/hospital-dashboard", label: "Doctor Dashboard" },
          { href: "/hospitals", label: "Hospitals" },
        ];
      case "pharmacist":
        return [
          ...baseItems,
          { href: "/pharmacy-dashboard", label: "Pharmacy Dashboard" },
          { href: "/pharmacies", label: "Pharmacies" },
        ];
      case "admin":
        return [
          ...baseItems,
          { href: "/admin", label: "Admin" },
          { href: "/hospital-dashboard", label: "Hospital View" },
          { href: "/pharmacy-dashboard", label: "Pharmacy View" },
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
            <Heart className="h-6 w-6 fill-current" />
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
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
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
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}