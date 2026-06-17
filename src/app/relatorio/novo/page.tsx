'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useToast } from '@/contexts/ToastContext';

interface Medicao {
  nome: string;
  valor: string;
}

interface OdontometriaItem {
  medicoes: Medicao[];
}

interface ImageItem {
  file: File | null;
  caption: string;
  preview: string;
}

export default function NovoRelatorioPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPDFSuccessModal, setShowPDFSuccessModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Helper function to get current date in Brasília timezone
  const getBrasiliaDate = () => {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    });
  };
  
  // Form state
  const [formData, setFormData] = useState({
    paciente: '',
    indicador: '',
    data: getBrasiliaDate(),
    dente: '',
    diagnostico: '',
    anestesico: '',
    grampo: '',
    lima: '',
    obturacao: '',
    cimento: '',
    selamento: '',
    prognostico: '',
    conduta: '',
  });

  const [odontometria, setOdontometria] = useState<OdontometriaItem[]>([
    { medicoes: [{ nome: 'MV', valor: '' }, { nome: 'DV', valor: '' }, { nome: 'P', valor: '' }] }
  ]);

  const [images, setImages] = useState<ImageItem[]>([{ file: null, caption: '', preview: '' }]);

  const requiredFields = ['paciente', 'data', 'dente', 'diagnostico'];
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as string }));
    setDirty(prev => new Set(prev).add(name));
    setTouched(prev => new Set(prev).add(name));
    setHasUnsavedChanges(true);
    validateField(name);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => new Set(prev).add(name));
    validateField(name);
  };

  const validateField = (name: string) => {
    const field = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (!field) return;

    const isRequired = requiredFields.includes(name);
    const value = formData[name as keyof typeof formData];
    
    if (isRequired && touched.has(name) && dirty.has(name) && !value) {
      field.classList.add('invalid');
    } else {
      field.classList.remove('invalid');
    }
  };

  // Odontometria functions
  const addOdontometriaRow = () => {
    setOdontometria(prev => [...prev, { medicoes: [{ nome: '', valor: '' }] }]);
    setHasUnsavedChanges(true);
  };

  const removeOdontometriaRow = (index: number) => {
    if (odontometria.length > 1) {
      setOdontometria(prev => prev.filter((_, i) => i !== index));
      setHasUnsavedChanges(true);
    }
  };

  const addMedicao = (itemIndex: number) => {
    setOdontometria(prev => prev.map((item, i) => 
      i === itemIndex ? { ...item, medicoes: [...item.medicoes, { nome: '', valor: '' }] } : item
    ));
    setHasUnsavedChanges(true);
  };

  const removeMedicao = (itemIndex: number, medicaoIndex: number) => {
    setOdontometria(prev => prev.map((item, i) => 
      i === itemIndex && item.medicoes.length > 1 
        ? { ...item, medicoes: item.medicoes.filter((_, j) => j !== medicaoIndex) }
        : item
    ));
    setHasUnsavedChanges(true);
  };

  const updateMedicao = (itemIndex: number, medicaoIndex: number, field: 'nome' | 'valor', value: string) => {
    setOdontometria(prev => prev.map((item, i) => 
      i === itemIndex 
        ? { ...item, medicoes: item.medicoes.map((med, j) => j === medicaoIndex ? { ...med, [field]: value } : med) }
        : item
    ));
    setHasUnsavedChanges(true);
  };

  // Image functions
  const addImageRow = () => {
    if (images.length < 10) {
      setImages(prev => [...prev, { file: null, caption: '', preview: '' }]);
      setHasUnsavedChanges(true);
    } else {
      setError('Máximo de 10 imagens permitido');
    }
  };

  const removeImageRow = (index: number) => {
    if (images.length > 1) {
      setImages(prev => prev.filter((_, i) => i !== index));
      setHasUnsavedChanges(true);
    }
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Apenas imagens JPEG, PNG ou WebP são permitidas');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, file, preview: e.target?.result as string } : img
      ));
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));
    setHasUnsavedChanges(true);
  };

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      router.push(path);
    }
  };

  const handleUnsavedConfirm = (save: boolean) => {
    setShowUnsavedModal(false);
    if (save) {
      saveReport().then(() => {
        if (pendingNavigation) {
          router.push(pendingNavigation);
          setPendingNavigation(null);
        }
      });
    } else {
      if (pendingNavigation) {
        router.push(pendingNavigation);
        setPendingNavigation(null);
      }
    }
  };

  const handleUnsavedCancel = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  // Generate automatic conduta
  const generateCondutaPreview = () => {
    let conduta = `Paciente: ${formData.paciente}\nDente: ${formData.dente}\nDiagnóstico: ${formData.diagnostico}\n\n`;
    
    if (formData.anestesico) conduta += `Anestesia: ${formData.anestesico}\n`;
    if (formData.grampo) conduta += `Grampo: ${formData.grampo}\n`;
    if (formData.lima) conduta += `Instrumentação: ${formData.lima}\n`;

    if (odontometria.length > 0) {
      conduta += `\nOdontometria:\n`;
      odontometria.forEach((item, i) => {
        const line = item.medicoes.filter(m => m.nome && m.valor).map(m => `${m.nome}=${m.valor}mm`).join(', ');
        if (line) conduta += `  Canal ${i + 1}: ${line}\n`;
      });
    }

    if (formData.obturacao) conduta += `\nObturação: ${formData.obturacao}\n`;
    if (formData.cimento) conduta += `Cimento: ${formData.cimento}\n`;
    if (formData.selamento) conduta += `Selamento da coroa: ${formData.selamento}\n`;

    setFormData(prev => ({ ...prev, conduta }));
    setHasUnsavedChanges(true);
  };

  // PDF Import
  const importPDF = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const res = await fetch('/api/relatorio/importar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao importar PDF');
      }

      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        paciente: data.paciente || '',
        indicador: data.indicador || '',
        data: data.data || prev.data,
        dente: data.dente || '',
        diagnostico: data.diagnostico || '',
        anestesico: data.anestesico || '',
        grampo: data.grampo || '',
        lima: data.lima || '',
        obturacao: data.obturacao || '',
        cimento: data.cimento || '',
        selamento: data.selamento || '',
        prognostico: data.prognostico || '',
      }));

      if (data.odontometria && data.odontometria.length > 0) {
        setOdontometria(data.odontometria);
      }

      if (data.images && data.images.length > 0) {
        setImages(data.images.map((img: any) => ({
          file: null,
          caption: img.caption,
          preview: img.data ? `data:image/jpeg;base64,${img.data}` : '',
        })));
      }
      setHasUnsavedChanges(true);
      
      // Show info toast about images not being extracted from PDF
      showToast('Importação concluída. Nota: Imagens não são extraídas do PDF automaticamente.', 'info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar PDF');
      showToast('Erro ao importar PDF', 'error');
    } finally {
      setLoading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`O campo ${field} é obrigatório`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append('odontometria', JSON.stringify(odontometria));

      images.forEach((img, i) => {
        if (img.file) {
          formDataToSend.append('images', img.file);
          formDataToSend.append('captions', img.caption);
        } else if (img.preview) {
          const [, base64Data] = img.preview.split(',');
          const mimeMatch = img.preview.match(/^data:(image\/[^;]+);base64,/);
          const mimeType = mimeMatch?.[1] || 'image/jpeg';
          const byteCharacters = atob(base64Data || '');
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j += 1) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const extension = mimeType.split('/')[1] || 'jpg';
          const previewFile = new File([byteArray], `image-${i + 1}.${extension}`, { type: mimeType });
          formDataToSend.append('images', previewFile);
          formDataToSend.append('captions', img.caption);
        } else {
          formDataToSend.append('images', '');
          formDataToSend.append('captions', '');
        }
      });

      const res = await fetch('/api/relatorio/gerar-pdf', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${formData.paciente.replace(/\s+/g, '-')}-${formData.data}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();

      // Show PDF success modal
      setShowPDFSuccessModal(true);
      showToast('PDF gerado com sucesso!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PDF');
      showToast('Erro ao gerar PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save report
  const saveReport = async () => {
    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`O campo ${field} é obrigatório`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const formDataToSend = {
        paciente: formData.paciente,
        dente: formData.dente,
        data: formData.data,
        diagnostico: formData.diagnostico,
        formData: {
          ...formData,
          odontometria,
          images: images.filter(img => img.preview).map(img => ({
            data: img.preview.split(',')[1],
            caption: img.caption,
          })),
        },
      };

      const res = await fetch('/api/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataToSend),
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar relatório');
      }

      // Show success modal instead of alert
      setShowSuccessModal(true);
      setHasUnsavedChanges(false);
      showToast('Relatório salvo com sucesso!', 'success');
      // Don't reset form after saving
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar relatório');
      showToast('Erro ao salvar relatório', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      paciente: '',
      indicador: '',
      data: getBrasiliaDate(),
      dente: '',
      diagnostico: '',
      anestesico: '',
      grampo: '',
      lima: '',
      obturacao: '',
      cimento: '',
      selamento: '',
      prognostico: '',
      conduta: '',
    });
    setOdontometria([{ medicoes: [{ nome: 'MV', valor: '' }, { nome: 'DV', valor: '' }, { nome: 'P', valor: '' }] }]);
    setImages([{ file: null, caption: '', preview: '' }]);
    setTouched(new Set());
    setDirty(new Set());
    setHasUnsavedChanges(false);
    setError(null);
  };

  // Add beforeunload event listener for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          hasUnsavedChanges={hasUnsavedChanges}
          onNavigationAttempt={(path) => {
            if (hasUnsavedChanges) {
              setPendingNavigation(path);
              setShowUnsavedModal(true);
              return false;
            }
            return true;
          }}
        />
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'block' : 'none' }}></div>
        <main className="main-content">
          {/* Header */}
          <header className="main-header">
            <div className="header-left">
              <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="header-titles">
                <h1>Gerador de Relatório Endodôntico</h1>
                <p className="subtitle">Documentação automática e inteligente de tratamentos de canal</p>
              </div>
            </div>
            <div className="header-actions">
              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && importPDF(e.target.files[0])}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => pdfInputRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Importar Relatório</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={generatePDF}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <span>{loading ? 'Gerando...' : 'Gerar PDF'}</span>
              </button>
            </div>
          </header>

          {/* Form */}
          <div className="form-container">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Dados do Paciente */}
            <div className="form-card" id="section-paciente">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                  <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
                </svg>
                <h2>Dados do Paciente</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Paciente <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                      <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
                    </svg>
                    <input
                      type="text"
                      name="paciente"
                      value={formData.paciente}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Nome completo do paciente"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Indicador</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <input
                      type="text"
                      name="indicador"
                      value={formData.indicador}
                      onChange={handleInputChange}
                      placeholder="Quem indicou o paciente"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Data do Atendimento <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
                      type="date"
                      name="data"
                      value={formData.data}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Dente <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                    <input
                      type="text"
                      name="dente"
                      value={formData.dente}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Ex: 14, 26, 37"
                      required
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Diagnóstico <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <input
                      type="text"
                      name="diagnostico"
                      value={formData.diagnostico}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Ex: Pulpite Irreversível"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes do Procedimento */}
            <div className="form-card" id="section-procedimento">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.7 6.3a1 1 0 00-1.4 0l-1.6 1.6a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l1.6-1.6a1 1 0 000-1.4l-1.6-1.6z" />
                  <path d="M18 9l-2 2" />
                  <path d="M14 5l-2 2" />
                  <path d="M7 17l-2 2" />
                  <path d="M3 13l2 2" />
                </svg>
                <h2>Detalhes do Procedimento</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Anestésico</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <input
                      type="text"
                      name="anestesico"
                      value={formData.anestesico}
                      onChange={handleInputChange}
                      placeholder="Ex: Lidocaína 2%"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Grampo</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                    </svg>
                    <input
                      type="text"
                      name="grampo"
                      value={formData.grampo}
                      onChange={handleInputChange}
                      placeholder="Ex: 206, 210"
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Lima Utilizada</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <input
                      type="text"
                      name="lima"
                      value={formData.lima}
                      onChange={handleInputChange}
                      placeholder="Ex: K-files #10-40, Rotary ProTaper"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Odontometria */}
            <div className="form-card" id="section-odontometria">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
                <h2>Odontometria</h2>
              </div>
              {odontometria.map((item, itemIndex) => (
                <div key={itemIndex} className="odontometria-row">
                  <div className="odontometria-header">
                    <h4>Canal {itemIndex + 1}</h4>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeOdontometriaRow(itemIndex)}
                      disabled={odontometria.length === 1}
                    />
                  </div>
                  <div className="medicoes-container">
                    {item.medicoes.map((med, medIndex) => (
                      <div key={medIndex} className="medicao-row">
                        <div className="form-group">
                          <label>Nome</label>
                          <input
                            type="text"
                            value={med.nome}
                            onChange={(e) => updateMedicao(itemIndex, medIndex, 'nome', e.target.value)}
                            placeholder="Ex: MV, DV, P"
                          />
                        </div>
                        <div className="form-group">
                          <label>Valor (mm)</label>
                          <input
                            type="text"
                            value={med.valor}
                            onChange={(e) => updateMedicao(itemIndex, medIndex, 'valor', e.target.value)}
                            placeholder="Ex: 18.5"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeMedicao(itemIndex, medIndex)}
                          disabled={item.medicoes.length === 1}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-add-medicao"
                    onClick={() => addMedicao(itemIndex)}
                  >
                    + Adicionar Medição
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-add"
                onClick={addOdontometriaRow}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar Canal
              </button>
            </div>

            {/* Obturação */}
            <div className="form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h2>Obturação</h2>
              </div>
              <div className="form-group">
                <label>Descrição da Obturação</label>
                <textarea
                  name="obturacao"
                  value={formData.obturacao}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva a obturação realizada..."
                />
              </div>
            </div>

            {/* Cimento */}
            <div className="form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
                <h2>Cimento</h2>
              </div>
              <div className="form-group">
                <label>Cimento Utilizado</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  <input
                    type="text"
                    name="cimento"
                    value={formData.cimento}
                    onChange={handleInputChange}
                    placeholder="Ex: AH Plus, MTA Fillapex"
                  />
                </div>
              </div>
            </div>

            {/* Selamento da Coroa */}
            <div className="form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <h2>Selamento da Coroa</h2>
              </div>
              <div className="form-group">
                <label>Descrição do Selamento</label>
                <textarea
                  name="selamento"
                  value={formData.selamento}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva o selamento da coroa..."
                />
              </div>
            </div>

            {/* Prognóstico */}
            <div className="form-card">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
                <h2>Prognóstico</h2>
              </div>
              <div className="form-group">
                <label>Prognóstico</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                  <select
                    name="prognostico"
                    value={formData.prognostico}
                    onChange={handleInputChange}
                    className="with-icon"
                  >
                    <option value="">Selecione...</option>
                    <option value="Favorável">Favorável</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Desfavorável">Desfavorável</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div className="form-card" id="section-radiografia">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <h2>Imagens</h2>
              </div>
              {images.map((img, index) => (
                <div key={index} className="image-row">
                  <div className="image-row-fields">
                    <div className="form-group">
                      <label>Imagem</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => e.target.files?.[0] && handleImageChange(index, e.target.files[0])}
                      />
                    </div>
                    <div className="form-group">
                      <label>Legenda</label>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        placeholder="Ex: Rx inicial"
                        maxLength={50}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeImageRow(index)}
                      disabled={images.length === 1}
                    />
                  </div>
                  <div className="image-preview">
                    {img.preview ? (
                      <img src={img.preview} alt="Preview" />
                    ) : (
                      'Pré-visualização da imagem'
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-add"
                onClick={addImageRow}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar Imagem
              </button>
              <p className="help-text">Máximo 10 imagens, 5MB cada. Formatos: JPEG, PNG, WebP</p>
            </div>

            {/* Preview da Conduta */}
            <div className="form-card" id="section-conduta">
              <div className="card-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2>Preview da Conduta</h2>
              </div>
              <div className="form-group">
                <label>Conduta (gerada automaticamente, editável)</label>
                <textarea
                  name="conduta"
                  value={formData.conduta}
                  onChange={handleInputChange}
                  rows={8}
                  placeholder="Clique em 'Gerar Preview' para gerar a conduta automaticamente..."
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: '10px' }}
                  onClick={generateCondutaPreview}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '16px', height: '16px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Gerar Preview
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <footer className="footer-actions">
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Limpar Formulário
            </button>
            <button type="button" className="btn btn-outline" onClick={saveReport} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-primary" onClick={generatePDF} disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar PDF'}
            </button>
          </footer>
        </main>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Sucesso"
        message="Relatório salvo com sucesso!"
        type="success"
      />
      <Modal
        isOpen={showPDFSuccessModal}
        onClose={() => setShowPDFSuccessModal(false)}
        title="Sucesso"
        message="PDF gerado com sucesso!"
        type="success"
      />
      <Modal
        isOpen={showUnsavedModal}
        onClose={handleUnsavedCancel}
        onConfirm={() => handleUnsavedConfirm(true)}
        onDiscard={() => handleUnsavedConfirm(false)}
        title="Alterações não salvas"
        message="Você tem alterações não salvas. Deseja salvar antes de sair?"
        confirmText="Salvar"
        cancelText="Cancelar"
        discardText="Descartar"
        type="warning"
      />
    </ProtectedRoute>
  );
}
