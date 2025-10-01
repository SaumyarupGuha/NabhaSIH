import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { AlertCircle, Plus } from 'lucide-react';

export const AlternativeMedicines = ({ medicine, onAddAlternative }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const fetchAlternatives = async () => {
    if (alternatives.length > 0) {
      setShowAlternatives(!showAlternatives);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/alternatives/${encodeURIComponent(medicine.name)}`);
      const data = await response.json();
      
      if (data.success && data.data.alternatives.length > 0) {
        setAlternatives(data.data.alternatives);
        setShowAlternatives(true);
      } else {
        setAlternatives([]);
        setShowAlternatives(true);
      }
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  if (medicine.availability === "In Stock") {
    return null;
  }

  return (
    <div className="mt-2">
      <Button
        size="sm"
        variant="outline"
        onClick={fetchAlternatives}
        disabled={loading}
        className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
      >
        <AlertCircle className="h-3 w-3 mr-1" />
        {loading ? 'Loading...' : showAlternatives ? 'Hide Alternatives' : 'Show Alternatives'}
      </Button>
      
      {showAlternatives && (
        <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
          {alternatives.length > 0 ? (
            <div>
              <p className="text-xs text-orange-700 mb-2">Available alternatives:</p>
              <div className="space-y-1">
                {alternatives.slice(0, 3).map((alt, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-orange-800">{alt}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddAlternative({ 
                        name: alt, 
                        price: medicine.price, 
                        availability: "In Stock" 
                      })}
                      className="h-6 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-orange-600">No alternatives found for this medicine.</p>
          )}
        </div>
      )}
    </div>
  );
};