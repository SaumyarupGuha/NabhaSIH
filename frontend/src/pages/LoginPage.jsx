import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, Phone, Mail } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('phone');
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      // Redirect based on user role
      if (formData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Access your account on Nabha Telemedicine Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">I am a</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select your role</option>
                  <option value="patient">Patient / रोगी / ਮਰੀਜ਼</option>
                  <option value="doctor">Doctor / डॉक्टर / ਡਾਕਟਰ</option>
                  <option value="pharmacist">Pharmacist / फार्मासिस्ट / ਫਾਰਮਾਸਿਸਟ</option>
                  <option value="admin">Admin / प्रशासक / ਪ੍ਰਸ਼ਾਸਕ</option>
                </select>
              </div>

              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod('phone')}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Phone
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === 'email' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod('email')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium">
                  {loginMethod === 'phone' ? 'Phone Number / फोन नंबर / ਫੋਨ ਨੰਬਰ' : 'Email Address'}
                </label>
                <Input
                  id="contact"
                  name="contact"
                  type={loginMethod === 'phone' ? 'tel' : 'email'}
                  placeholder={loginMethod === 'phone' ? '+91 98765 43210' : 'your@email.com'}
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password / पासवर्ड / ਪਾਸਵਰਡ</label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}