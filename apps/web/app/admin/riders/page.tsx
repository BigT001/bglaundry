'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, Bike, MapPin } from '@/lib/icons';
import { clearAdminCache } from '../adminCache';

interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  driverProfile?: {
    vehicleType: string | null;
    isOnline: boolean;
    licenseNumber: string | null;
  } | null;
}

export default function AdminRidersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      setAuthChecked(true);
      return;
    }
    setAuthorized(true);
    setAuthChecked(true);
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/drivers');
      setDrivers(response.data || []);
    } catch (error) {
      console.error('Unable to load riders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRider = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post('/api/v1/drivers', { fullName, phoneNumber });
      setDrivers((current) => [response.data, ...current]);
      clearAdminCache('dashboard-drivers');
      setFullName('');
      setPhoneNumber('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Unable to register rider.');
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#F8FAFC',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          padding: '32px',
          textAlign: 'center',
          color: '#0F172A',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Loading rider fleet…</h2>
          <p style={{ marginTop: '12px', color: '#64748B' }}>
            Loading rider details and availability status.
          </p>
        </div>
      </div>
    );
  }

  const filteredDrivers = drivers.filter((driver) => {
    const term = search.toLowerCase();
    return (
      driver.fullName.toLowerCase().includes(term) ||
      driver.phoneNumber.toLowerCase().includes(term) ||
      driver.driverProfile?.vehicleType?.toLowerCase().includes(term) ||
      driver.driverProfile?.licenseNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="ridersPage">
      <main className="ridersMain">
        <header className="ridersHeader">
          <div>
            <h1>Rider Fleet</h1>
            <p>View active riders, vehicle type, and current availability.</p>
          </div>
          <div className="riderSummary">
            <div>
              <span>Total Riders</span>
              <strong>{drivers.length}</strong>
            </div>
            <div>
              <span>Currently Online</span>
              <strong>{drivers.filter((driver) => driver.driverProfile?.isOnline).length}</strong>
            </div>
          </div>
        </header>

        <form className="registerRider" onSubmit={handleRegisterRider}>
          <div className="registerIntro">
            <strong>Register a rider</strong>
            <span>Add a rider with their name and phone number.</span>
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Rider name"
            aria-label="Rider name"
            required
          />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="Phone number"
            aria-label="Rider phone number"
            required
          />
          <button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add rider'}</button>
        </form>

        <section className="searchPanel">
          <Search size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, vehicle or license"
          />
        </section>

        <section className="riderCards">
          {loading ? (
            <div className="loadingState">Loading riders...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="emptyState">
              <strong>No riders found.</strong>
              <span>Register your first rider above.</span>
            </div>
          ) : (
            filteredDrivers.map((driver) => {
              const isOnline = driver.driverProfile?.isOnline;
              const vehicle = driver.driverProfile?.vehicleType || 'Rider';
              return (
                <article className="riderCard" key={driver.id}>
                  <div className="riderCardHeader">
                    <div className="riderAvatar">{driver.fullName.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <h2>{driver.fullName}</h2>
                      <p>{vehicle}</p>
                    </div>
                  </div>
                  <div className="riderCardMeta">
                    <span className={`statusBadge ${isOnline ? 'online' : 'offline'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <div>
                      <Bike size={16} />
                      <span>{driver.phoneNumber}</span>
                    </div>
                    <div>
                      <MapPin size={16} />
                      <span>{driver.driverProfile?.licenseNumber ?? 'No license on file'}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      <style jsx>{`
        .ridersPage {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: #F8FAFC;
          font-family: 'Inter', sans-serif;
        }

        .ridersMain {
          flex: 1;
          padding: 40px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .ridersHeader {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 32px;
        }

        .ridersHeader h1 {
          margin: 0;
          font-size: 32px;
          color: #0F172A;
          font-weight: 900;
        }

        .ridersHeader p {
          margin: 8px 0 0;
          color: #64748B;
          font-size: 14px;
        }

        .riderSummary {
          display: grid;
          grid-template-columns: repeat(2, minmax(140px, 1fr));
          gap: 14px;
        }

        .riderSummary div {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 20px;
          min-width: 180px;
        }

        .riderSummary span {
          color: #64748B;
          font-size: 12px;
          display: block;
          margin-bottom: 8px;
        }

        .riderSummary strong {
          font-size: 28px;
          color: #0F172A;
          display: block;
        }

        .searchPanel {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 520px;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 14px 20px;
          margin-bottom: 28px;
        }

        .registerRider {
          display: grid;
          grid-template-columns: minmax(190px, 1fr) minmax(170px, 0.8fr) minmax(150px, 0.55fr) auto;
          align-items: end;
          gap: 12px;
          margin-bottom: 20px;
          padding: 18px 20px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
        }

        .registerIntro {
          display: grid;
          gap: 3px;
          align-self: center;
        }

        .registerIntro strong { color: #0F172A; font-size: 14px; }
        .registerIntro span { color: #64748B; font-size: 12px; }

        .registerRider input {
          width: 100%;
          box-sizing: border-box;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid #CBD5E1;
          border-radius: 10px;
          background: #FFFFFF;
          color: #0F172A;
          outline: none;
        }

        .registerRider input:focus { border-color: #0F172A; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08); }

        .registerRider button {
          min-height: 44px;
          padding: 10px 16px;
          border: 0;
          border-radius: 10px;
          background: #0F172A;
          color: #FFFFFF;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .registerRider button:disabled { opacity: 0.65; cursor: wait; }

        .searchPanel input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          color: #0F172A;
          background: transparent;
        }

        .riderCards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .riderCard {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
        }

        .riderCardHeader {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .riderAvatar {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: #FFFFFF;
          background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%);
          font-size: 18px;
          font-weight: 800;
        }

        .riderCardHeader h2 {
          margin: 0;
          font-size: 18px;
          color: #0F172A;
          font-weight: 800;
        }

        .riderCardHeader p {
          margin: 4px 0 0;
          color: #64748B;
          font-size: 13px;
        }

        .riderCardMeta {
          display: grid;
          gap: 12px;
          color: #475569;
          font-size: 14px;
        }

        .statusBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          font-size: 11px;
          color: #1D4ED8;
          background: #EFF6FF;
          width: fit-content;
        }

        .statusBadge.offline {
          color: #92400E;
          background: #FEF3C7;
        }

        .riderCardMeta div {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .loadingState,
        .emptyState {
          grid-column: 1 / -1;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          color: #64748B;
        }

        .emptyState strong {
          display: block;
          margin-bottom: 10px;
          color: #0F172A;
          font-size: 16px;
        }

        @media (max-width: 780px) {
          .ridersMain {
            padding: 28px 20px;
          }

          .riderSummary {
            grid-template-columns: 1fr;
          }

          .registerRider {
            grid-template-columns: 1fr 1fr;
          }

          .registerIntro { grid-column: 1 / -1; }
        }

        @media (max-width: 520px) {
          .ridersHeader {
            gap: 16px;
          }

          .searchPanel {
            padding: 14px 16px;
          }

          .registerRider { grid-template-columns: 1fr; padding: 16px; }
          .registerIntro { grid-column: auto; }
        }
      `}</style>
    </div>
  );
}
