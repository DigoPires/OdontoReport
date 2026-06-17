import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const escapeHTML = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const normalizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const generateHTML = (data: any, settings: any) => {
  const imagesHTML = data.images
    ?.map((img: any, index: number) => `
    <div class="image-section">
      <img src="data:image/jpeg;base64,${img.data}" alt="${img.caption}" />
      <p class="image-caption">${escapeHTML(img.caption)}</p>
    </div>
  `).join('') || '';

  const odontometriaHTML = data.odontometria
    ?.map((item: any, index: number) => {
      let medicoesStr = '';
      if (item.medicoes && item.medicoes.length > 0) {
        medicoesStr = item.medicoes
          .map((m: any) => `${escapeHTML(m.nome)}: ${escapeHTML(m.valor)}mm`)
          .join(', ');
      } else {
        medicoesStr = `MV: ${escapeHTML(item.mv || '-')}mm, DV: ${escapeHTML(item.dv || '-')}mm, P: ${escapeHTML(item.p || '-')}mm`;
      }
      return `
    <tr>
      <td>${index + 1}</td>
      <td colspan="3">${medicoesStr}</td>
    </tr>
  `;
    }).join('') || '';

  const logoBase64 = settings?.logoUrl?.startsWith('data:') ? settings.logoUrl.split(',')[1] : settings?.logoUrl || '';
  const clinicName = settings?.clinicName || 'OdontoReport';
  const primaryColor = settings?.primaryColor || '#2563EB';
  const socialInstagramUrl = normalizeUrl(settings?.socialInstagram || '');
  const socialWhatsappUrl = normalizeUrl(settings?.socialWhatsapp || '');
  const socialGoogleUrl = normalizeUrl(settings?.socialGoogle || '');
  const socialWebsiteUrl = normalizeUrl(settings?.socialWebsite || '');
  const socialFacebookUrl = normalizeUrl(settings?.socialFacebook || '');
  const socialLinkedinUrl = normalizeUrl(settings?.socialLinkedin || '');
  const socialYoutubeUrl = normalizeUrl(settings?.socialYoutube || '');
  const socialTiktokUrl = normalizeUrl(settings?.socialTiktok || '');
  const socialXUrl = normalizeUrl(settings?.socialTwitter || '');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Endodôntico</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      background: white;
    }
    
    .container {
      max-width: 100%;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .logo {
      width: ${settings?.logoSize ? (String(settings.logoSize).match(/^\d+$/) ? String(settings.logoSize) + 'px' : String(settings.logoSize)) : '80'};
      height: ${settings?.logoSize ? (String(settings.logoSize).match(/^\d+$/) ? String(settings.logoSize) + 'px' : String(settings.logoSize)) : '80'};
      object-fit: contain;
    }
    
    .title {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      flex: 1;
      color: ${primaryColor};
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 10px;
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 5px;
    }
    
    .patient-data {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .data-row {
      display: flex;
      margin-bottom: 8px;
    }
    
    .data-label {
      font-weight: bold;
      min-width: 100px;
      color: #555;
    }
    
    .data-value {
      flex: 1;
      font-weight: bold;
    }
    
    .conduta-text {
      text-align: justify;
      white-space: pre-wrap;
      page-break-inside: avoid;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    table th,
    table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    table th {
      background-color: ${primaryColor};
      color: white;
      font-weight: bold;
    }
    
    .image-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
      text-align: center;
    }
    
    .image-section img {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .image-caption {
      margin-top: 8px;
      font-style: italic;
      color: #666;
      font-size: 11px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid ${primaryColor};
      text-align: center;
      page-break-inside: avoid;
    }
    
    .footer-text {
      font-size: 11px;
      color: #666;
      margin-bottom: 15px;
    }
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      align-items: center;
    }
    
    .social-link {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: ${primaryColor};
      font-size: 10px;
    }
    
    .social-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 5px;
    }
    
    .prognostico {
      font-weight: bold;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div></div>
      <h1 class="title">RELATÓRIO ENDODÔNTICO</h1>
      ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="${clinicName}" class="logo" />` : ''}
    </div>
    
    <div class="section">
      <h2 class="section-title">Dados do Paciente</h2>
      <div class="patient-data">
        <div class="data-row">
          <span class="data-label">Paciente:</span>
          <span class="data-value">${escapeHTML(data.paciente)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Indicador:</span>
          <span class="data-value">${escapeHTML(data.indicador || '-')}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Data:</span>
          <span class="data-value">${escapeHTML(data.data)}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Dente:</span>
          <span class="data-value">${escapeHTML(data.dente)}</span>
        </div>
        <div class="data-row" style="grid-column: 1 / -1;">
          <span class="data-label">Diagnóstico:</span>
          <span class="data-value">${escapeHTML(data.diagnostico)}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Detalhes do Procedimento</h2>
      <div class="patient-data">
        <div class="data-row">
          <span class="data-label">Anestésico:</span>
          <span class="data-value">${escapeHTML(data.anestesico || '-')}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Grampo:</span>
          <span class="data-value">${escapeHTML(data.grampo || '-')}</span>
        </div>
        <div class="data-row" style="grid-column: 1 / -1;">
          <span class="data-label">Lima Utilizada:</span>
          <span class="data-value">${escapeHTML(data.lima || '-')}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Conduta</h2>
      <p class="conduta-text">${escapeHTML(data.conduta)}</p>
    </div>
    
    <div class="section">
      <h2 class="section-title">Odontometria</h2>
      <table>
        <thead>
          <tr>
            <th>Canal</th>
            <th>Medições</th>
          </tr>
        </thead>
        <tbody>
          ${odontometriaHTML}
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <h2 class="section-title">Obturação</h2>
      <p>${escapeHTML(data.obturacao)}</p>
    </div>
    
    <div class="section">
      <h2 class="section-title">Cimento</h2>
      <p>${escapeHTML(data.cimento)}</p>
    </div>
    
    <div class="section">
      <h2 class="section-title">Selamento da Coroa</h2>
      <p>${escapeHTML(data.selamento)}</p>
    </div>
    
    ${data.images?.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Imagens</h2>
      ${imagesHTML}
    </div>
    ` : ''}
    
    <div class="section">
      <h2 class="section-title">Prognóstico</h2>
      <div class="prognostico">${escapeHTML(data.prognostico)}</div>
    </div>
        <div class="footer">
      <p class="footer-text">${clinicName}</p>
      <div class="social-links">
        ${socialInstagramUrl ? `
        <a href="${socialInstagramUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>Instagram</span>
        </a>
        ` : ''}
        ${socialWhatsappUrl ? `
        <a href="${socialWhatsappUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
        ` : ''}
        ${socialFacebookUrl ? `
        <a href="${socialFacebookUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </a>
        ` : ''}
        ${socialLinkedinUrl ? `
        <a href="${socialLinkedinUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span>LinkedIn</span>
        </a>
        ` : ''}
        ${socialYoutubeUrl ? `
        <a href="${socialYoutubeUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube</span>
        </a>
        ` : ''}
        ${socialTiktokUrl ? `
        <a href="${socialTiktokUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          <span>TikTok</span>
        </a>
        ` : ''}
        ${socialXUrl ? `
        <a href="${socialXUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>X</span>
        </a>
        ` : ''}
        ${socialGoogleUrl ? `
        <a href="${socialGoogleUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          <span>Google</span>
        </a>
        ` : ''}
        ${socialWebsiteUrl ? `
        <a href="${socialWebsiteUrl}" class="social-link" target="_blank">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span>Site</span>
        </a>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

const processImage = async (buffer: Buffer) => {
  try {
    const processed = await sharp(buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    return processed.toString('base64');
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Erro ao processar imagem');
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    // Process images
    const images: any[] = [];
    const imageEntries = formData.getAll('images');
    const captions = formData.getAll('captions');

    for (let i = 0; i < imageEntries.length; i++) {
      const entry = imageEntries[i];
      const caption = typeof captions[i] === 'string' ? captions[i] : '';
      if (entry instanceof File && entry.size > 0) {
        try {
          const buffer = Buffer.from(await entry.arrayBuffer());
          const base64 = await processImage(buffer);
          images.push({
            data: base64,
            caption: caption || `Imagem ${i + 1}`,
          });
        } catch (error) {
          console.error(`Error processing image ${i}:`, error);
        }
      }
    }

    // Parse odontometria
    let odontometria = [];
    const odontometriaStr = formData.get('odontometria') as string;
    if (odontometriaStr) {
      try {
        const parsed = JSON.parse(odontometriaStr);
        odontometria = parsed;
      } catch (e) {
        console.error('Error parsing odontometria:', e);
      }
    }

    // Generate automatic conduta if not provided
    const conduta = formData.get('conduta') as string || generateAutomaticConduta({
      paciente: formData.get('paciente') as string,
      dente: formData.get('dente') as string,
      diagnostico: formData.get('diagnostico') as string,
      anestesico: formData.get('anestesico') as string,
      grampo: formData.get('grampo') as string,
      lima: formData.get('lima') as string,
      odontometria,
      obturacao: formData.get('obturacao') as string,
      cimento: formData.get('cimento') as string,
      selamento: formData.get('selamento') as string,
    });

    const data = {
      paciente: formData.get('paciente'),
      indicador: formData.get('indicador'),
      data: formData.get('data'),
      dente: formData.get('dente'),
      diagnostico: formData.get('diagnostico'),
      anestesico: formData.get('anestesico'),
      grampo: formData.get('grampo'),
      lima: formData.get('lima'),
      conduta,
      odontometria,
      obturacao: formData.get('obturacao'),
      cimento: formData.get('cimento'),
      selamento: formData.get('selamento'),
      prognostico: formData.get('prognostico'),
      images,
    };

    // Generate PDF
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
        ],
      });

      const page = await browser.newPage();
      const html = generateHTML(data, settings);

      await page.setContent(html, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });

      await browser.close();

      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=relatorio-${data.paciente?.toString().replace(/\s+/g, '-')}-${data.data}.pdf`,
        },
      });
    } catch (error) {
      if (browser) await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}

