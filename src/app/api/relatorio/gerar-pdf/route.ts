import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

// Initialize pdfmake at module level
// @ts-ignore - pdfmake doesn't have type definitions
const pdfMakeModule = require('pdfmake/build/pdfmake');
// @ts-ignore
const vfsFontsModule = require('pdfmake/build/vfs_fonts');

const pdfMake = pdfMakeModule;
if (vfsFontsModule?.pdfMake?.vfs) {
  pdfMake.vfs = vfsFontsModule.pdfMake.vfs;
}

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


const generateHTML = () => {
  // This function is no longer used - replaced with pdfmake document builder
  return '';
};


interface PDFContent {
  text?: string;
  style?: string;
  fontSize?: number;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  margin?: number[] | number;
  columns?: any[];
  table?: any;
  image?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

const buildPDFDocument = (data: any, settings: any) => {
  const clinicName = settings?.clinicName || 'OdontoReport';
  const primaryColor = settings?.primaryColor || '#2563EB';
  const logoBase64 = settings?.logoUrl?.startsWith('data:') ? settings.logoUrl.split(',')[1] : settings?.logoUrl || '';

  const content: PDFContent[] = [];

  // Header with logo and title
  const headerContent: PDFContent[] = [];
  if (logoBase64) {
    headerContent.push({
      image: `data:image/png;base64,${logoBase64}`,
      width: 80,
      height: 80,
    });
  }
  headerContent.push({
    text: 'RELATÓRIO ENDODÔNTICO',
    fontSize: 18,
    bold: true,
    color: primaryColor,
    alignment: 'center',
    margin: [0, 10],
  });

  content.push({
    columns: headerContent,
    columnGap: 20,
    margin: [0, 0, 0, 30],
  });

  // Section: Dados do Paciente
  content.push({
    text: 'Dados do Paciente',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          { text: `Paciente: ${escapeHTML(data.paciente)}`, margin: [5, 5] },
          { text: `Indicador: ${escapeHTML(data.indicador || '-')}`, margin: [5, 5] },
        ],
        [
          { text: `Data: ${escapeHTML(data.data)}`, margin: [5, 5] },
          { text: `Dente: ${escapeHTML(data.dente)}`, margin: [5, 5] },
        ],
        [
          { text: `Diagnóstico: ${escapeHTML(data.diagnostico)}`, colSpan: 2, margin: [5, 5] },
          { text: '', margin: [5, 5] },
        ],
      ],
    },
    margin: [0, 0, 0, 20],
  });

  // Section: Detalhes do Procedimento
  content.push({
    text: 'Detalhes do Procedimento',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          { text: `Anestésico: ${escapeHTML(data.anestesico || '-')}`, margin: [5, 5] },
          { text: `Grampo: ${escapeHTML(data.grampo || '-')}`, margin: [5, 5] },
        ],
        [
          { text: `Lima Utilizada: ${escapeHTML(data.lima || '-')}`, colSpan: 2, margin: [5, 5] },
          { text: '', margin: [5, 5] },
        ],
      ],
    },
    margin: [0, 0, 0, 20],
  });

  // Section: Conduta
  content.push({
    text: 'Conduta',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    text: escapeHTML(data.conduta),
    fontSize: 10,
    margin: [0, 0, 0, 20],
  });

  // Section: Odontometria
  if (data.odontometria && data.odontometria.length > 0) {
    content.push({
      text: 'Odontometria',
      fontSize: 12,
      bold: true,
      color: primaryColor,
      margin: [0, 10, 0, 5],
    });

    const odontometriaBody = [
      [
        { text: 'Canal', bold: true, color: 'white', fillColor: primaryColor, margin: [5, 5] },
        { text: 'Medições', bold: true, color: 'white', fillColor: primaryColor, margin: [5, 5] },
      ],
    ];

    data.odontometria.forEach((item: any, index: number) => {
      let medicoesStr = '';
      if (item.medicoes && item.medicoes.length > 0) {
        medicoesStr = item.medicoes
          .map((m: any) => `${escapeHTML(m.nome)}: ${escapeHTML(m.valor)}mm`)
          .join(', ');
      } else {
        medicoesStr = `MV: ${escapeHTML(item.mv || '-')}mm, DV: ${escapeHTML(item.dv || '-')}mm, P: ${escapeHTML(item.p || '-')}mm`;
      }

      odontometriaBody.push([
        { text: `${index + 1}`, margin: [5, 5] },
        { text: medicoesStr, margin: [5, 5] },
      ] as any);
    });

    content.push({
      table: {
        widths: ['20%', '80%'],
        body: odontometriaBody,
      },
      margin: [0, 0, 0, 20],
    });
  }

  // Section: Obturação
  content.push({
    text: 'Obturação',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    text: escapeHTML(data.obturacao || '-'),
    fontSize: 10,
    margin: [0, 0, 0, 20],
  });

  // Section: Cimento
  content.push({
    text: 'Cimento',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    text: escapeHTML(data.cimento || '-'),
    fontSize: 10,
    margin: [0, 0, 0, 20],
  });

  // Section: Selamento da Coroa
  content.push({
    text: 'Selamento da Coroa',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    text: escapeHTML(data.selamento || '-'),
    fontSize: 10,
    margin: [0, 0, 0, 20],
  });

  // Section: Imagens
  if (data.images && data.images.length > 0) {
    content.push({
      text: 'Imagens',
      fontSize: 12,
      bold: true,
      color: primaryColor,
      margin: [0, 10, 0, 5],
      pageBreak: 'before',
    });

    data.images.forEach((img: any, index: number) => {
      content.push({
        image: `data:image/jpeg;base64,${img.data}`,
        width: 400,
        height: 400,
        fit: 'inside',
        margin: [0, 10, 0, 10],
        alignment: 'center',
      });
      content.push({
        text: escapeHTML(img.caption),
        fontSize: 9,
        italics: true,
        color: '#666',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      });
    });
  }

  // Section: Prognóstico
  content.push({
    text: 'Prognóstico',
    fontSize: 12,
    bold: true,
    color: primaryColor,
    margin: [0, 10, 0, 5],
  });
  content.push({
    text: escapeHTML(data.prognostico || '-'),
    fontSize: 10,
    bold: true,
    fillColor: '#f0f0f0',
    padding: 10,
    margin: [0, 0, 0, 30],
  });

  // Footer with social links
  const socialLinks = [];
  
  const socialInstagram = normalizeUrl(settings?.socialInstagram || '');
  if (socialInstagram) socialLinks.push(`Instagram: ${socialInstagram}`);
  
  const socialWhatsapp = normalizeUrl(settings?.socialWhatsapp || '');
  if (socialWhatsapp) socialLinks.push(`WhatsApp: ${socialWhatsapp}`);
  
  const socialFacebook = normalizeUrl(settings?.socialFacebook || '');
  if (socialFacebook) socialLinks.push(`Facebook: ${socialFacebook}`);
  
  const socialLinkedin = normalizeUrl(settings?.socialLinkedin || '');
  if (socialLinkedin) socialLinks.push(`LinkedIn: ${socialLinkedin}`);
  
  const socialYoutube = normalizeUrl(settings?.socialYoutube || '');
  if (socialYoutube) socialLinks.push(`YouTube: ${socialYoutube}`);
  
  const socialTiktok = normalizeUrl(settings?.socialTiktok || '');
  if (socialTiktok) socialLinks.push(`TikTok: ${socialTiktok}`);
  
  const socialX = normalizeUrl(settings?.socialTwitter || '');
  if (socialX) socialLinks.push(`X: ${socialX}`);
  
  const socialGoogle = normalizeUrl(settings?.socialGoogle || '');
  if (socialGoogle) socialLinks.push(`Google: ${socialGoogle}`);
  
  const socialWebsite = normalizeUrl(settings?.socialWebsite || '');
  if (socialWebsite) socialLinks.push(`Website: ${socialWebsite}`);

  content.push({
    text: clinicName,
    fontSize: 10,
    bold: true,
    alignment: 'center',
    margin: [0, 20, 0, 10],
  });

  if (socialLinks.length > 0) {
    content.push({
      text: socialLinks.join(' | '),
      fontSize: 8,
      color: '#666',
      alignment: 'center',
      margin: [0, 0, 0, 10],
    });
  }

  return {
    content,
    styles: {
      default: {
        font: 'Helvetica',
      },
    },
    pageMargins: [20, 20, 20, 20],
    pageSize: 'A4',
  };
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
    const conduta =
      (formData.get('conduta') as string) ||
      generateAutomaticConduta({
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

    // Build and generate PDF using pdfmake
    const docDefinition = buildPDFDocument(data, settings);
    const pdfDocGenerator = pdfMake.createPdf(docDefinition as any);

    return await new Promise<Response>((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer: any) => {
        try {
          const pdfBuffer = buffer instanceof Buffer ? Buffer.from(buffer) : buffer;
          resolve(
            new NextResponse(pdfBuffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=relatorio-${data.paciente?.toString().replace(/\s+/g, '-')}-${data.data}.pdf`,
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      });
    });
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
