import React, { createContext, useState, useContext } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  // Sample court locations - these would be configured per courthouse
  const courtLocations = [
    {
      id: 'main-courthouse',
      name: 'Main County Courthouse',
      address: '123 Court Street, City, State 12345',
      phone: '(555) 123-4567',
      facilitatorRoom: 'Room 113',
      clerkOffice: '1st Floor, Room 101',
      hours: 'Monday - Friday: 8:00 AM - 4:00 PM'
    },
    {
      id: 'north-branch',
      name: 'North Branch Courthouse',
      address: '456 North Avenue, City, State 12345',
      phone: '(555) 234-5678',
      facilitatorRoom: 'Room 205',
      clerkOffice: '2nd Floor, Room 201',
      hours: 'Monday - Friday: 8:00 AM - 4:00 PM'
    },
    {
      id: 'south-branch',
      name: 'South Branch Courthouse',
      address: '789 South Boulevard, City, State 12345',
      phone: '(555) 345-6789',
      facilitatorRoom: 'Room 102',
      clerkOffice: '1st Floor, Room 105',
      hours: 'Monday - Friday: 8:00 AM - 4:00 PM'
    }
  ];

  // Detect if running in kiosk mode (you can set this via environment variable)
  const isKioskMode = process.env.REACT_APP_KIOSK_MODE === 'true';
  
  // Default location for kiosk mode (would be set per courthouse)
  const defaultKioskLocation = courtLocations[0];
  
  const [currentLocation, setCurrentLocation] = useState(
    isKioskMode ? defaultKioskLocation : null
  );

  const value = {
    currentLocation,
    setCurrentLocation,
    courtLocations,
    isKioskMode
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext }; 