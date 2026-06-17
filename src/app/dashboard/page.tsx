'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useToast } from '@/contexts/ToastContext';

interface Report {
  id: string;
  patientName: string;
  tooth: string;
  date: string;
  diagnosis: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/relatorio');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setReportToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      const res = await fetch(`/api/relatorio/${reportToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== reportToDelete));
        setShowDeleteModal(false);
        setReportToDelete(null);
        showToast('Relatório excluído com sucesso!', 'success');
      } else {
        setError('Erro ao excluir relatório');
        showToast('Erro ao excluir relatório', 'error');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Erro ao excluir relatório');
      showToast('Erro ao excluir relatório', 'error');
    }
  };

  const filteredReports = reports.filter((report) =>
    report.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
                <h1>Dashboard</h1>
                <p className="subtitle">Gerencie seus relatórios endodônticos</p>
              </div>
            </div>
            <div className="header-actions">
              <Link
                href="/relatorio/novo"
                className="btn btn-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Relatório</span>
              </Link>
            </div>
          </div>
          <div className="form-container">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nome do paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Reports Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando relatórios...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório ainda'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? 'Tente buscar com outro termo'
                    : 'Comece criando seu primeiro relatório endodôntico'}
                </p>
                {!searchTerm && (
                  <Link
                    href="/relatorio/novo"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Criar Relatório
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Dente
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Data do Atendimento
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Diagnóstico
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {report.patientName}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {report.tooth} • {formatDate(report.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-600">{report.tooth}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-600">{formatDate(report.date)}</div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {report.diagnosis}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/relatorio/${report.id}`}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <span className="hidden sm:inline">Editar</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(report.id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <polyline points="3,6 5,6 21,6" />
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                                <span className="hidden sm:inline">Excluir</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReportToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </ProtectedRoute>
  );
}
