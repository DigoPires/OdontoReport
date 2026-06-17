'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/contexts/ToastContext';

interface UserSettings {
  clinicName?: string;
  logoUrl?: string;
  logoSize?: string;
  primaryColor: string;
  socialInstagram?: string;
  socialWhatsapp?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialTiktok?: string;
  socialYoutube?: string;
  socialGoogle?: string;
  socialWebsite?: string;
  layoutTemplate: string;
}

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    primaryColor: '#2563EB',
    layoutTemplate: 'padrao',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/configuracoes');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        showToast('Configurações salvas com sucesso!', 'success');
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
        showToast('Erro ao salvar configurações', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A logo deve ter no máximo 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setSettings(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

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
                <h1>Configurações</h1>
                <p className="subtitle">Personalize suas configurações de clínica e relatórios</p>
              </div>
            </div>
          </div>

          <div className="form-container">
            {loading ? (
              <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando configurações...</p>
              </div>
            ) : (
              <>
                {message && (
                  <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSave} className="max-w-2xl">
                  <div className="form-card">
                    <div className="card-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <path d="M17 21v-8H7v8" />
                        <path d="M7 3v5h8" />
                      </svg>
                      <h2>Informações da Clínica</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="form-group">
                        <label>Nome da Clínica</label>
                        <input
                          type="text"
                          value={settings.clinicName || ''}
                          onChange={(e) => setSettings(prev => ({ ...prev, clinicName: e.target.value }))}
                          placeholder="Ex: Clínica EndoExpert"
                        />
                      </div>

                      <div className="form-group">
                        <label>Logo</label>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} />
                        {settings.logoUrl && (
                          <div className="mt-2">
                            <img src={settings.logoUrl} alt="Logo preview" className="h-20 w-auto object-contain" />
                            <button
                              type="button"
                              onClick={() => setSettings(prev => ({ ...prev, logoUrl: '' }))}
                              className="mt-2 text-sm text-red-600 hover:text-red-700"
                            >
                              Remover logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Tamanho do Logo (px)</label>
                        <input
                          type="text"
                          value={settings.logoSize || ''}
                          onChange={(e) => setSettings(prev => ({ ...prev, logoSize: e.target.value }))}
                          onBlur={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                            if (numericValue) {
                              const numValue = parseInt(numericValue);
                              const clamped = Math.max(20, Math.min(300, numValue));
                              setSettings(prev => ({ ...prev, logoSize: clamped.toString() }));
                            } else {
                              setSettings(prev => ({ ...prev, logoSize: '80' }));
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          placeholder="80"
                        />
                        <p className="text-sm text-gray-500 mt-1">Tamanho entre 20px e 300px (padrão: 80)</p>
                      </div>

                      <div className="form-group">
                        <label>Cor Primária</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-12 rounded"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-card">
                    <div className="card-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <h2>Redes Sociais</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="form-group">
                        <label>Instagram</label>
                        <input type="text" value={settings.socialInstagram || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialInstagram: e.target.value }))} placeholder="https://instagram.com/..." />
                      </div>
                      <div className="form-group">
                        <label>WhatsApp</label>
                        <input type="text" value={settings.socialWhatsapp || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialWhatsapp: e.target.value }))} placeholder="https://wa.me/..." />
                      </div>
                      <div className="form-group">
                        <label>Facebook</label>
                        <input type="text" value={settings.socialFacebook || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialFacebook: e.target.value }))} placeholder="https://facebook.com/..." />
                      </div>
                      <div className="form-group">
                        <label>X (Twitter)</label>
                        <input type="text" value={settings.socialTwitter || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialTwitter: e.target.value }))} placeholder="https://x.com/..." />
                      </div>
                      <div className="form-group">
                        <label>LinkedIn</label>
                        <input type="text" value={settings.socialLinkedin || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialLinkedin: e.target.value }))} placeholder="https://linkedin.com/..." />
                      </div>
                      <div className="form-group">
                        <label>TikTok</label>
                        <input type="text" value={settings.socialTiktok || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialTiktok: e.target.value }))} placeholder="https://tiktok.com/..." />
                      </div>
                      <div className="form-group">
                        <label>YouTube</label>
                        <input type="text" value={settings.socialYoutube || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialYoutube: e.target.value }))} placeholder="https://youtube.com/..." />
                      </div>
                      <div className="form-group">
                        <label>Google Review</label>
                        <input type="text" value={settings.socialGoogle || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialGoogle: e.target.value }))} placeholder="https://..." />
                      </div>
                      <div className="form-group">
                        <label>Site Próprio</label>
                        <input type="text" value={settings.socialWebsite || ''} onChange={(e) => setSettings(prev => ({ ...prev, socialWebsite: e.target.value }))} placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div className="form-card">
                    <div className="card-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                      <h2>Layout do Relatório</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${settings.layoutTemplate === 'padrao' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setSettings(prev => ({ ...prev, layoutTemplate: 'padrao' }))}
                      >
                        <div className="font-medium text-gray-900 mb-2">Padrão</div>
                        <div className="text-sm text-gray-600">Layout clássico e profissional</div>
                      </div>
                      <div className="border-2 rounded-lg p-4 cursor-not-allowed opacity-50">
                        <div className="font-medium text-gray-900 mb-2">Outras Opções</div>
                        <div className="text-sm text-gray-600">Em breve</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="btn btn-primary">
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}