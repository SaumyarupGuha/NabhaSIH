import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { appointmentAPI, prescriptionAPI } from '../lib/api';
import { Calendar, Clock, User, FileText, Pill, Phone, Plus, Eye, Package, Truck, RefreshCw } from 'lucide-react';
import io from 'socket.io-client';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const { t } = useTranslation('patient');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {

        
        // Fetch appointments
        let appointmentsData = [];
        try {
          const appointmentsRes = await appointmentAPI.getAppointments();
          appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.data || [];

        } catch (error) {

        }
        
        // Fetch prescriptions
        let prescriptionsData = [];
        try {
          const prescriptionsRes = await prescriptionAPI.getPrescriptions();
          prescriptionsData = Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data : prescriptionsRes.data?.data || [];

        } catch (error) {

        }
        
        // Fetch orders
        let ordersData = [];
        try {
          const ordersRes = await fetch('http://localhost:5000/api/orders/patient', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (ordersRes.ok) {
            const ordersJson = await ordersRes.json();
            ordersData = ordersJson.data || [];

          }
        } catch (error) {

        }
        
        setAppointments(appointmentsData);
        setPrescriptions(prescriptionsData);
        setOrders(ordersData);
        
      } catch (error) {

        setAppointments([]);
        setPrescriptions([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup Socket.io for real-time order updates
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for order acceptance
    newSocket.on('orderAccepted', (data) => {

      setOrders(prev => prev.map(order => 
        order._id === data.orderId ? { 
          ...order, 
          status: 'accepted', 
          acceptedBy: data.acceptedBy,
          pharmacyName: data.pharmacyName 
        } : order
      ));
    });

    // Listen for order status updates
    newSocket.on('orderUpdated', (data) => {

      setOrders(prev => prev.map(order => 
        order._id === data.orderId ? { 
          ...order, 
          status: data.status,
          pharmacyName: data.pharmacyName || order.pharmacyName
        } : order
      ));
    });

    // Listen for order status updates (alternative event name)
    newSocket.on('orderStatusUpdate', (data) => {

      if (data.customerId) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (data.customerId === user._id || data.customerId === user.id) {
          setOrders(prev => prev.map(order => 
            order._id === data.orderId ? { 
              ...order, 
              status: data.status,
              pharmacyName: data.pharmacyName || order.pharmacyName
            } : order
          ));
        }
      }
    });

    // Join patient room for targeted updates
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id || user.id) {
      newSocket.emit('joinPatientRoom', user._id || user.id);
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'active':
      case 'accepted':
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPharmacyName = (order) => {
    return order.pharmacyName || 'Waiting for pharmacy';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Finding Pharmacy',
      'accepted': 'Accepted',
      'preparing': 'Preparing Order',
      'ready': 'Ready for Pickup',
      'delivered': 'Delivered',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const AppointmentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('modal.bookNewAppointment')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="patientName" className="block mb-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300">{t('modal.patientName')}</label>
              <input type="text" id="patientName" className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder={t('modal.patientNamePlaceholder')} />
            </div>
            <div>
              <label htmlFor="doctor" className="block mb-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300">{t('modal.doctor')}</label>
              <select id="doctor" className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option>{t('modal.selectDoctor')}</option>
                <option>Dr. Anjali Sharma</option>
                <option>Dr. Vikram Gupta</option>
                <option>Dr. Priya Singh</option>
              </select>
            </div>
            <div>
              <label htmlFor="appointmentDate" className="block mb-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300">{t('modal.date')}</label>
              <input type="date" id="appointmentDate" className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end p-5 border-t border-gray-200 dark:border-gray-700 space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            {t('modal.cancel')}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
            {t('modal.confirmAppointment')}
          </button>
        </div>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton className="h-8 w-64 mb-2" />
          <LoadingSkeleton className="h-4 w-96 mb-8" />
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} type="card" className="h-32" />
            ))}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <LoadingSkeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <LoadingSkeleton key={i} type="card" className="h-40" />
                ))}
              </div>
            </div>
            <div>
              <LoadingSkeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <LoadingSkeleton key={i} type="card" className="h-48" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNavigateToPharmacy = () =>{
    navigate('/pharmacies')
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Plus className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">{t('dashboard.bookAppointment')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">{t('dashboard.bookNewConsultation')}</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">{t('dashboard.emergencyContact')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="destructive" className="w-full">
                {t('dashboard.callEmergency')}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Pill className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">{t('dashboard.orderMedicine')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full" onClick={handleNavigateToPharmacy}>
                {t('dashboard.orderFromPharmacy')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{t('dashboard.myAppointments')}</h2>
              <button 
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                {t('dashboard.newAppointment')}
              </button>
            </div>
            

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">{t('dashboard.noAppointments')}</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                          </CardTitle>
                          <CardDescription>{appointment.doctor?.specialization}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'scheduled' ? (
                          <>
                            <Button size="sm">{t('dashboard.joinConsultation')}</Button>
                            <Button size="sm" variant="outline">
                              {t('dashboard.reschedule')}
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            {t('dashboard.viewDetails')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{t('dashboard.prescriptions')}</h2>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t('dashboard.viewAll')}
              </Button>
            </div>

            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">{t('dashboard.noPrescriptions')}</p>
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map((prescription) => (
                  <Card key={prescription._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Prescription #{prescription._id.slice(-6)}
                          </CardTitle>
                          <CardDescription>
                            By Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName} • {' '}
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">{t('dashboard.medicines')}</h4>
                        <ul className="space-y-1">
                          {prescription.medicines?.map((medicine, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              {medicine.name} - {medicine.dosage}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          {t('dashboard.viewFullPrescription')}
                        </Button>
                        {prescription.status === 'active' && (
                          <Button size="sm">
                            <Pill className="h-4 w-4 mr-2" />
                            {t('dashboard.orderMedicines')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Orders</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={async () => {
                    setRefreshingOrders(true);
                    try {
                      const ordersRes = await fetch('http://localhost:5000/api/orders/patient', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      if (ordersRes.ok) {
                        const ordersJson = await ordersRes.json();
                        setOrders(ordersJson.data || []);
                      }
                    } catch (error) {

                    } finally {
                      setTimeout(() => setRefreshingOrders(false), 500);
                    }
                  }}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshingOrders ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button size="sm" variant="outline" onClick={handleNavigateToPharmacy}>
                  <Package className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No orders yet</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order #{order.orderNumber}
                          </CardTitle>
                          <CardDescription>
                            {getPharmacyName(order)} • ₹{order.totalAmount}
                            {order.pharmacyAddress && (
                              <><br /><span className="text-xs">{order.pharmacyAddress}</span></>
                            )}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusDisplay(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Medicines</h4>
                        <ul className="space-y-1">
                          {order.medicines?.slice(0, 2).map((medicine, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              {medicine.name} x{medicine.quantity}
                            </li>
                          ))}
                          {order.medicines?.length > 2 && (
                            <li className="text-sm text-muted-foreground">+{order.medicines.length - 2} more items</li>
                          )}
                        </ul>
                      </div>
                      {order.estimatedDeliveryTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Truck className="h-4 w-4" />
                          Estimated delivery: {order.estimatedDeliveryTime}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/order-tracking/${order._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                        {order.status === 'ready' && (
                          <Button size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Pharmacy
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>


        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{t('dashboard.medicalHistory')}</h2>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              {t('dashboard.downloadRecords')}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentMedicalActivity')}</CardTitle>
              <CardDescription>{t('dashboard.recentConsultations')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{t('dashboard.recentConsultation')}</h4>
                    <p className="text-sm text-muted-foreground">{t('dashboard.generalCheckup')}</p>
                    <p className="text-xs text-muted-foreground">
                      {appointments.length > 0 ? new Date(appointments[0]?.date).toLocaleDateString() : t('dashboard.noRecentActivity')}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    {t('dashboard.viewDetails')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AppointmentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
}