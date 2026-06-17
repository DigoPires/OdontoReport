'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function SuportePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: sidebarOpen ? 'block' : 'none' }}
        />
        <main className="main-content">
          <div className="main-header">
            <div className="header-left">
              <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="header-titles">
                <h1>Suporte</h1>
                <p className="subtitle">Escolha o canal de sua preferência e entrarei em contato o mais rápido possível.</p>
              </div>
            </div>
          </div>

          <div className="form-container">
            <div className="form-card max-w-2xl mx-auto">

              {/* Hero / ícone central */}
              <div className="card-header text-center pb-2">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--primary-light, #e8f4fd)',
                    marginBottom: 16,
                  }}
                >
                  {/* Headset icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--primary, #2563eb)"
                    strokeWidth="1.5"
                  >
                    <path d="M3 11a9 9 0 1118 0" />
                    <path d="M21 16.5a2.5 2.5 0 01-2.5 2.5H17a2 2 0 01-2-2v-3a2 2 0 012-2h4v4.5z" />
                    <path d="M3 16.5A2.5 2.5 0 005.5 19H7a2 2 0 002-2v-3a2 2 0 00-2-2H3v4.5z" />
                  </svg>
                </div>
                <h2 style={{ marginBottom: 8 }}>Precisa de ajuda?</h2>
              </div>
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '0.95rem', marginBottom: 0, textAlign: 'center' }}>
                Escolha o canal de sua preferência e entrarei em contato o mais rápido possível.
              </p>

              {/* Divider */}
              <hr style={{ margin: '24px 0', borderColor: 'var(--border, #e5e7eb)' }} />

              {/* Contact cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Email */}
                <a
                  href="mailto:pires.r2806@gmail.com"
                  aria-label="Enviar email para pires.r2806@gmail.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '18px 20px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border, #e5e7eb)',
                    background: 'var(--card-bg, #fff)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary, #2563eb)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(37,99,235,0.10)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #e5e7eb)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--primary-light, #e8f4fd)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Email icon */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #2563eb)" strokeWidth="1.5">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 8l9 6 9-6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)', marginBottom: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Email
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
                      pires.r2806@gmail.com
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-secondary, #9ca3af)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/5511993648032"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp para +55 (11) 99364-8032"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '18px 20px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border, #e5e7eb)',
                    background: 'var(--card-bg, #fff)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#25d366';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(37,211,102,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, #e5e7eb)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#e8fdf0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Ícone do WhatsApp Corrigido e Centralizado */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.764.457 3.42 1.257 4.872L2 22l5.244-1.376a9.947 9.947 0 004.76 1.208c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2z"
                        fill="#25D366"
                      />
                      <path
                        d="M16.974 14.73c-.272-.136-1.614-.796-1.863-.887-.25-.09-.43-.136-.612.136-.182.272-.703.886-.862 1.068-.159.182-.318.204-.59.068-.272-.136-1.15-.424-2.19-1.353-.81-.722-1.357-1.615-1.516-1.887-.159-.272-.017-.42.12-.555.122-.121.272-.317.408-.476.136-.159.182-.272.272-.454.09-.181.045-.34-.023-.476-.068-.136-.612-1.474-.839-2.019-.22-.53-.443-.457-.61-.466l-.522-.01c-.181 0-.476.069-.726.34-.25.273-.953.931-.953 2.27 0 1.338.975 2.63 1.111 2.812.136.182 1.92 2.932 4.653 4.113.65.28 1.157.448 1.553.573.655.208 1.25.179 1.72.11.525-.078 1.614-.66 1.841-1.297.227-.637.227-1.183.159-1.297-.069-.114-.25-.182-.522-.318z"
                        fill="#FFF"
                      />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)', marginBottom: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      WhatsApp
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
                      +55 (11) 99364-8032
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-secondary, #9ca3af)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </a>

              </div>

              {/* Footer note */}
              <p
                style={{
                  textAlign: 'center',
                  marginTop: 24,
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary, #9ca3af)',
                }}
              >
                Horário de atendimento: seg–sex, 9h às 18h
              </p>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}