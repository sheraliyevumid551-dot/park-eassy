import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParking } from '../context/ParkingContext';
import { MapPin, Navigation, Compass, Heart, Shield, Award, Sparkles, BatteryCharging, ArrowRight } from 'lucide-react';

const Home = () => {
  const { userName, parks, bookings, walletBalance } = useParking();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate live statistics
  const totalFreeSpots = parks.reduce((acc, p) => acc + (p.totalSpots - p.occupiedSpots), 0);
  const activeReservations = bookings.filter(b => b.status === 'active').length;
  const recommendedParks = [...parks].sort((a, b) => b.rating - a.rating).slice(0, 3);

  const filteredParks = searchQuery 
    ? parks.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : recommendedParks;

  return (
    <div className="home-page animate-slide-up">
      {/* Hero Header */}
      <header className="hero-section glass-glow">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="badge badge-primary">
              <Sparkles size={12} style={{ marginRight: '4px' }} /> Demo Day maxsus nashri
            </span>
          </div>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '-0.5rem', fontFamily: 'var(--font-heading)' }}>Salom, {userName}! 👋</h2>
          <h1>Parking joyini <br /><span className="highlight-text">1 soniyada band qiling</span></h1>
          <p>
            Ortiqcha aylanib vaqt yo'qotmang. Toshkent va Guliston shaharlaridagi bo'sh joylarni interaktiv xaritada kuzating, 
            narxlarni taqqoslang va smartfoningizda bir tugma orqali bron qiling.
          </p>
          <div className="search-box glass">
            <Compass className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Qaysi hududdan parking qidiryapsiz? (Masalan: Tashkent City...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => navigate('/map')}>
              Izlash <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-visual">
          {/* Animated Mock Dashboard / UI Preview */}
          <div className="mock-map-card glass">
            <div className="mock-map-header">
              <span className="mock-dot-red"></span>
              <span className="mock-dot-yellow"></span>
              <span className="mock-dot-green"></span>
              <span className="mock-map-title">Toshkent Xaritasi (Live)</span>
            </div>
            <div className="mock-map-body">
              <div className="pulse-marker p1">
                <span className="pulse-ping"></span>
                <span className="pulse-core"></span>
              </div>
              <div className="pulse-marker p2">
                <span className="pulse-ping purple"></span>
                <span className="pulse-core purple"></span>
              </div>
              <div className="pulse-marker p3">
                <span className="pulse-ping"></span>
                <span className="pulse-core"></span>
              </div>
              <div className="mock-overlay-card glass-glow">
                <div className="overlay-header">
                  <span className="overlay-tag">Tashkent City</span>
                  <span className="overlay-price">15k UZS/soat</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <div className="overlay-footer">
                  <span>🟢 42 Bo'sh joy</span>
                  <span>90% Xavfsizlik</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live Stats Row */}
      <section className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper blue">
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{parks.length}</span>
            <span className="stat-desc">Parking Hududlari</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper green">
            <BatteryCharging size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalFreeSpots}</span>
            <span className="stat-desc">Hozirgi Bo'sh Joylar</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper purple">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{activeReservations}</span>
            <span className="stat-desc">Faol Bronlaringiz</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper yellow">
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{walletBalance.toLocaleString('uz-UZ')} UZS</span>
            <span className="stat-desc">Hamyon Balansi</span>
          </div>
        </div>
      </section>

      {/* Suggested / Filtered Parkings */}
      <section className="recommended-section">
        <div className="section-header">
          <div>
            <h2>{searchQuery ? "Qidiruv natijalari" : "Tavsiya etiladigan parkinglar"}</h2>
            <p className="section-subtitle">Eng yuqori reytingli va qulay parking joylari</p>
          </div>
          <Link to="/map" className="btn btn-secondary text-btn">
            Barchasini ko'rish <ArrowRight size={16} />
          </Link>
        </div>

        <div className="parking-cards-grid">
          {filteredParks.map((park) => {
            const available = park.totalSpots - park.occupiedSpots;
            const percentage = Math.round((available / park.totalSpots) * 100);
            
            return (
              <div key={park.id} className="parking-card glass-glow">
                <div className="card-top">
                  <div className="park-type-badge">{park.type}</div>
                  <div className="park-rating">★ {park.rating}</div>
                </div>
                
                <h3>{park.name}</h3>
                
                <div className="card-middle">
                  <div className="location-info">
                    <MapPin size={14} />
                    <span>Toshkent, O'zbekiston</span>
                  </div>
                  <div className="price-tag">
                    <strong>{park.price.toLocaleString('uz-UZ')} UZS</strong> /soat
                  </div>
                </div>

                <div className="occupancy-info">
                  <div className="occupancy-labels">
                    <span>Bo'sh joylar: {available} / {park.totalSpots}</span>
                    <span className="percentage-text">{percentage}% bo'sh</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${percentage < 20 ? 'red' : percentage < 50 ? 'yellow' : 'green'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="card-amenities">
                  {park.amenities.slice(0, 3).map((a, i) => (
                    <span key={i} className="amenity-badge">{a}</span>
                  ))}
                  {park.amenities.length > 3 && <span className="amenity-badge">+{park.amenities.length - 3}</span>}
                </div>

                <button 
                  className="btn btn-primary card-btn"
                  onClick={() => navigate('/map', { state: { selectedParkId: park.id } })}
                >
                  <Navigation size={16} /> Joy Tanlash
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Promo Section */}
      <section className="promo-section glass">
        <div className="promo-grid">
          <div className="promo-item">
            <div className="promo-icon"><Shield size={32} /></div>
            <h3>100% Xavfsiz</h3>
            <p>Barcha parkinglarimiz doimiy kuzatuv kameralari va xavfsizlik xizmatlari bilan ta'minlangan.</p>
          </div>
          <div className="promo-item">
            <div className="promo-icon"><BatteryCharging size={32} /></div>
            <h3>Elektromobillar uchun</h3>
            <p>Zaryadlash qurilmasi mavjud bo'lgan maxsus joylarni xaritadan oson ajratib oling.</p>
          </div>
          <div className="promo-item">
            <div className="promo-icon"><Heart size={32} /></div>
            <h3>Oson bekor qilish</h3>
            <p>Rejangiz o'zgardimi? Muammosiz 1 marta bosish bilan bronni bekor qiling va mablag'ingizni qaytaring.</p>
          </div>
        </div>
      </section>

      {/* Embedded page custom styles */}
      <style>{`
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        /* Hero section styling */
        .hero-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
          padding: 3.5rem 3rem;
          border-radius: var(--radius-lg);
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          z-index: 2;
        }

        .badge-wrapper {
          align-self: flex-start;
        }

        .hero-content h1 {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .highlight-text {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 20px rgba(0, 242, 254, 0.15);
        }

        .hero-content p {
          color: var(--text-secondary);
          font-size: 1.05rem;
          max-width: 550px;
          line-height: 1.6;
        }

        /* Search input bar */
        .search-box {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          margin-top: 1rem;
          max-width: 600px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .search-icon {
          color: var(--color-primary);
          margin-left: 1rem;
          margin-right: 0.5rem;
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 1rem;
          padding: 0.75rem 0.5rem;
        }

        .search-box input:focus {
          outline: none;
        }

        /* Hero right visual mock map */
        .hero-visual {
          display: flex;
          justify-content: center;
          z-index: 2;
        }

        .mock-map-card {
          width: 100%;
          max-width: 380px;
          height: 300px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mock-map-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid var(--border-light);
        }

        .mock-dot-red, .mock-dot-yellow, .mock-dot-green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .mock-dot-red { background: var(--color-danger); }
        .mock-dot-yellow { background: var(--color-warning); }
        .mock-dot-green { background: var(--color-success); }

        .mock-map-title {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-left: auto;
          font-weight: 500;
        }

        .mock-map-body {
          flex: 1;
          position: relative;
          background: radial-gradient(circle at center, #1b2538 0%, #0d131f 100%);
          /* Simulated streets */
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Pulse markers */
        .pulse-marker {
          position: absolute;
          width: 12px;
          height: 12px;
        }

        .p1 { top: 30%; left: 40%; }
        .p2 { top: 60%; left: 25%; }
        .p3 { top: 40%; left: 75%; }

        .pulse-ping {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--color-primary);
          animation: pulseGlow 1.5s infinite ease-in-out;
        }

        .pulse-ping.purple {
          background: var(--color-secondary);
        }

        .pulse-core {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          top: 2px;
          left: 2px;
          box-shadow: 0 0 10px var(--color-primary);
        }

        .pulse-core.purple {
          background: var(--color-secondary);
          box-shadow: 0 0 10px var(--color-secondary);
        }

        /* Mock Map Overlay Card */
        .mock-overlay-card {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          padding: 1rem;
          border-radius: var(--radius-sm);
        }

        .overlay-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .overlay-tag {
          color: var(--text-primary);
        }

        .overlay-price {
          color: var(--color-primary);
        }

        .overlay-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
        }

        /* Live Statistics styling */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          border-radius: var(--radius-md);
          transition: var(--transition-smooth);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .stat-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
        }

        .stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .stat-icon-wrapper.green { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
        .stat-icon-wrapper.purple { background: rgba(157, 78, 221, 0.15); color: #c084fc; }
        .stat-icon-wrapper.yellow { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-heading);
          line-height: 1.1;
        }

        .stat-desc {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          margin-top: 0.2rem;
        }

        /* Recommended Parking Cards styling */
        .recommended-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-top: 0.2rem;
        }

        .text-btn {
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .parking-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .parking-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .park-type-badge {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-light);
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .park-rating {
          color: var(--color-warning);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .parking-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .card-middle {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .price-tag {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .price-tag strong {
          color: var(--color-primary);
          font-size: 1.15rem;
          font-family: var(--font-heading);
        }

        .occupancy-info {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .occupancy-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .percentage-text {
          color: var(--text-primary);
          font-weight: 600;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 9999px;
          background: var(--color-primary);
        }

        .progress-fill.green { background: var(--color-success); }
        .progress-fill.yellow { background: var(--color-warning); }
        .progress-fill.red { background: var(--color-danger); }

        .card-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.2rem;
        }

        .amenity-badge {
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.1);
          color: var(--color-primary);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .card-btn {
          margin-top: 0.5rem;
          width: 100%;
        }

        /* Promo section styling */
        .promo-section {
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          margin-top: 1rem;
        }

        .promo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2.5rem;
        }

        .promo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }

        .promo-icon {
          color: var(--color-primary);
          filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.3));
        }

        .promo-item h3 {
          font-size: 1.15rem;
          font-weight: 600;
        }

        .promo-item p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Media Queries for Responsive Hero */
        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding: 2.5rem 2rem;
            text-align: center;
          }

          .hero-content h1 {
            font-size: 2.2rem;
          }

          .badge-wrapper {
            align-self: center;
          }

          .hero-content p {
            margin: 0 auto;
          }

          .search-box {
            margin: 1rem auto 0;
            width: 100%;
          }

          .hero-visual {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
