import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext';
import { Calendar, Clock, MapPin, Receipt, ShieldCheck, Timer, RefreshCw, XCircle, ArrowUpRight, AlertCircle, Info, CreditCard } from 'lucide-react';

const MyBookings = () => {
  const { bookings, cancelBooking, extendBooking, walletBalance } = useParking();
  const [activeTab, setActiveTab] = useState('active'); // active, history
  
  // Extend state
  const [extendingBooking, setExtendingBooking] = useState(null);
  const [extendHours, setExtendHours] = useState(1);
  const [extendStatus, setExtendStatus] = useState('idle'); // idle, processing, success, error
  const [extendError, setExtendError] = useState('');

  // Active tickers state (to trigger countdown updates)
  const [timeNow, setTimeNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'active');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  // Cancel booking handler
  const handleCancelClick = (id) => {
    if (window.confirm("Haqiqatan ham ushbu bronni bekor qilmoqchimisiz? (70% qaytarib beriladi)")) {
      const res = cancelBooking(id);
      if (res.success) {
        alert(`Muvaffaqiyatli bekor qilindi. ${res.refundAmount.toLocaleString()} UZS hamyoningizga qaytarildi.`);
      } else {
        alert(res.error);
      }
    }
  };

  // Extend booking handler
  const handleExtendSubmit = () => {
    if (!extendingBooking) return;
    setExtendStatus('processing');
    
    setTimeout(() => {
      const res = extendBooking(extendingBooking.id, extendHours);
      if (res.success) {
        setExtendStatus('success');
        setTimeout(() => {
          setExtendStatus('idle');
          setExtendingBooking(null);
        }, 1500);
      } else {
        setExtendStatus('error');
        setExtendError(res.error);
      }
    }, 1500);
  };

  // Ticket Countdown timer generator
  const getCountdownText = (endTimeStr) => {
    const totalMs = new Date(endTimeStr).getTime() - timeNow;
    if (totalMs <= 0) return "Muddati tugagan";
    
    const hours = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    
    const h = hours < 10 ? '0' + hours : hours;
    const m = mins < 10 ? '0' + mins : mins;
    const s = secs < 10 ? '0' + secs : secs;
    
    return `${h}:${m}:${s}`;
  };

  const getPercentageTimeRemaining = (createdAt, endTime) => {
    const created = new Date(createdAt).getTime();
    const end = new Date(endTime).getTime();
    const total = end - created;
    const remaining = end - timeNow;
    
    if (remaining <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  return (
    <div className="bookings-page animate-slide-up">
      <header className="page-header">
        <div>
          <h1>Mening Bronlarim</h1>
          <p>Faol kvitansiyalar, QR-kodlar va booking tarixi</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="tab-buttons glass">
          <button 
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Faol Chiptalar <span className="tab-badge blue">{activeBookings.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Tarix <span className="tab-badge">{pastBookings.length}</span>
          </button>
        </div>
      </header>

      {/* ACTIVE TAB CONTENTS */}
      {activeTab === 'active' && (
        <div className="active-tickets-layout">
          {activeBookings.length > 0 ? (
            activeBookings.map((booking) => {
              const countdown = getCountdownText(booking.endTime);
              const isExpired = countdown === "Muddati tugagan";
              const percentRemaining = getPercentageTimeRemaining(booking.createdAt, booking.endTime);
              
              return (
                <div key={booking.id} className="ticket-card glass-glow">
                  {/* Left Side: Ticket Core details */}
                  <div className="ticket-main">
                    <div className="ticket-top">
                      <div className="ticket-logo-row">
                        <span className="logo-icon">🚗</span>
                        <span className="logo-text">Park<span>Easy</span> Smart Pass</span>
                      </div>
                      <span className="ticket-id">{booking.id}</span>
                    </div>

                    <div className="ticket-body">
                      <div className="location-section">
                        <MapPin size={16} className="loc-icon" />
                        <div>
                          <h3>{booking.parkingName}</h3>
                          <p>Toshkent, O'zbekiston</p>
                        </div>
                      </div>

                      <div className="ticket-info-grid">
                        <div className="info-node">
                          <span className="node-label">Tanlangan Joy</span>
                          <span className="node-val highlight">{booking.spotLabel}</span>
                          <span className="node-sub">{booking.spotType}</span>
                        </div>
                        <div className="info-node">
                          <span className="node-label">Avtomobil raqami</span>
                          <span className="node-val">{booking.carPlate}</span>
                        </div>
                        <div className="info-node">
                          <span className="node-label">Boshlanish vaqti</span>
                          <span className="node-val">{new Date(booking.startTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="node-sub">{new Date(booking.startTime).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="info-node">
                          <span className="node-label">Tugash vaqti</span>
                          <span className="node-val">{new Date(booking.endTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="node-sub">{new Date(booking.endTime).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Remaining time progress bar */}
                      <div className="countdown-row">
                        <div className="countdown-label">
                          <Timer size={14} />
                          <span>Qolgan vaqt:</span>
                          <strong className={isExpired ? 'expired' : 'active'}>{countdown}</strong>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${percentRemaining < 15 ? 'red' : percentRemaining < 40 ? 'yellow' : 'green'}`} 
                            style={{ width: `${percentRemaining}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Action Footer */}
                    <div className="ticket-footer">
                      <button 
                        className="btn btn-secondary action-btn" 
                        onClick={() => setExtendingBooking(booking)}
                        disabled={isExpired}
                      >
                        <RefreshCw size={14} /> Vaqtni uzaytirish
                      </button>
                      <button 
                        className="btn btn-danger action-btn" 
                        onClick={() => handleCancelClick(booking.id)}
                        disabled={isExpired}
                      >
                        <XCircle size={14} /> Bekor qilish
                      </button>
                    </div>
                  </div>

                  {/* Right Side: QR Code Area */}
                  <div className="ticket-qr-section">
                    <div className="qr-wrapper glass">
                      <div className="scan-line"></div>
                      
                      {/* Interactive dynamic SVG QR Code */}
                      <svg viewBox="0 0 100 100" className="qr-code-svg">
                        <path fill="currentColor" d="M0,0 h30 v10 h-20 v20 h-10 z M100,0 h-30 v10 h20 v20 h10 z M0,100 h30 v-10 h-20 v-20 h-10 z M100,100 h-30 v-10 h20 v-20 h10 z" />
                        {/* Simulated QR Blocks */}
                        <rect x="20" y="20" width="20" height="20" fill="currentColor" />
                        <rect x="25" y="25" width="10" height="10" fill="var(--bg-card-solid)" />
                        <rect x="60" y="20" width="20" height="20" fill="currentColor" />
                        <rect x="65" y="25" width="10" height="10" fill="var(--bg-card-solid)" />
                        <rect x="20" y="60" width="20" height="20" fill="currentColor" />
                        <rect x="25" y="65" width="10" height="10" fill="var(--bg-card-solid)" />
                        
                        {/* Random QR clusters */}
                        <rect x="50" y="20" width="5" height="10" fill="currentColor" />
                        <rect x="50" y="35" width="5" height="5" fill="currentColor" />
                        <rect x="45" y="45" width="10" height="10" fill="currentColor" />
                        <rect x="20" y="50" width="10" height="5" fill="currentColor" />
                        <rect x="60" y="50" width="15" height="5" fill="currentColor" />
                        <rect x="55" y="60" width="5" height="15" fill="currentColor" />
                        <rect x="65" y="65" width="15" height="15" fill="currentColor" />
                        <rect x="75" y="60" width="5" height="5" fill="currentColor" />
                        <rect x="50" y="75" width="10" height="5" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="qr-text">
                      <span className="code-label">TIZIM UCHUN SAKNERLANG</span>
                      <strong className="code-value">{booking.code}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-bookings glass">
              <Receipt size={48} className="empty-icon" />
              <h3>Faol bronlaringiz yo'q</h3>
              <p>Hozirda band qilingan parking joylaringiz mavjud emas. Yangi joy topish uchun xaritaga o'ting.</p>
              <button className="btn btn-primary" onClick={() => navigate('/map')}>
                Joy topish
              </button>
            </div>
          )}
        </div>
      )}

      {/* PAST BOOKINGS TAB CONTENTS */}
      {activeTab === 'history' && (
        <div className="history-tab-panel glass animate-slide-up">
          <h2>Bronlar tarixi</h2>
          <div className="history-list">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <div key={booking.id} className="history-item">
                  <div className="item-left">
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status === 'completed' ? 'Yakunlangan' : 'Bekor qilingan'}
                    </span>
                    <h4>{booking.parkingName}</h4>
                    <p className="item-sub">
                      <span>Joy: <strong>{booking.spotLabel}</strong></span>
                      <span>•</span>
                      <span>Mashina: {booking.carPlate}</span>
                    </p>
                  </div>
                  
                  <div className="item-middle">
                    <div className="date-node">
                      <Calendar size={13} />
                      <span>{new Date(booking.startTime).toLocaleDateString('uz-UZ')}</span>
                    </div>
                    <div className="date-node">
                      <Clock size={13} />
                      <span>{new Date(booking.startTime).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'})} ({booking.totalHours} soat)</span>
                    </div>
                  </div>

                  <div className="item-right">
                    <span className="price-tag">{booking.totalPrice.toLocaleString()} UZS</span>
                    <span className="pay-type">Click/Payme via Wallet</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-bookings">
                <Receipt size={40} className="empty-icon" />
                <p>Bronlar tarixi bo'sh.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXTEND TIME OVERLAY MODAL */}
      {extendingBooking && (
        <div className="extend-modal-overlay">
          <div className="extend-modal glass-glow animate-slide-up">
            <div className="modal-header">
              <h2>Bron muddatini uzaytirish</h2>
              <button className="close-btn" onClick={() => setExtendingBooking(null)}><XCircle size={18} /></button>
            </div>

            {extendStatus === 'idle' && (
              <div className="extend-content">
                <p className="modal-desc">
                  <Info size={14} style={{ marginRight: '4px', display: 'inline' }} />
                  {extendingBooking.parkingName} parkingining <strong>{extendingBooking.spotLabel}</strong> joyi uchun qo'shimcha soat tanlang.
                </p>

                <div className="selector-group">
                  <label>Qancha vaqtga uzaytirilsin?</label>
                  <div className="hours-grid">
                    {[1, 2, 3, 4, 6].map((h) => (
                      <button 
                        key={h}
                        className={`hour-choice-btn ${extendHours === h ? 'active' : ''}`}
                        onClick={() => setExtendHours(h)}
                      >
                        +{h} soat
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Details */}
                <div className="extend-receipt glass">
                  <div className="receipt-row">
                    <span>Mavjud Hamyon balansi:</span>
                    <span>{walletBalance.toLocaleString()} UZS</span>
                  </div>
                  <div className="receipt-row">
                    <span>Qo'shimcha soat narxi:</span>
                    <strong className="cost-color">{(extendHours * (extendingBooking.totalPrice / extendingBooking.totalHours)).toLocaleString()} UZS</strong>
                  </div>
                </div>

                <button 
                  className="btn btn-primary extend-confirm-btn" 
                  onClick={handleExtendSubmit}
                  disabled={walletBalance < (extendHours * (extendingBooking.totalPrice / extendingBooking.totalHours))}
                >
                  <CreditCard size={16} /> Balansdan to'lash va uzaytirish
                </button>
              </div>
            )}

            {extendStatus === 'processing' && (
              <div className="extend-processing">
                <div className="spinner-glow animate-pulse-glow">
                  <div className="spinner-core"></div>
                </div>
                <h3>Muddati uzaytirilmoqda...</h3>
                <p>To'lov tasdiqlanmoqda va parking muddati yangilanmoqda.</p>
              </div>
            )}

            {extendStatus === 'success' && (
              <div className="extend-success">
                <div className="success-badge-glow">
                  <ShieldCheck size={40} className="success-check-icon" />
                </div>
                <h3>Muvaffaqiyatli uzaytirildi!</h3>
                <p>Bronlash muddati qo'shimcha {extendHours} soatga oshirildi.</p>
              </div>
            )}

            {extendStatus === 'error' && (
              <div className="extend-error">
                <AlertCircle size={40} className="error-icon" />
                <h3>Uzaytirish imkoni bo'lmadi</h3>
                <p className="error-msg">{extendError}</p>
                <button className="btn btn-secondary" onClick={() => setExtendStatus('idle')}>Orqaga qaytish</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded MyBookings CSS styling */}
      <style>{`
        .bookings-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        /* Tabs styling */
        .tab-buttons {
          display: flex;
          padding: 0.35rem;
          border-radius: var(--radius-md);
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.07);
          color: var(--text-primary);
        }

        .tab-badge {
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.1);
          color: var(--text-secondary);
        }

        .tab-badge.blue {
          background: rgba(0, 242, 254, 0.15);
          color: var(--color-primary);
        }

        /* Active Ticket boarding-pass styling */
        .active-tickets-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .ticket-card {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .ticket-main {
          padding: 2rem;
          border-right: 2px dashed rgba(255, 255, 255, 0.08);
          position: relative;
        }

        /* Boarding pass ticket circular notch cuts */
        .ticket-main::after, .ticket-main::before {
          content: '';
          position: absolute;
          right: -10px;
          width: 20px;
          height: 20px;
          background: var(--bg-main);
          border-radius: 50%;
          z-index: 10;
        }
        .ticket-main::before { top: -10px; }
        .ticket-main::after { bottom: -10px; }

        .ticket-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .ticket-logo-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-text {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 750;
        }

        .logo-text span {
          color: var(--color-primary);
        }

        .ticket-id {
          font-size: 0.8rem;
          font-family: var(--font-heading);
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .ticket-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .location-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .loc-icon {
          color: var(--color-primary);
        }

        .location-section h3 {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .location-section p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ticket-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .info-node {
          display: flex;
          flex-direction: column;
        }

        .node-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .node-val {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .node-val.highlight {
          color: var(--color-primary);
          font-size: 1.25rem;
          font-family: var(--font-heading);
        }

        .node-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Countdown indicator timer styles */
        .countdown-row {
          background: rgba(0, 0, 0, 0.15);
          padding: 1rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .countdown-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .countdown-label strong {
          font-size: 1.1rem;
          font-family: var(--font-heading);
          margin-left: auto;
        }

        .countdown-label strong.active {
          color: var(--color-primary);
          text-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
        }

        .countdown-label strong.expired {
          color: var(--color-danger);
        }

        .ticket-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
        }

        /* Ticket QR scanning side */
        .ticket-qr-section {
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1.5rem;
        }

        .qr-wrapper {
          width: 170px;
          height: 170px;
          padding: 1rem;
          border-radius: var(--radius-md);
          position: relative;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-code-svg {
          width: 100%;
          height: 100%;
          color: var(--text-primary);
        }

        .qr-text {
          text-align: center;
          display: flex;
          flex-direction: column;
        }

        .code-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .code-value {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }

        /* History view tab styling */
        .history-tab-panel {
          padding: 1.75rem;
          border-radius: var(--radius-lg);
        }

        .history-tab-panel h2 {
          font-size: 1.3rem;
          margin-bottom: 1.25rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          display: grid;
          grid-template-columns: 1.5fr 1.5fr 1fr;
          padding: 1.25rem;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          align-items: center;
          gap: 1.5rem;
        }

        .item-left {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .status-badge {
          align-self: flex-start;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .status-badge.completed {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-badge.cancelled {
          background: rgba(244, 63, 94, 0.1);
          color: var(--color-danger);
          border: 1px solid rgba(244, 63, 94, 0.2);
        }

        .item-left h4 {
          font-size: 1rem;
        }

        .item-sub {
          display: flex;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .item-middle {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .date-node {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .item-right {
          text-align: right;
          display: flex;
          flex-direction: column;
        }

        .item-right .price-tag {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .pay-type {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .empty-bookings {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          gap: 1rem;
          color: var(--text-muted);
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.5;
        }

        /* Extend Booking modal overlay */
        .extend-modal-overlay {
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

        .extend-modal {
          width: 100%;
          max-width: 440px;
          padding: 2rem;
          border-radius: var(--radius-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .modal-header h2 {
          font-size: 1.35rem;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
        }

        .modal-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }

        .selector-group {
          margin-bottom: 1.25rem;
        }

        .selector-group label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          display: block;
        }

        .hours-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.4rem;
        }

        .hour-choice-btn {
          padding: 0.5rem 0.2rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .hour-choice-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .hour-choice-btn.active {
          background: rgba(0, 242, 254, 0.1);
          border-color: var(--color-primary);
          color: var(--color-primary);
          font-weight: 600;
        }

        .extend-receipt {
          padding: 1rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .cost-color {
          color: var(--color-primary);
        }

        .extend-confirm-btn {
          width: 100%;
          padding: 0.8rem;
        }

        /* Processing/Success extend overlays */
        .extend-processing, .extend-success, .extend-error {
          text-align: center;
          padding: 1.5rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        /* Media Queries for boardings layout */
        @media (max-width: 768px) {
          .ticket-card {
            grid-template-columns: 1fr;
          }
          .ticket-main {
            border-right: none;
            border-bottom: 2px dashed rgba(255, 255, 255, 0.08);
          }
          .ticket-main::after, .ticket-main::before {
            right: auto;
            width: 20px;
            height: 20px;
            bottom: -10px;
          }
          .ticket-main::before { left: -10px; }
          .ticket-main::after { right: -10px; }
          .history-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .item-right {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
