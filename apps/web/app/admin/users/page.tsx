'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from '../Sidebar';
import { Search, Shield, User, Bike, AlertCircle } from '@/lib/icons';

interface UserItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Authenticate Admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
    } else {
      setAuthorized(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to load registered users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return null;
  }

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(query) ||
      u.phoneNumber.includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  const getRoleIcon = (role: 'CUSTOMER' | 'DRIVER' | 'ADMIN') => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={16} style={{ color: '#F43F5E', marginRight: '6px' }} />;
      case 'DRIVER':
        return <Bike size={16} style={{ color: '#10B981', marginRight: '6px' }} />;
      default:
        return <User size={16} style={{ color: '#3B82F6', marginRight: '6px' }} />;
    }
  };

  const getRoleBadgeStyle = (role: 'CUSTOMER' | 'DRIVER' | 'ADMIN') => {
    switch (role) {
      case 'ADMIN':
        return {
          backgroundColor: '#FFE4E6',
          color: '#E11D48',
          border: '1px solid #FDA4AF',
        };
      case 'DRIVER':
        return {
          backgroundColor: '#D1FAE5',
          color: '#059669',
          border: '1px solid #A7F3D0',
        };
      default:
        return {
          backgroundColor: '#DBEAFE',
          color: '#2563EB',
          border: '1px solid #BFDBFE',
        };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar collapsible menu */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <header style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
              Registered Users Directory
            </h1>
            <p style={{ color: '#64748B', margin: '6px 0 0 0', fontSize: '14px' }}>
              View and audit customer accounts, driver operators, and administrators
            </p>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', backgroundColor: '#EDF2F7', padding: '8px 16px', borderRadius: '8px' }}>
            Total Registered: {users.length}
          </div>
        </header>

        {/* Search controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '10px 16px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
          }}
        >
          <Search size={18} color="#94A3B8" style={{ marginRight: '12px' }} />
          <input
            type="text"
            placeholder="Search by full name, phone number or system role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '14.5px',
              color: '#0F172A',
              width: '100%',
            }}
          />
        </div>

        {/* Users Datagrid Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid #E2E8F0',
                  borderTopColor: '#0066FF',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '16px',
                }}
              />
              <span style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
                Fetching registered account lists from cloud storage...
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', textAlign: 'center' }}>
              <AlertCircle size={44} color="#94A3B8" style={{ marginBottom: '16px' }} />
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '6px' }}>
                No Registered Accounts Found
              </span>
              <span style={{ color: '#64748B', fontSize: '13.5px' }}>
                Try adjusting your search queries or check database connections
              </span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                      Profile User
                    </th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                      Phone Contact
                    </th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                      Access Role
                    </th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                      Database ID
                    </th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => {
                    const initials = user.fullName
                      ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
                      : 'C';

                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: idx === filteredUsers.length - 1 ? 'none' : '1px solid #F1F5F9',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Profile User avatar/name */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: user.role === 'ADMIN' ? '#FFE4E6' : user.role === 'DRIVER' ? '#D1FAE5' : '#DBEAFE',
                                color: user.role === 'ADMIN' ? '#E11D48' : user.role === 'DRIVER' ? '#059669' : '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '14px',
                              }}
                            >
                              {initials}
                            </div>
                            <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#0F172A' }}>
                              {user.fullName || 'Unnamed Customer'}
                            </span>
                          </div>
                        </td>

                        {/* Phone contact */}
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                          {user.phoneNumber}
                        </td>

                        {/* Access Role Badge */}
                        <td style={{ padding: '16px 24px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 10px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              ...getRoleBadgeStyle(user.role),
                            }}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </td>

                        {/* DB UUID */}
                        <td style={{ padding: '16px 24px', fontSize: '13.5px', color: '#64748B', fontFamily: 'monospace' }}>
                          {user.id}
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
