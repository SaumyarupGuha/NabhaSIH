import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useCart } from '../context/CartContext';
import { Search, Plus, Pill } from 'lucide-react';

export const MedicineSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { addToCart } = useCart();
  const dropdownRef = useRef(null);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://nabhasih-1.onrender.com/api/medicines/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      } else {
        // Fallback to static data
        const staticMedicines = [
          { _id: '1', name: 'Paracetamol 500mg', price: 15, category: 'Pain Relief', availability: 'In Stock' },
          { _id: '2', name: 'Crocin Advance', price: 25, category: 'Pain Relief', availability: 'In Stock' },
          { _id: '3', name: 'Vitamin D3', price: 120, category: 'Vitamins', availability: 'In Stock' },
          { _id: '4', name: 'ORS Packets', price: 8, category: 'Digestive', availability: 'In Stock' },
          { _id: '5', name: 'Amoxicillin 250mg', price: 85, category: 'Antibiotics', availability: 'In Stock' }
        ];
        const filtered = staticMedicines.filter(med => 
          med.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to static data
      const staticMedicines = [
        { _id: '1', name: 'Paracetamol 500mg', price: 15, category: 'Pain Relief', availability: 'In Stock' },
        { _id: '2', name: 'Crocin Advance', price: 25, category: 'Pain Relief', availability: 'In Stock' },
        { _id: '3', name: 'Vitamin D3', price: 120, category: 'Vitamins', availability: 'In Stock' }
      ];
      const filtered = staticMedicines.filter(med => 
        med.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines or pharmacy name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
          className="pl-10"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching medicines...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-2 border-b bg-gray-50">
                  <p className="text-xs font-medium text-gray-600">
                    Found {searchResults.length} medicines
                  </p>
                </div>
                {searchResults.map((medicine) => (
                  <div key={medicine._id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{medicine.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">₹{medicine.price}</p>
                        <Badge variant="outline" className="text-xs">{medicine.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          (medicine.inStock || medicine.availability === "In Stock")
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }
                      >
                        {medicine.inStock ? 'In Stock' : (medicine.availability || 'Out of Stock')}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => {
                          addToCart({
                            name: medicine.name,
                            price: `₹${medicine.price}`,
                            availability: medicine.inStock ? 'In Stock' : (medicine.availability || 'Out of Stock')
                          });
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <Pill className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p>No medicines found for "{searchQuery}"</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};