import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { appointmentAPI } from '../lib/api';
import { X, Plus, Trash2 } from 'lucide-react';

export function ConsultationModal({ appointment, onClose, onComplete }) {
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  });
  const [loading, setLoading] = useState(false);

  const addMedicine = () => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: [...prescriptionData.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = prescriptionData.medicines.filter((_, i) => i !== index);
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const handleComplete = async () => {
    if (!prescriptionData.diagnosis.trim()) {
      alert('Please enter a diagnosis');
      return;
    }

    setLoading(true);
    try {
      await appointmentAPI.completeConsultation(appointment._id, prescriptionData);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing consultation:', error);
      alert('Error completing consultation');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Complete Consultation</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Patient Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {appointment.patient.firstName} {appointment.patient.lastName}</p>
                <p><strong>Age:</strong> {appointment.patient.age} years</p>
                <p><strong>Gender:</strong> {appointment.patient.gender}</p>
              </div>
              <div>
                <p><strong>Phone:</strong> {appointment.patient.phone}</p>
                <p><strong>Village:</strong> {appointment.patient.village}</p>
                <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Textarea
              id="diagnosis"
              placeholder="Enter diagnosis..."
              value={prescriptionData.diagnosis}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Prescription</Label>
              <Button type="button" onClick={addMedicine} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>
            
            <div className="space-y-4">
              {prescriptionData.medicines.map((medicine, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Medicine {index + 1}</h4>
                    {prescriptionData.medicines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedicine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Medicine Name</Label>
                      <Input
                        placeholder="e.g., Paracetamol"
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Input
                        placeholder="e.g., 3 times a day"
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 5 days"
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Label>Instructions</Label>
                    <Input
                      placeholder="e.g., Take after meals"
                      value={medicine.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or recommendations..."
              value={prescriptionData.notes}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleComplete} disabled={loading} className="flex-1">
              {loading ? 'Completing...' : 'Complete Consultation'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}