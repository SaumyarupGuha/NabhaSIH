import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

import { useAuth } from '../context/AuthContext';
import { Heart, Stethoscope, Pill, Phone, Users, Clock, MapPin } from 'lucide-react';
import '../i18n';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const features = [
    {
      icon: Stethoscope,
      title: t('features.consultations.title'),
      description: t('features.consultations.description'),
    },
    {
      icon: Pill,
      title: t('features.pharmacies.title'),
      description: t('features.pharmacies.description'),
    },
    {
      icon: Phone,
      title: t('features.emergency.title'),
      description: t('features.emergency.description'),
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: t('stats.patientsServed') },
    { icon: Stethoscope, value: "25+", label: t('stats.doctorsAvailable') },
    { icon: Pill, value: "15+", label: t('stats.partnerPharmacies') },
    { icon: Clock, value: "24/7", label: t('stats.emergencySupport') },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "patient":
        return "/patient";
      case "doctor":
        return "/hospital-dashboard";
      case "pharmacist":
        return "/pharmacy-dashboard";
      case "admin":
        return "/admin";
      default:
        return "/login";
    }
  };

  const getWelcomeMessage = () => {
    if (!user) return null;

    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">{t('welcome', { name: user.name })}</h3>
        <p className="text-muted-foreground mb-4">
          {user.role === "patient" && t('userRoles.patient')}
          {user.role === "doctor" && t('userRoles.doctor')}
          {user.role === "pharmacist" && t('userRoles.pharmacist')}
          {user.role === "admin" && t('userRoles.admin')}
        </p>
        <Button asChild>
          <Link to={getDashboardLink()}>{t('buttons.goToDashboard')}</Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {getWelcomeMessage()}

          <div className="mb-8">
            <img 
              src="/nabha_logo.png" 
              className="h-24 w-auto mx-auto mb-4" 
              alt="Nabha Health Logo"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('hero.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to={user.role === "patient" ? "/consultations" : getDashboardLink()}>
                    <Stethoscope className="mr-2 h-5 w-5" />
                    {user.role === "patient" ? t('buttons.bookConsultation') : t('buttons.goToDashboard')}
                  </Link>
                </Button>
                {user.role === "patient" && (
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                    <Link to="/pharmacies">
                      <Pill className="mr-2 h-5 w-5" />
                      {t('buttons.findPharmacy')}
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/signup">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    {t('buttons.getStarted')}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/consultations">
                    <Pill className="mr-2 h-5 w-5" />
                    {t('buttons.browseServices')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('features.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('stats.title')}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl mb-8">
            {t('cta.subtitle')}
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to={user ? getDashboardLink() : "/signup"}>
              {user ? t('buttons.goToDashboard') : t('buttons.getStartedToday')}
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
                <img src="/nabha_logo.png" className="h-12 w-auto" alt="Nabha Health Logo"/>
                Nabha Health
              </div>
              <p className="text-muted-foreground">{t('footer.tagline')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.services')}</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>{t('footer.onlineConsultations')}</li>
                <li>{t('footer.medicineDelivery')}</li>
                <li>{t('footer.emergencySupport')}</li>
                <li>{t('footer.healthRecords')}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open('https://maps.google.com/maps?q=Nabha,+Punjab,+India', '_blank')}
                    className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                  >
                    <MapPin className="h-4 w-4" />
                    Nabha, Punjab
                  </button>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t('footer.emergency')}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.languages')}</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>English</li>
                <li>हिंदी (Hindi)</li>
                <li>ਪੰਜਾਬੀ (Punjabi)</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}