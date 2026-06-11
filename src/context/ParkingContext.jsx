import React, { createContext, useState, useEffect, useContext } from 'react';

const ParkingContext = createContext();

export const useParking = () => useContext(ParkingContext);

export const ParkingProvider = ({ children }) => {
  // Helper function to generate spots grid
  const generateSpots = (count, basePrice) => {
    const spotTypes = ["Standard", "Standard", "Standard", "EV Charging", "Disabled"];
    const rows = ["A", "B", "C", "D", "E", "F"];
    
    return Array.from({ length: count }, (_, i) => {
      const row = rows[Math.floor(i / (count / rows.length)) || 0];
      const num = (i % (count / rows.length)) + 1;
      const label = `${row}-${num < 10 ? '0' + num : num}`;
      const type = i % 8 === 0 ? "EV Charging" : (i % 12 === 0 ? "Disabled" : "Standard");
      
      // Randomly assign occupied state (65% filled on average)
      const isOccupied = Math.random() < 0.65;
      
      return {
        id: label,
        label,
        type,
        isOccupied,
        priceMultiplier: type === "EV Charging" ? 1.2 : (type === "Disabled" ? 0.9 : 1.0)
      };
    });
  };

  // User name (persisted in localStorage)
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('parkeasy_username') || 'Taqdimotchi';
  });

  const updateUserName = (name) => {
    setUserName(name);
    localStorage.setItem('parkeasy_username', name);
  };

  // User wallet balance (UZS)
  const [walletBalance, setWalletBalance] = useState(185000);
  
  // User cars
  const [cars, setCars] = useState([
    { id: 1, model: "Chevrolet BYD Song Plus", plate: "01 777 UZB" },
    { id: 2, model: "Chevrolet Gentra", plate: "01 A 123 AA" }
  ]);

  // List of parks in Tashkent and Guliston with coordinates, slots layout, prices, and amenities
  const [parks, setParks] = useState([
    {
      id: "tashkent-city",
      name: "Tashkent City Mall Parking",
      city: "tashkent",
      lat: 41.3122,
      lng: 69.2520,
      price: 15000, // UZS per hour
      totalSpots: 120,
      occupiedSpots: 78,
      type: "Yopiq (Indoor)",
      rating: 4.9,
      reviews: 412,
      amenities: ["EV Charging", "24/7 Security", "Lift", "Car Wash"],
      spots: generateSpots(40, 15000)
    },
    {
      id: "chorsu-bazaar",
      name: "Chorsu Bozor Ochiq Parkingi",
      city: "tashkent",
      lat: 41.3268,
      lng: 69.2312,
      price: 8000,
      totalSpots: 200,
      occupiedSpots: 165,
      type: "Ochiq (Outdoor)",
      rating: 4.1,
      reviews: 890,
      amenities: ["24/7 Security", "CCTV"],
      spots: generateSpots(50, 8000)
    },
    {
      id: "amir-temur",
      name: "Amir Temur Xiyoboni Osti Parkingi",
      city: "tashkent",
      lat: 41.3113,
      lng: 69.2797,
      price: 12000,
      totalSpots: 90,
      occupiedSpots: 42,
      type: "Yerosti (Underground)",
      rating: 4.8,
      reviews: 235,
      amenities: ["Lift", "Disabled Friendly", "CCTV"],
      spots: generateSpots(30, 12000)
    },
    {
      id: "chilonzor-hub",
      name: "Chilonzor Metro Park-and-Ride",
      city: "tashkent",
      lat: 41.2785,
      lng: 69.2050,
      price: 5000,
      totalSpots: 150,
      occupiedSpots: 60,
      type: "Ochiq (Outdoor)",
      rating: 4.4,
      reviews: 145,
      amenities: ["EV Charging", "Metro Access"],
      spots: generateSpots(36, 5000)
    },
    {
      id: "tashkent-airport",
      name: "Toshkent Aeroporti Premium",
      city: "tashkent",
      lat: 41.2628,
      lng: 69.2815,
      price: 20000,
      totalSpots: 80,
      occupiedSpots: 55,
      type: "Qisman yopiq",
      rating: 4.7,
      reviews: 580,
      amenities: ["Valet Service", "24/7 Security", "CCTV", "Luggage Carts"],
      spots: generateSpots(24, 20000)
    },
    // Guliston Parking Lots
    {
      id: "guliston-bozor",
      name: "Guliston Dehqon Bozori Parkingi",
      city: "guliston",
      lat: 40.4930,
      lng: 68.7830,
      price: 5000,
      totalSpots: 100,
      occupiedSpots: 72,
      type: "Ochiq (Outdoor)",
      rating: 4.3,
      reviews: 124,
      amenities: ["24/7 Security", "CCTV"],
      spots: generateSpots(24, 5000)
    },
    {
      id: "guliston-vokzal",
      name: "Guliston Vokzali Avtoturargohi",
      city: "guliston",
      lat: 40.4865,
      lng: 68.7810,
      price: 6000,
      totalSpots: 60,
      occupiedSpots: 45,
      type: "Yerosti (Underground)",
      rating: 4.5,
      reviews: 82,
      amenities: ["24/7 Security", "Lift", "CCTV"],
      spots: generateSpots(18, 6000)
    },
    {
      id: "guliston-yoshlar",
      name: "Yoshlar Markazi Markaziy Parking",
      city: "guliston",
      lat: 40.4905,
      lng: 68.7895,
      price: 4000,
      totalSpots: 80,
      occupiedSpots: 30,
      type: "Ochiq (Outdoor)",
      rating: 4.7,
      reviews: 45,
      amenities: ["EV Charging", "Disabled Friendly", "CCTV"],
      spots: generateSpots(20, 4000)
    }
  ]);

  // Bookings list
  const [bookings, setBookings] = useState([
    {
      id: "BK-8291",
      parkingId: "tashkent-city",
      parkingName: "Tashkent City Mall Parking",
      spotLabel: "A-12",
      spotType: "EV Charging",
      startTime: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
      endTime: new Date(Date.now() + 3600000 * 1.5).toISOString(), // 1.5 hours from now
      totalHours: 3,
      totalPrice: 45000,
      carPlate: "01 777 UZB",
      status: "active",
      code: "PE-8291-CITY",
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
    },
    {
      id: "BK-4321",
      parkingId: "chorsu-bazaar",
      parkingName: "Chorsu Bozor Ochiq Parkingi",
      spotLabel: "C-05",
      spotType: "Standard",
      startTime: new Date(Date.now() - 3600000 * 24).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 22).toISOString(),
      totalHours: 2,
      totalPrice: 16000,
      carPlate: "01 A 123 AA",
      status: "completed",
      code: "PE-4321-CHORSU",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ]);

  // Booking actions
  const bookSpot = (parkingId, spotId, carPlate, hours) => {
    const parking = parks.find(p => p.id === parkingId);
    if (!parking) return { success: false, error: "Parking topilmadi" };

    const spot = parking.spots.find(s => s.id === spotId);
    if (!spot) return { success: false, error: "Joy topilmadi" };
    if (spot.isOccupied) return { success: false, error: "Bu joy band qilingan" };

    const cost = Math.round(parking.price * spot.priceMultiplier * hours);
    if (walletBalance < cost) {
      return { success: false, error: "Hamyoningizda yetarli mablag' mavjud emas!" };
    }

    // Deduct wallet
    setWalletBalance(prev => prev - cost);

    // Book spot - toggle state
    setParks(prevParks => prevParks.map(p => {
      if (p.id === parkingId) {
        return {
          ...p,
          occupiedSpots: p.occupiedSpots + 1,
          spots: p.spots.map(s => s.id === spotId ? { ...s, isOccupied: true } : s)
        };
      }
      return p;
    }));

    // Create ticket
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      parkingId,
      parkingName: parking.name,
      spotLabel: spot.label,
      spotType: spot.type,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000 * hours).toISOString(),
      totalHours: hours,
      totalPrice: cost,
      carPlate,
      status: "active",
      code: `PE-${bookingId.split('-')[1]}-${parking.id.substring(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    return { success: true, booking: newBooking };
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: "Bron topilmadi" };
    if (booking.status !== "active") return { success: false, error: "Bu bronni bekor qilib bo'lmaydi" };

    // Refund 70% of money
    const refundAmount = Math.round(booking.totalPrice * 0.7);
    setWalletBalance(prev => prev + refundAmount);

    // Free the spot
    setParks(prevParks => prevParks.map(p => {
      if (p.id === booking.parkingId) {
        return {
          ...p,
          occupiedSpots: Math.max(0, p.occupiedSpots - 1),
          spots: p.spots.map(s => s.label === booking.spotLabel ? { ...s, isOccupied: false } : s)
        };
      }
      return p;
    }));

    // Mark status cancelled
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    return { success: true, refundAmount };
  };

  const extendBooking = (bookingId, additionalHours) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: "Bron topilmadi" };
    if (booking.status !== "active") return { success: false, error: "Bron faol emas" };

    const parking = parks.find(p => p.id === booking.parkingId);
    const hourlyRate = parking ? parking.price : 10000;
    
    // Calculate cost
    const cost = Math.round(hourlyRate * additionalHours);
    if (walletBalance < cost) {
      return { success: false, error: "Balans yetarli emas" };
    }

    // Deduct wallet
    setWalletBalance(prev => prev - cost);

    // Update ticket
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const newEndTime = new Date(new Date(b.endTime).getTime() + 3600000 * additionalHours).toISOString();
        return {
          ...b,
          endTime: newEndTime,
          totalHours: b.totalHours + additionalHours,
          totalPrice: b.totalPrice + cost
        };
      }
      return b;
    }));

    return { success: true, cost };
  };

  // Wallet top-up
  const topUpWallet = (amount) => {
    setWalletBalance(prev => prev + amount);
    return true;
  };

  // Vehicle management
  const addCar = (model, plate) => {
    if (!model || !plate) return false;
    const newCar = {
      id: Date.now(),
      model,
      plate: plate.toUpperCase()
    };
    setCars(prev => [...prev, newCar]);
    return true;
  };

  const deleteCar = (carId) => {
    setCars(prev => prev.filter(c => c.id !== carId));
    return true;
  };

  // Toggle spot occupancy (sensor dynamic demonstration)
  const toggleSpotOccupancy = (parkingId, spotId) => {
    setParks(prevParks => prevParks.map(p => {
      if (p.id === parkingId) {
        const spot = p.spots.find(s => s.id === spotId);
        const willBeOccupied = !spot.isOccupied;
        return {
          ...p,
          occupiedSpots: p.occupiedSpots + (willBeOccupied ? 1 : -1),
          spots: p.spots.map(s => s.id === spotId ? { ...s, isOccupied: willBeOccupied } : s)
        };
      }
      return p;
    }));
  };

  return (
    <ParkingContext.Provider value={{
      userName,
      updateUserName,
      walletBalance,
      cars,
      parks,
      bookings,
      bookSpot,
      cancelBooking,
      extendBooking,
      topUpWallet,
      addCar,
      deleteCar,
      toggleSpotOccupancy
    }}>
      {children}
    </ParkingContext.Provider>
  );
};
