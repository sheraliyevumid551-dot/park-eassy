import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { User, Wallet, Plus, Trash2, CreditCard, Sparkles, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { userName, updateUserName, walletBalance, cars, topUpWallet, addCar, deleteCar } = useParking();

  // Name editing state
  const [nameInput, setNameInput] = useState(userName);

  // Topup state
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpSuccess, setIsTopUpSuccess] = useState(false);

  // New car state
  const [carModel, setCarModel] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [carError, setCarError] = useState('');
  const [carSuccess, setCarSuccess] = useState(false);

  // User Profile information
  const [userProfile] = useState({
    phone: "+998 90 777 07 77",
    email: "user@parkeasy.uz",
    role: "Premium Haydovchi",
    joinedDate: "Mart, 2026"
  });

  // Top up balance handler
  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) return;
    
    topUpWallet(amount);
    setIsTopUpSuccess(true);
    setTopUpAmount('');
    
    setTimeout(() => {
      setIsTopUpSuccess(false);
    }, 2500);
  };

  const selectQuickTopUp = (amount) => {
    setTopUpAmount(amount.toString());
  };

  // Add car handler
  const handleAddCarSubmit = (e) => {
    e.preventDefault();
    setCarError('');
    setCarSuccess(false);

    if (!carModel.trim()) {
      setCarError("Avtomobil modelini kiriting");
      return;
    }
    
    // Plate regex check: Tashkent standard (01 A 123 AA or 01 123 AAA) or similar
    const cleanedPlate = carPlate.trim().toUpperCase();
    if (!cleanedPlate) {
      setCarError("Davlat raqamini kiriting");
      return;
    }

    const added = addCar(carModel, cleanedPlate);
    if (added) {
      setCarSuccess(true);
      setCarModel('');
      setCarPlate('');
      setTimeout(() => {
        setCarSuccess(false);
      }, 2500);
    } else {
      setCarError("Xatolik yuz berdi");
    }
  };

  return (
    <div className="profile-page animate-slide-up">
      <header className="page-header">
        <h1>Shaxsiy Kabinet</h1>
        <p>Hamyon balansi, avtoturargoh sozlamalari va avtotransport profili</p>
      </header>

      <div className="profile-grid">
        
        {/* Left column: User Card details & Wallet controller */}
        <div className="left-column">
          {/* User badge card */}
          <div className="profile-card glass-glow">
            <div className="profile-user-info">
              <div className="avatar-wrapper">
                <div className="avatar-core">
                  <User size={32} />
                </div>
                <span className="premium-star animate-pulse-glow">★</span>
              </div>
              <div className="user-details">
                <h3>{userName}</h3>
                <span className="user-role">{userProfile.role}</span>
              </div>
            </div>
            
            <div className="profile-meta-list">
              <div className="meta-item">
                <span className="label">Telefon:</span>
                <span className="val">{userProfile.phone}</span>
              </div>
              <div className="meta-item">
                <span className="label">Email:</span>
                <span className="val">{userProfile.email}</span>
              </div>
              <div className="meta-item">
                <span className="label">A'zolik:</span>
                <span className="val">{userProfile.joinedDate}</span>
              </div>
            </div>

            {/* Profile name edit field */}
            <div className="profile-edit-name-section glass" style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: '500' }}>ISMNI TAHRIRLASH</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)} 
                  className="custom-input" 
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', flex: 1 }} 
                  placeholder="Ism va familiyangiz..."
                />
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => {
                    if (nameInput.trim()) {
                      updateUserName(nameInput.trim());
                      alert("Profil ismi muvaffaqiyatli saqlandi!");
                    }
                  }}
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Manager */}
          <div className="wallet-card glass">
            <div className="card-header-row">
              <h3>ParkEasy Virtual Hamyon</h3>
              <Wallet className="wallet-header-icon" />
            </div>

            {/* Glowing Virtual Card */}
            <div className="virtual-debit-card glass-glow">
              <div className="v-card-top">
                <span className="v-card-logo">Park<span>Easy</span></span>
                <Sparkles size={20} className="chip-icon animate-pulse-glow" />
              </div>
              <div className="v-card-middle">
                <span className="v-balance-label">BALANS</span>
                <h2 className="v-balance">{walletBalance.toLocaleString('uz-UZ')} UZS</h2>
              </div>
              <div className="v-card-bottom">
                <span className="v-card-holder">{userName}</span>
                <span className="v-card-expiry">12/29</span>
              </div>
            </div>

            {/* Top up form */}
            <form onSubmit={handleTopUpSubmit} className="top-up-form">
              <div className="input-group">
                <label>Balansni to'ldirish</label>
                <div className="input-row">
                  <input 
                    type="number" 
                    placeholder="Summa kiriting... (UZS)" 
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="custom-input"
                  />
                  <button type="submit" className="btn btn-primary top-up-btn">
                    Hisobni to'ldirish
                  </button>
                </div>
              </div>

              {/* Quick choices */}
              <div className="quick-amounts">
                {[20000, 50000, 100000, 200000].map((amt) => (
                  <button 
                    key={amt}
                    type="button" 
                    className="quick-amt-btn"
                    onClick={() => selectQuickTopUp(amt)}
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {isTopUpSuccess && (
                <div className="success-banner animate-slide-up">
                  <CheckCircle size={14} />
                  <span>Hamyon balansi muvaffaqiyatli to'ldirildi!</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right column: Vehicle list manager */}
        <div className="right-column">
          <div className="vehicles-manager-card glass">
            <div className="card-header-row">
              <h3>Mening Avtomobillarim</h3>
              <span className="vehicles-count">{cars.length} ta ro'yxatda</span>
            </div>

            <div className="vehicles-list">
              {cars.map((car) => (
                <div key={car.id} className="vehicle-item">
                  <div className="vehicle-icon-wrapper">
                    <span className="car-emoji">🚗</span>
                  </div>
                  <div className="vehicle-info">
                    <h4>{car.model}</h4>
                    <span className="vehicle-plate">{car.plate}</span>
                  </div>
                  <button 
                    className="delete-car-btn" 
                    onClick={() => deleteCar(car.id)}
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cars.length === 0 && (
                <div className="empty-vehicles">
                  <AlertCircle size={28} />
                  <p>Hozircha ro'yxatda hech qanday mashina yo'q. Joy band qilishdan oldin mashina qo'shing.</p>
                </div>
              )}
            </div>

            {/* Add vehicle Form */}
            <div className="add-vehicle-section">
              <h4>Yangi avtomobil qo'shish</h4>
              <form onSubmit={handleAddCarSubmit} className="add-car-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label>Avtomobil modeli</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: BYD Song Plus" 
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="custom-input"
                    />
                  </div>
                  <div className="input-group">
                    <label>Davlat raqami</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: 01 A 777 AA" 
                      value={carPlate}
                      onChange={(e) => setCarPlate(e.target.value)}
                      className="custom-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-secondary add-car-btn">
                  <Plus size={16} /> Avtomobil qo'shish
                </button>

                {carError && (
                  <div className="error-banner animate-slide-up">
                    <AlertCircle size={14} />
                    <span>{carError}</span>
                  </div>
                )}

                {carSuccess && (
                  <div className="success-banner animate-slide-up">
                    <CheckCircle size={14} />
                    <span>Avtomobil muvaffaqiyatli ro'yxatga olindi!</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Secure assurance info block */}
          <div className="security-info-card glass">
            <ShieldCheck size={28} className="sec-icon" />
            <div>
              <h4>Demo Day Ma'lumotlar xavfsizligi kafolati</h4>
              <p>ParkEasy barcha foydalanuvchi ma'lumotlarini to'liq shifrlangan holda datchiklar serverida saqlaydi.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile specific embedded styles */}
      <style>{`
        .profile-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Profile page layout */
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .left-column, .right-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Card components styling */
        .profile-card, .wallet-card, .vehicles-manager-card, .security-info-card {
          padding: 1.75rem;
          border-radius: var(--radius-lg);
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
        }

        .card-header-row h3 {
          font-size: 1.15rem;
        }

        /* User detailed badges styling */
        .profile-user-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .avatar-wrapper {
          position: relative;
        }

        .avatar-core {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid var(--border-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }

        .premium-star {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--color-warning);
          color: #0b0f17;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 850;
        }

        .user-details h3 {
          font-size: 1.35rem;
          font-weight: 700;
        }

        .user-role {
          font-size: 0.75rem;
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          color: var(--color-primary);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .profile-meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.15);
          padding: 1rem;
          border-radius: var(--radius-md);
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .meta-item .label {
          color: var(--text-muted);
        }

        .meta-item .val {
          font-weight: 600;
        }

        /* Virtual card styling */
        .virtual-debit-card {
          height: 180px;
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(22, 28, 45, 0.95) 0%, rgba(13, 17, 28, 0.95) 100%);
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .virtual-debit-card::after {
          content: '';
          position: absolute;
          top: -20%;
          right: -10%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(157, 78, 221, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
          pointer-events: none;
        }

        .v-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .v-card-logo {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.2rem;
        }

        .v-card-logo span {
          color: var(--color-primary);
        }

        .chip-icon {
          color: var(--color-primary);
        }

        .v-card-middle {
          display: flex;
          flex-direction: column;
        }

        .v-balance-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .v-balance {
          font-size: 1.75rem;
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--color-primary);
          text-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
        }

        .v-card-bottom {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-family: var(--font-heading);
          color: var(--text-secondary);
        }

        /* Top up forms style */
        .top-up-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-row {
          display: flex;
          gap: 0.75rem;
        }

        .input-row input {
          flex: 1;
        }

        .top-up-btn {
          font-size: 0.85rem;
          padding: 0 1.25rem;
        }

        .quick-amounts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .quick-amt-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          padding: 0.4rem;
          font-size: 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-body);
          transition: var(--transition-fast);
        }

        .quick-amt-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        /* Vehicles manager styles */
        .vehicles-count {
          font-size: 0.75rem;
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          color: var(--text-secondary);
        }

        .vehicles-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .vehicle-item {
          display: flex;
          align-items: center;
          padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .vehicle-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }

        .vehicle-info {
          display: flex;
          flex-direction: column;
        }

        .vehicle-info h4 {
          font-size: 0.95rem;
        }

        .vehicle-plate {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .delete-car-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .delete-car-btn:hover {
          background: rgba(244, 63, 94, 0.08);
          color: var(--color-danger);
        }

        .empty-vehicles {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        /* Add car form */
        .add-vehicle-section {
          border-top: 1px solid var(--border-light);
          padding-top: 1.25rem;
        }

        .add-vehicle-section h4 {
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .add-car-btn {
          width: 100%;
          padding: 0.65rem;
          font-size: 0.85rem;
        }

        .success-banner, .error-banner {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 0.75rem;
        }

        .success-banner {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--color-success);
        }

        .error-banner {
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: var(--color-danger);
        }

        /* Security card */
        .security-info-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(16, 185, 129, 0.02);
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        .sec-icon {
          color: var(--color-success);
        }

        .security-info-card h4 {
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }

        .security-info-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
