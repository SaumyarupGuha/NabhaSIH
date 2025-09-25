import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Phone, PhoneOff, User } from 'lucide-react';

const IncomingCallModal = ({ isOpen, callData, onAccept, onReject }) => {
  if (!isOpen || !callData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">Incoming Video Call</CardTitle>
          <p className="text-lg font-semibold text-primary">
            Dr. {callData.doctor.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {callData.doctor.specialization}
          </p>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="flex justify-center space-x-6 mt-6">
            <Button
              onClick={onReject}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
            
            <Button
              onClick={onAccept}
              variant="default"
              size="lg"
              className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-8 w-8" />
            </Button>
          </div>
          
          <div className="flex justify-center space-x-4 mt-4 text-sm text-muted-foreground">
            <span>Decline</span>
            <span>Accept</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomingCallModal;