import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParking } from '../context/ParkingContext';
import { Search, SlidersHorizontal, MapPin, BatteryCharging, Shield, Star, Car, Clock, Check, CreditCard, ChevronRight, X, AlertCircle } from 'lucide-react';
import * as L from 'leaflet';

const FindParking = () => {
  const { parks, cars, bookSpot } = useParking();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [selectedCity, setSelectedCity] = useState('tashkent');
  const [selectedPark, setSelectedPark] = useState(parks[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEV, setFilterEV] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(25000);
  
  // Booking state
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedCar, setSelectedCar] = useState(cars[0]?.plate || '');
  const [bookingHours, setBookingHours] = useState(2);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    const cityParks = parks.filter(p => p.city === city);
    if (cityParks.length > 0) {
      setSelectedPark(cityParks[0]);
      setSelectedSpot(null);
    }
  };

  // Read state passed from Home redirect
  useEffect(() => {
    if (location.state && location.state.selectedParkId) {
      const park = parks.find(p => p.id === location.state.selectedParkId);
      if (park) {
        setSelectedCity(park.city || 'tashkent');
        setSelectedPark(park);
        setSelectedSpot(null);
      }
    }
  }, [location.state, parks]);

  // Set default car plate when cars load
  useEffect(() => {
    if (cars.length > 0 && !selectedCar) {
      setSelectedCar(cars[0].plate);
    }
  }, [cars, selectedCar]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy existing map instance to avoid re-initialization errors
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      // Initialize map centered at selected parking or Tashkent center
      const centerLat = selectedPark ? selectedPark.lat : 41.3113;
      const centerLng = selectedPark ? selectedPark.lng : 69.2797;
      
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([centerLat, centerLng], 14);

      // Add a dark modern map tile layer (CartoDB Dark Matter is perfect)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Add custom zoom control
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstance.current);

      markersGroup.current = L.layerGroup().addTo(mapInstance.current);

      // Render markers
      renderMarkers();
    } catch (err) {
      console.error("Leaflet initialization failed", err);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update map view when selected park changes
  useEffect(() => {
    if (mapInstance.current && selectedPark) {
      mapInstance.current.setView([selectedPark.lat, selectedPark.lng], 15, {
        animate: true,
        duration: 1.0
      });
      renderMarkers();
    }
  }, [selectedPark]);

  // Update markers when filters or parks state changes
  useEffect(() => {
    renderMarkers();
  }, [searchQuery, filterEV, filterType, maxPrice, parks]);

  // Custom function to render markers with custom SVG icons
  const renderMarkers = () => {
    if (!mapInstance.current || !markersGroup.current) return;

    markersGroup.current.clearLayers();

    const filtered = getFilteredParks();

    filtered.forEach(park => {
      const isSelected = selectedPark && selectedPark.id === park.id;
      const available = park.totalSpots - park.occupiedSpots;

      // Custom HTML Marker using glowing SVGs
      const markerHtml = `
        <div class="custom-leaflet-marker ${isSelected ? 'active' : ''}">
          <div class="marker-glow"></div>
          <div class="marker-core">
            <span class="marker-price">${Math.round(park.price / 1000)}k</span>
          </div>
          <div class="marker-label">${park.name.split(' ')[0]}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const marker = L.marker([park.lat, park.lng], { icon: customIcon });
      
      marker.on('click', () => {
        setSelectedPark(park);
        setSelectedSpot(null);
      });

      markersGroup.current.addLayer(marker);
    });
  };

  // Filter logic
  const getFilteredParks = () => {
    return parks.filter(park => {
      // City Filter
      if (park.city !== selectedCity) {
        return false;
      }
      // Text search
      if (searchQuery && !park.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // EV Filter
      if (filterEV && !park.amenities.includes("EV Charging")) {
        return false;
      }
      // Type Filter
      if (filterType !== 'All') {
        if (filterType === 'Indoor' && !park.type.toLowerCase().includes('yopiq')) return false;
        if (filterType === 'Outdoor' && !park.type.toLowerCase().includes('ochiq')) return false;
        if (filterType === 'Underground' && !park.type.toLowerCase().includes('osti')) return false;
      }
      // Price Filter
      if (park.price > maxPrice) {
        return false;
      }
      return true;
    });
  };

  // Handle spot selection
  const handleSpotClick = (spot) => {
    if (spot.isOccupied) return;
    setSelectedSpot(selectedSpot?.id === spot.id ? null : spot);
  };

  // Booking Checkout process
  const handleCheckoutSubmit = () => {
    if (!selectedSpot || !selectedCar) return;
    
    setCheckoutStatus('processing');
    
    // Simulate transaction delay
    setTimeout(() => {
      const result = bookSpot(selectedPark.id, selectedSpot.id, selectedCar, bookingHours);
      
      if (result.success) {
        setCheckoutStatus('success');
        setTimeout(() => {
          setShowCheckout(false);
          setCheckoutStatus('idle');
          setSelectedSpot(null);
          // Redirect to Bookings page
          navigate('/bookings');
        }, 2000);
      } else {
        setCheckoutStatus('error');
        setErrorMessage(result.error);
      }
    }, 2500);
  };

  const selectedSpotPrice = selectedSpot 
    ? Math.round(selectedPark.price * selectedSpot.priceMultiplier * bookingHours)
    : 0;

  return (
    <div className="find-parking-page animate-slide-up">
      
      {/* Top Filter and Search Bar */}
      <div className="search-filter-bar glass">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Parking nomini kiriting..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && <X size={18} className="clear-icon" onClick={() => setSearchQuery('')} />}
        </div>
        
        <div className="filters-container">
          {/* City Selector */}
          <div className="filter-select-wrapper">
            <select 
              value={selectedCity} 
              onChange={(e) => handleCityChange(e.target.value)} 
              className="filter-select"
              style={{ borderColor: 'var(--color-primary)', boxShadow: '0 0 5px rgba(0, 242, 254, 0.2)', fontWeight: 'bold' }}
            >
              <option value="tashkent">🏙️ Toshkent xaritasi</option>
              <option value="guliston">🌳 Guliston xaritasi</option>
            </select>
          </div>

          {/* Parking Type Selector */}
          <div className="filter-select-wrapper">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="All">Barcha turlar</option>
              <option value="Indoor">Yopiq</option>
              <option value="Outdoor">Ochiq</option>
              <option value="Underground">Yerosti</option>
            </select>
          </div>

          {/* EV Charging Checkbox Toggle */}
          <button 
            className={`filter-btn ${filterEV ? 'active' : ''}`}
            onClick={() => setFilterEV(!filterEV)}
          >
            <BatteryCharging size={16} /> EV Zaryadlash
          </button>

          {/* Price Range Slider */}
          <div className="price-slider-container">
            <span className="slider-label">Maks: {maxPrice.toLocaleString()} UZS</span>
            <input 
              type="range" 
              min="5000" 
              max="25000" 
              step="1000" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
            />
          </div>
        </div>
      </div>

      <div className="content-layout">
        
        {/* Left Panel: Search Results & Spot Selection */}
        <div className="left-panel">
          
          {/* Selected Parking details card */}
          {selectedPark ? (
            <div className="park-detail-card glass-glow animate-slide-up">
              <div className="detail-header">
                <div className="title-area">
                  <span className="type-badge">{selectedPark.type}</span>
                  <h2>{selectedPark.name}</h2>
                  <div className="rating-row">
                    <Star size={14} className="star-icon" />
                    <span>{selectedPark.rating} ({selectedPark.reviews} sharhlar)</span>
                  </div>
                </div>
                <button className="close-detail-btn" onClick={() => setSelectedPark(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="detail-info-grid">
                <div className="info-stat">
                  <span className="label">Soatbay tarif</span>
                  <span className="value">{selectedPark.price.toLocaleString('uz-UZ')} UZS</span>
                </div>
                <div className="info-stat">
                  <span className="label">Bo'sh joylar</span>
                  <span className="value success">{selectedPark.totalSpots - selectedPark.occupiedSpots} / {selectedPark.totalSpots}</span>
                </div>
              </div>

              <div className="amenities-row">
                {selectedPark.amenities.map((a, i) => (
                  <span key={i} className="amenity-item">
                    <Check size={12} className="check-icon" /> {a}
                  </span>
                ))}
              </div>

              {/* Spot Grid selector */}
              <div className="spot-selection-section">
                <div className="spot-section-header">
                  <h3>Bo'sh joyni tanlang:</h3>
                  <div className="legend">
                    <span className="legend-item"><span className="legend-dot green"></span> Bo'sh</span>
                    <span className="legend-item"><span className="legend-dot red"></span> Band</span>
                    <span className="legend-item"><span className="legend-dot blue"></span> Tanlangan</span>
                  </div>
                </div>

                <div className="spots-grid">
                  {selectedPark.spots.map((spot) => {
                    const isSpotSelected = selectedSpot?.id === spot.id;
                    return (
                      <button
                        key={spot.id}
                        className={`spot-btn ${spot.isOccupied ? 'occupied' : ''} ${isSpotSelected ? 'selected' : ''}`}
                        disabled={spot.isOccupied}
                        onClick={() => handleSpotClick(spot)}
                        title={`${spot.label} (${spot.type})`}
                      >
                        <span className="spot-label">{spot.label}</span>
                        {spot.type === "EV Charging" && <BatteryCharging size={10} className="spot-ev-icon" />}
                        {spot.type === "Disabled" && <span className="spot-wheelchair">♿</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Confirmation Action bar */}
              {selectedSpot && (
                <div className="spot-action-bar glass animate-slide-up">
                  <div className="booking-params">
                    <div className="param-group">
                      <label><Clock size={14} /> Vaqt (soat)</label>
                      <select value={bookingHours} onChange={(e) => setBookingHours(Number(e.target.value))}>
                        <option value={1}>1 soat</option>
                        <option value={2}>2 soat</option>
                        <option value={3}>3 soat</option>
                        <option value={4}>4 soat</option>
                        <option value={6}>6 soat</option>
                        <option value={12}>12 soat</option>
                        <option value={24}>24 soat</option>
                      </select>
                    </div>

                    <div className="param-group">
                      <label><Car size={14} /> Avtomobil</label>
                      {cars.length > 0 ? (
                        <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)}>
                          {cars.map((c) => (
                            <option key={c.id} value={c.plate}>{c.model} ({c.plate})</option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-cars-warning" onClick={() => navigate('/profile')}>
                          Mashina qo'shish +
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="summary-text">
                      <span className="spot-indicator">{selectedSpot.label} joyi</span>
                      <span className="price">{selectedSpotPrice.toLocaleString()} UZS</span>
                    </div>
                    <button 
                      className="btn btn-primary book-submit-btn" 
                      onClick={() => setShowCheckout(true)}
                      disabled={cars.length === 0}
                    >
                      Bron qilish <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Parking lots list view */
            <div className="parking-list-panel glass">
              <div className="list-header">
                <h2>Yaqin atrofdagi parkinglar</h2>
                <span className="count-badge">{getFilteredParks().length} ta topildi</span>
              </div>
              <div className="parking-list-scroll">
                {getFilteredParks().map((park) => {
                  const available = park.totalSpots - park.occupiedSpots;
                  return (
                    <div 
                      key={park.id} 
                      className="list-item"
                      onClick={() => {
                        setSelectedPark(park);
                        setSelectedSpot(null);
                      }}
                    >
                      <div className="item-body">
                        <h4>{park.name}</h4>
                        <div className="item-meta">
                          <span>{park.type}</span>
                          <span>•</span>
                          <span className="item-rating">★ {park.rating}</span>
                        </div>
                        <div className="item-spots-left">
                          🟢 {available} ta bo'sh joy qoldi
                        </div>
                      </div>
                      <div className="item-right">
                        <span className="item-price">{park.price.toLocaleString()} UZS</span>
                        <span className="item-unit">/soat</span>
                      </div>
                    </div>
                  );
                })}
                {getFilteredParks().length === 0 && (
                  <div className="empty-results">
                    <AlertCircle size={32} />
                    <p>Izlash shartlariga mos parking topilmadi.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Leaflet Map Container */}
        <div className="right-panel">
          <div id="map-container" ref={mapRef} className="glass"></div>
        </div>
      </div>

      {/* Checkout Payment Animation Modal Overlay */}
      {showCheckout && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal glass-glow animate-slide-up">
            <button className="close-checkout" onClick={() => setShowCheckout(false)}>
              <X size={18} />
            </button>

            {checkoutStatus === 'idle' && (
              <div className="checkout-content">
                <h2>To'lovni tasdiqlang</h2>
                <p className="checkout-subtitle">Xavfsiz to'lov tizimi orqali bron qilish</p>

                <div className="checkout-receipt glass">
                  <div className="receipt-row">
                    <span>Parking:</span>
                    <strong>{selectedPark.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Joy:</span>
                    <strong>{selectedSpot.label} ({selectedSpot.type})</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Avtomobil raqami:</span>
                    <strong>{selectedCar}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Davomiyligi:</span>
                    <strong>{bookingHours} soat</strong>
                  </div>
                  <div className="receipt-row total">
                    <span>Jami summasi:</span>
                    <strong>{selectedSpotPrice.toLocaleString()} UZS</strong>
                  </div>
                </div>

                <div className="payment-options">
                  <div className="payment-method active">
                    <CreditCard size={18} />
                    <span>ParkEasy Shaxsiy Hamyon</span>
                  </div>
                </div>

                <button className="btn btn-primary confirm-pay-btn" onClick={handleCheckoutSubmit}>
                  To'lash va Tasdiqlash
                </button>
              </div>
            )}

            {checkoutStatus === 'processing' && (
              <div className="checkout-processing">
                <div className="spinner-glow animate-pulse-glow">
                  <div className="spinner-core"></div>
                </div>
                <h3>Tranzaksiya bajarilmoqda...</h3>
                <p>Mablag' hisobdan yechilmoqda va joy band qilinmoqda.</p>
              </div>
            )}

            {checkoutStatus === 'success' && (
              <div className="checkout-success">
                <div className="success-badge-glow">
                  <Check size={40} className="success-check-icon" />
                </div>
                <h3>Muvaffaqiyatli band qilindi!</h3>
                <p>Parking joyi band qilindi. Kvitansiya generatsiya qilindi.</p>
              </div>
            )}

            {checkoutStatus === 'error' && (
              <div className="checkout-error">
                <AlertCircle size={40} className="error-icon" />
                <h3>To'lov amalga oshmadi</h3>
                <p className="error-msg">{errorMessage}</p>
                <button className="btn btn-secondary" onClick={() => setShowCheckout(false)}>
                  Orqaga qaytish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Stylesheet embedded in component */}
      <style>{`
        .find-parking-page {
          height: calc(100vh - 4rem);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
        }

        /* Top search and filter bar */
        .search-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-input-wrapper input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.9rem;
          margin-left: 0.5rem;
          width: 100%;
        }

        .search-input-wrapper input:focus {
          outline: none;
        }

        .clear-icon {
          cursor: pointer;
          color: var(--text-muted);
        }

        .filters-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }

        .filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          padding: 0.55rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .filter-btn.active {
          background: rgba(0, 242, 254, 0.1);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .price-slider-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .price-slider {
          -webkit-appearance: none;
          width: 120px;
          height: 4px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }

        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          box-shadow: 0 0 8px var(--color-primary);
        }

        /* Layout panels */
        .content-layout {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 1.5rem;
          flex: 1;
          min-height: 0; /* Important for flex scrolling */
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .right-panel {
          position: relative;
          height: 100%;
        }

        #map-container {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          z-index: 10;
        }

        /* Parking list view */
        .parking-list-panel {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          height: 100%;
          overflow: hidden;
        }

        .list-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .count-badge {
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          color: var(--color-primary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .parking-list-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .list-item:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .item-body h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .item-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .item-rating {
          color: var(--color-warning);
          font-weight: 500;
        }

        .item-spots-left {
          font-size: 0.8rem;
          color: var(--color-success);
          margin-top: 0.4rem;
          font-weight: 500;
        }

        .item-right {
          text-align: right;
        }

        .item-price {
          color: var(--color-primary);
          font-weight: 700;
          font-family: var(--font-heading);
        }

        .item-unit {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          gap: 0.75rem;
          text-align: center;
        }

        /* Detail card view */
        .park-detail-card {
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          overflow-y: auto;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .title-area h2 {
          font-size: 1.35rem;
          line-height: 1.25;
          margin-top: 0.4rem;
        }

        .type-badge {
          background: rgba(255,255,255,0.05);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .star-icon {
          color: var(--color-warning);
          fill: var(--color-warning);
        }

        .close-detail-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-muted);
          padding: 0.4rem;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .close-detail-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .detail-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          background: rgba(0,0,0,0.15);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
        }

        .info-stat {
          display: flex;
          flex-direction: column;
        }

        .info-stat .label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .info-stat .value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary);
          font-family: var(--font-heading);
        }

        .info-stat .value.success {
          color: var(--color-success);
        }

        .amenities-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .amenity-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .check-icon {
          color: var(--color-success);
        }

        /* Spots layout design */
        .spot-selection-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid var(--border-light);
          padding-top: 1rem;
        }

        .spot-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .spot-section-header h3 {
          font-size: 0.95rem;
        }

        .legend {
          display: flex;
          gap: 0.5rem;
          font-size: 0.7rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .legend-dot.green { background: var(--color-success); }
        .legend-dot.red { background: var(--color-danger); }
        .legend-dot.blue { background: var(--color-primary); }

        .spots-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.4rem;
          padding: 0.5rem;
          background: rgba(0,0,0,0.15);
          border-radius: var(--radius-sm);
        }

        .spot-btn {
          aspect-ratio: 1.1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.08);
          color: var(--color-success);
          cursor: pointer;
          transition: var(--transition-fast);
          position: relative;
        }

        .spot-btn:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: scale(1.05);
        }

        .spot-btn.occupied {
          background: rgba(244, 63, 94, 0.06);
          border-color: rgba(244, 63, 94, 0.2);
          color: rgba(244, 63, 94, 0.4);
          cursor: not-allowed;
        }

        .spot-btn.selected {
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          border-color: var(--color-primary);
          color: #0b0f17;
          box-shadow: 0 0 10px rgba(0,242,254,0.4);
        }

        .spot-ev-icon {
          position: absolute;
          top: 2px;
          right: 2px;
          color: inherit;
        }

        .spot-wheelchair {
          position: absolute;
          bottom: 2px;
          font-size: 8px;
        }

        /* Spot booking action bar overlay details */
        .spot-action-bar {
          margin-top: auto;
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .booking-params {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 0.75rem;
        }

        .param-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .param-group label {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .param-group select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          padding: 0.4rem;
          border-radius: 4px;
          font-family: var(--font-body);
          font-size: 0.8rem;
          outline: none;
        }

        .no-cars-warning {
          border: 1px dashed var(--color-warning);
          color: var(--color-warning);
          font-size: 0.8rem;
          padding: 0.4rem;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;
        }

        .booking-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.75rem;
        }

        .summary-text {
          display: flex;
          flex-direction: column;
        }

        .spot-indicator {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .booking-summary .price {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-primary);
          font-family: var(--font-heading);
        }

        .book-submit-btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.9rem;
        }

        /* Custom Leaflet Markers styles */
        .custom-leaflet-marker {
          width: 40px;
          height: 40px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .marker-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0, 242, 254, 0.2);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
          transition: var(--transition-smooth);
        }

        .custom-leaflet-marker.active .marker-glow {
          background: rgba(157, 78, 221, 0.3);
          box-shadow: 0 0 20px rgba(157, 78, 221, 0.6);
        }

        .marker-core {
          position: absolute;
          width: 30px;
          height: 30px;
          background: var(--bg-card-solid);
          border: 2px solid var(--color-primary);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-leaflet-marker.active .marker-core {
          border-color: var(--color-secondary);
        }

        .marker-price {
          transform: rotate(45deg);
          color: var(--text-primary);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.75rem;
        }

        .marker-label {
          position: absolute;
          top: 42px;
          background: rgba(0, 0, 0, 0.75);
          color: white;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          white-space: nowrap;
          border: 1px solid var(--border-light);
          pointer-events: none;
        }

        /* Checkout Modal styles */
        .checkout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 1rem;
        }

        .checkout-modal {
          width: 100%;
          max-width: 440px;
          padding: 2.25rem;
          border-radius: var(--radius-lg);
          position: relative;
        }

        .close-checkout {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .checkout-content h2 {
          font-size: 1.5rem;
          text-align: center;
        }

        .checkout-subtitle {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-top: 0.2rem;
          margin-bottom: 1.5rem;
        }

        .checkout-receipt {
          padding: 1.25rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .receipt-row strong {
          color: var(--text-primary);
        }

        .receipt-row.total {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 0.75rem;
          font-size: 1rem;
        }

        .receipt-row.total strong {
          color: var(--color-primary);
          font-size: 1.2rem;
          font-family: var(--font-heading);
        }

        .payment-options {
          margin-bottom: 1.5rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.3);
          color: var(--color-primary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .confirm-pay-btn {
          width: 100%;
          padding: 0.85rem;
        }

        /* Processing animation screen */
        .checkout-processing {
          text-align: center;
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .spinner-glow {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(0, 242, 254, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .spinner-core {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: var(--color-primary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Success & error screens */
        .checkout-success, .checkout-error {
          text-align: center;
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .success-badge-glow {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid var(--color-success);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-check-icon {
          color: var(--color-success);
        }

        .error-icon {
          color: var(--color-danger);
          filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.4));
        }

        .error-msg {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* Responsive Layout styling */
        @media (max-width: 992px) {
          .content-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto 400px;
            height: auto;
          }
          .left-panel {
            height: auto;
          }
          .find-parking-page {
            height: auto;
          }
          #map-container {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default FindParking;
