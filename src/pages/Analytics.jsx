import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext';
import { BarChart3, TrendingUp, Users, Clock, Calendar, ShieldCheck, Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics = () => {
  const { parks } = useParking();
  const [selectedParkId, setSelectedParkId] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: 14230000,
    occupancy: 73,
    peakHours: "18:00 - 20:00",
    avgDuration: 2.8,
    revenueGrowth: "+12.4%",
    occupancyGrowth: "+5.1%"
  });

  // Dynamic updates when selected park changes
  useEffect(() => {
    if (selectedParkId === 'all') {
      setAnalyticsData({
        revenue: 28450000,
        occupancy: 68,
        peakHours: "18:00 - 21:00",
        avgDuration: 2.6,
        revenueGrowth: "+14.8%",
        occupancyGrowth: "+3.2%"
      });
    } else {
      const park = parks.find(p => p.id === selectedParkId);
      if (park) {
        // Mock calculations based on actual parking details
        const available = park.totalSpots - park.occupiedSpots;
        const currentOcc = Math.round((park.occupiedSpots / park.totalSpots) * 100);
        
        setAnalyticsData({
          revenue: Math.round(park.price * park.occupiedSpots * 14.5), // simulated revenue
          occupancy: currentOcc,
          peakHours: park.id === 'chorsu-bazaar' ? "10:00 - 13:00" : "18:00 - 20:00",
          avgDuration: park.id === 'tashkent-airport' ? 8.5 : 2.2,
          revenueGrowth: park.rating > 4.5 ? "+18.2%" : "+8.5%",
          occupancyGrowth: currentOcc > 70 ? "+8.4%" : "-2.1%"
        });
      }
    }
  }, [selectedParkId, parks]);

  // IoT Sensor logs simulated updates
  const [sensorLogs, setSensorLogs] = useState([
    { id: 1, time: "20:31:05", event: "Chevrolet Gentra (01 A 123 AA) parkingdan chiqdi", spot: "B-08", park: "Tashkent City Mall" },
    { id: 2, time: "20:28:14", event: "BYD Song Plus (01 777 UZB) parkakka kirdi", spot: "A-12", park: "Tashkent City Mall" },
    { id: 3, time: "20:25:40", event: "Lada Vesta (01 K 456 BB) joyni band qildi", spot: "C-03", park: "Chorsu Bozor Ochiq" },
    { id: 4, time: "20:19:12", event: "Tesla Model Y (01 999 TES) zaryadkaga ulandi", spot: "EV-02", park: "Amir Temur Underground" }
  ]);

  // Add occasional new logs to represent live IoT sensor stream
  useEffect(() => {
    const logInterval = setInterval(() => {
      const plates = ["01 X 777 XX", "10 Z 999 ZZ", "01 A 001 AA", "30 Y 456 YY"];
      const cars = ["Chevrolet Cobalt", "Chevrolet Tracker", "Kia K5", "Hyundai Elantra"];
      const action = Math.random() > 0.5 ? "kirdi" : "chiqdi";
      const spots = ["A-04", "B-15", "C-08", "EV-01", "D-05"];
      
      const randomPlate = plates[Math.floor(Math.random() * plates.length)];
      const randomCar = cars[Math.floor(Math.random() * cars.length)];
      const randomAction = action === "kirdi" ? "parkingga kirdi" : "parkingdan chiqdi";
      const randomSpot = spots[Math.floor(Math.random() * spots.length)];
      const randomPark = parks[Math.floor(Math.random() * parks.length)].name.substring(0, 18);
      
      const timeStr = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newLog = {
        id: Date.now(),
        time: timeStr,
        event: `${randomCar} (${randomPlate}) ${randomAction}`,
        spot: randomSpot,
        park: randomPark
      };
      
      setSensorLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(logInterval);
  }, [parks]);

  return (
    <div className="analytics-page animate-slide-up">
      <header className="analytics-header">
        <div>
          <h1>Parking Monitoring & Analitika</h1>
          <p>Datchiklar holati va parking egalari uchun boshqaruv paneli</p>
        </div>
        
        {/* Selector dropdown */}
        <div className="filter-dropdown-wrapper glass">
          <select value={selectedParkId} onChange={(e) => setSelectedParkId(e.target.value)}>
            <option value="all">Barcha Parkinglar (Umumiy)</option>
            {parks.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-top">
            <span className="kpi-title">Umumiy Daromad</span>
            <TrendingUp size={20} className="kpi-icon blue" />
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{analyticsData.revenue.toLocaleString()} UZS</span>
            <span className={`kpi-change ${analyticsData.revenueGrowth.startsWith('+') ? 'green' : 'red'}`}>
              {analyticsData.revenueGrowth.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {analyticsData.revenueGrowth} (oylik)
            </span>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-top">
            <span className="kpi-title">O'rtacha Bandlik</span>
            <Users size={20} className="kpi-icon green" />
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{analyticsData.occupancy}%</span>
            <span className={`kpi-change ${analyticsData.occupancyGrowth.startsWith('+') ? 'green' : 'red'}`}>
              {analyticsData.occupancyGrowth.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {analyticsData.occupancyGrowth} (oylik)
            </span>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-top">
            <span className="kpi-title">Tirband Soatlar</span>
            <Clock size={20} className="kpi-icon yellow" />
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{analyticsData.peakHours}</span>
            <span className="kpi-note text-blue">Eng faol qatnov vaqti</span>
          </div>
        </div>

        <div className="kpi-card glass">
          <div className="kpi-top">
            <span className="kpi-title">O'rtacha Vaqt</span>
            <Calendar size={20} className="kpi-icon purple" />
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{analyticsData.avgDuration} soat</span>
            <span className="kpi-note">Bitta mashina uchun</span>
          </div>
        </div>
      </section>

      {/* Visual Analytics Charts Grid */}
      <section className="charts-grid">
        {/* Weekly Revenue Area Chart - Custom CSS SVG */}
        <div className="chart-card glass-glow">
          <div className="chart-header">
            <h3>Haftalik Daromad Statistikasi</h3>
            <span className="chart-tag">Oxirgi 7 kun</span>
          </div>
          <div className="chart-container">
            {/* Custom SVG Area Graph with glows */}
            <svg viewBox="0 0 500 200" className="svg-chart">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

              {/* Area path */}
              <path 
                d="M 40 170 L 40 140 Q 80 110 110 125 T 180 90 T 250 80 T 320 60 T 390 100 T 480 50 L 480 170 Z" 
                fill="url(#chartGlow)" 
              />
              
              {/* Area line path */}
              <path 
                d="M 40 140 Q 80 110 110 125 T 180 90 T 250 80 T 320 60 T 390 100 T 480 50" 
                fill="none" 
                stroke="var(--color-primary)" 
                strokeWidth="3" 
                style={{ filter: 'drop-shadow(0 0 5px rgba(0, 242, 254, 0.5))' }}
              />

              {/* Dots on nodes */}
              <circle cx="110" cy="125" r="4" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="180" cy="90" r="4" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="250" cy="80" r="4" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="320" cy="60" r="4" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="390" cy="100" r="4" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />
              <circle cx="480" cy="50" r="4" fill="var(--color-primary)" stroke="white" strokeWidth="1.5" />

              {/* X Axis Labels */}
              <text x="40" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Dush</text>
              <text x="110" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Sesh</text>
              <text x="180" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Chor</text>
              <text x="250" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Pay</text>
              <text x="320" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Jum</text>
              <text x="390" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Shan</text>
              <text x="480" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Yak</text>

              {/* Y Axis Labels */}
              <text x="30" y="34" fill="var(--text-muted)" fontSize="9" textAnchor="end">2M UZS</text>
              <text x="30" y="84" fill="var(--text-muted)" fontSize="9" textAnchor="end">1.2M UZS</text>
              <text x="30" y="134" fill="var(--text-muted)" fontSize="9" textAnchor="end">600k UZS</text>
              <text x="30" y="174" fill="var(--text-muted)" fontSize="9" textAnchor="end">0 UZS</text>
            </svg>
          </div>
        </div>

        {/* Hourly Occupancy Rate - Bar Chart SVG */}
        <div className="chart-card glass-glow">
          <div className="chart-header">
            <h3>Soatbay Parking Bandligi</h3>
            <span className="chart-tag">O'rtacha kunlik %</span>
          </div>
          <div className="chart-container">
            <svg viewBox="0 0 500 200" className="svg-chart">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

              {/* Bars */}
              {/* 08:00 */}
              <rect x="60" y="110" width="16" height="60" rx="3" fill="var(--color-secondary)" opacity="0.8" />
              {/* 10:00 */}
              <rect x="110" y="70" width="16" height="100" rx="3" fill="var(--color-secondary)" opacity="0.8" />
              {/* 12:00 */}
              <rect x="160" y="50" width="16" height="120" rx="3" fill="var(--color-primary)" />
              {/* 14:00 */}
              <rect x="210" y="60" width="16" height="110" rx="3" fill="var(--color-primary)" />
              {/* 16:00 */}
              <rect x="260" y="90" width="16" height="80" rx="3" fill="var(--color-secondary)" opacity="0.8" />
              {/* 18:00 */}
              <rect x="310" y="40" width="16" height="130" rx="3" fill="var(--color-primary)" />
              {/* 20:00 */}
              <rect x="360" y="35" width="16" height="135" rx="3" fill="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 4px rgba(0,242,254,0.3))' }} />
              {/* 22:00 */}
              <rect x="410" y="80" width="16" height="90" rx="3" fill="var(--color-secondary)" opacity="0.7" />

              {/* Axis labels */}
              <text x="68" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">08:00</text>
              <text x="118" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">10:00</text>
              <text x="168" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">12:00</text>
              <text x="218" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">14:00</text>
              <text x="268" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">16:00</text>
              <text x="318" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">18:00</text>
              <text x="368" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">20:00</text>
              <text x="418" y="190" fill="var(--text-muted)" fontSize="9" textAnchor="middle">22:00</text>

              <text x="30" y="34" fill="var(--text-muted)" fontSize="9" textAnchor="end">100%</text>
              <text x="30" y="104" fill="var(--text-muted)" fontSize="9" textAnchor="end">50%</text>
              <text x="30" y="174" fill="var(--text-muted)" fontSize="9" textAnchor="end">0%</text>
            </svg>
          </div>
        </div>
      </section>

      {/* IoT Sensors Live feed */}
      <section className="iot-sensors-section glass">
        <div className="section-header">
          <div className="header-title-row">
            <Cpu size={22} className="iot-title-icon animate-pulse-glow" />
            <div>
              <h3>IoT Datchiklar Log Tizimi (Real-time)</h3>
              <p>Aqlli sensorlar orqali avtomobillar kirish/chiqishini real vaqt rejimida nazorat qilish</p>
            </div>
          </div>
          <span className="live-badge badge badge-primary animate-pulse-glow">LIVE STREAM</span>
        </div>

        <div className="logs-container">
          {sensorLogs.map((log) => (
            <div key={log.id} className="log-row animate-slide-up">
              <span className="log-time">{log.time}</span>
              <span className="log-park">{log.park}...</span>
              <span className="log-dot-indicator"></span>
              <span className="log-event">{log.event}</span>
              <span className="log-spot badge badge-success">{log.spot}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics CSS styling */}
      <style>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-dropdown-wrapper select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 0.6rem 1.25rem;
          font-family: var(--font-heading);
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        /* KPI grid styling */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .kpi-card {
          padding: 1.5rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
        }

        .kpi-icon {
          padding: 0.25rem;
          border-radius: 4px;
        }
        .kpi-icon.blue { color: var(--color-primary); background: rgba(0,242,254,0.08); }
        .kpi-icon.green { color: var(--color-success); background: rgba(16,185,129,0.08); }
        .kpi-icon.yellow { color: var(--color-warning); background: rgba(245,158,11,0.08); }
        .kpi-icon.purple { color: var(--color-secondary); background: rgba(157,78,221,0.08); }

        .kpi-body {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-heading);
        }

        .kpi-change {
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.15rem;
          font-weight: 600;
        }

        .kpi-change.green { color: var(--color-success); }
        .kpi-change.red { color: var(--color-danger); }

        .kpi-note {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .text-blue {
          color: var(--color-primary);
        }

        /* Charts grid styling */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .chart-card {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .chart-tag {
          font-size: 0.75rem;
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .chart-container {
          position: relative;
          width: 100%;
        }

        .svg-chart {
          width: 100%;
          height: auto;
          color: var(--text-primary);
        }

        /* IoT live feed logs styling */
        .iot-sensors-section {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .iot-title-icon {
          color: var(--color-primary);
          filter: drop-shadow(0 0 5px var(--color-primary));
        }

        .section-header h3 {
          font-size: 1.1rem;
        }

        .section-header p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .live-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .logs-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .log-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          flex-wrap: wrap;
        }

        .log-row:first-child {
          border-color: rgba(0, 242, 254, 0.25);
          background: rgba(0, 242, 254, 0.02);
        }

        .log-time {
          color: var(--color-secondary);
          font-family: var(--font-heading);
          font-weight: 600;
        }

        .log-park {
          color: var(--text-muted);
          width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .log-dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
        }

        .log-event {
          color: var(--text-secondary);
          flex: 1;
          min-width: 200px;
        }

        .log-spot {
          font-size: 0.75rem;
        }

        @media (max-width: 480px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