const generateAutomaticConduta = (data: any) => {
  let conduta = `Paciente: ${data.paciente}\n`;
  conduta += `Dente: ${data.dente}\n`;
  conduta += `Diagnóstico: ${data.diagnostico}\n\n`;

  if (data.anestesico) {
    conduta += `Anestesia: ${data.anestesico}\n`;
  }

  if (data.grampo) {
    conduta += `Grampo: ${data.grampo}\n`;
  }

  if (data.lima) {
    conduta += `Instrumentação: ${data.lima}\n`;
  }

  if (data.odontometria && data.odontometria.length > 0) {
    conduta += `\nOdontometria:\n`;
    data.odontometria.forEach((item: any, index: number) => {
      if (item.medicoes && item.medicoes.length > 0) {
        const medicoesStr = item.medicoes.map((m: any) => `${m.nome}=${m.valor}mm`).join(', ');
        conduta += `  Canal ${index + 1}: ${medicoesStr}\n`;
      } else {
        conduta += `  Canal ${index + 1}: MV=${item.mv || '-'}mm, DV=${item.dv || '-'}mm, P=${item.p || '-'}mm\n`;
      }
    });
  }

  if (data.obturacao) {
    conduta += `\nObturação: ${data.obturacao}\n`;
  }

  if (data.cimento) {
    conduta += `Cimento: ${data.cimento}\n`;
  }

  if (data.selamento) {
    conduta += `Selamento da coroa: ${data.selamento}\n`;
  }

  return conduta;
};
