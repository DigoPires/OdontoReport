'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

interface UserSettings {
  clinicName?: string;
  logoUrl?: string;
  primaryColor: string;
  socialInstagram?: string;
  socialWhatsapp?: string;
  socialGoogle?: string;
  socialWebsite?: string;
  layoutTemplate: string;
}

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
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
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
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
      setSettings({ ...settings, logoUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'block' : 'none' }}></div>
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

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="max-w-2xl">
              {/* Clinic Info */}
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
                      onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                      placeholder="Ex: Clínica EndoExpert"
                    />
                  </div>

                  <div className="form-group">
                    <label>Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    {settings.logoUrl && (
                      <div className="mt-2">
                        <img
                          src={settings.logoUrl}
                          alt="Logo preview"
                          className="h-20 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Cor Primária</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded cursor-pointer border border-gray-200"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="form-card">
                <div className="card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                  <h2>Redes Sociais</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="text"
                      value={settings.socialInstagram || ''}
                      onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input
                      type="text"
                      value={settings.socialWhatsapp || ''}
                      onChange={(e) => setSettings({ ...settings, socialWhatsapp: e.target.value })}
                      placeholder="https://wa.me/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Google Review</label>
                    <input
                      type="text"
                      value={settings.socialGoogle || ''}
                      onChange={(e) => setSettings({ ...settings, socialGoogle: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Site</label>
                    <input
                      type="text"
                      value={settings.socialWebsite || ''}
                      onChange={(e) => setSettings({ ...settings, socialWebsite: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Layout Template */}
              <div className="form-card">
                <div className="card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  <h2>Layout do Relatório</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      settings.layoutTemplate === 'padrao'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSettings({ ...settings, layoutTemplate: 'padrao' })}
                  >
                    <div className="font-medium text-gray-900 mb-2">Padrão</div>
                    <div className="text-sm text-gray-600">Layout clássico e profissional</div>
                  </div>

                  <div
                    className="border-2 rounded-lg p-4 cursor-not-allowed opacity-50"
                  >
                    <div className="font-medium text-gray-900 mb-2">Moderno</div>
                    <div className="text-sm text-gray-600">Em breve</div>
                  </div>

                  <div
                    className="border-2 rounded-lg p-4 cursor-not-allowed opacity-50"
                  >
                    <div className="font-medium text-gray-900 mb-2">Minimalista</div>
                    <div className="text-sm text-gray-600">Em breve</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
