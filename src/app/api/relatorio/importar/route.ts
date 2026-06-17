import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractText } from 'unpdf';

export const runtime = 'nodejs';

async function getPdfText(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const { text } = await extractText(uint8Array, { mergePages: true });
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      return NextResponse.json({ error: 'Nenhum arquivo PDF enviado' }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = (await getPdfText(buffer))
      .replace(/\r\n/g, '\n')
      .replace(/\u00A0/g, ' ')
      .replace(/\u200B/g, '');

    const extractedData: any = {
      paciente: '',
      indicador: '',
      data: '',
      dente: '',
      diagnostico: '',
      anestesico: '',
      grampo: '',
      lima: '',
      obturacao: '',
      cimento: '',
      selamento: '',
      prognostico: '',
      conduta: '', // Empty - generated later by the app, not extracted from PDF
      odontometria: [],
      images: [],
    };

    // Extract patient data
    const pacienteMatch = text.match(/Paciente:\s*(.*?)(?=\s*Indicador:|$)/);
    if (pacienteMatch) extractedData.paciente = pacienteMatch[1].trim();

    const indicadorMatch = text.match(/Indicador:\s*(.*?)(?=\s*Data:|$)/);
    if (indicadorMatch) extractedData.indicador = indicadorMatch[1].trim();

    const dataMatch = text.match(/Data:\s*(.*?)(?=\s*Dente:|$)/);
    if (dataMatch) extractedData.data = dataMatch[1].trim();

    const denteMatch = text.match(/Dente[:\-]?\s*(.*?)(?=\s*Diagn[oó]stico[:\-]?|$)/i);
    if (denteMatch) extractedData.dente = denteMatch[1].trim();

    // Extract inline fields that appear BEFORE Conduta section
    const diagnosticoMatch = text.match(/Diagn[oó]stico[:\s*]?\s*(.*?)(?=\s*(?:Detalhes|Conduta|Anest|$))/i);
    if (diagnosticoMatch) extractedData.diagnostico = diagnosticoMatch[1].trim();

    const anestesicoMatch = text.match(/Anest[eé]sico[:\s]+\s*([\s\S]*?)(?=\s*Grampo|\s*Lima|\s*Conduta)/i);
    if (anestesicoMatch) extractedData.anestesico = anestesicoMatch[1].trim();

    const grampoMatch = text.match(/Grampo:\s*(.*?)(?=\s*(?:Lima|Conduta)|\n|$)/i);
    if (grampoMatch) extractedData.grampo = grampoMatch[1].trim();

    const limaMatch = text.match(/Lima Utilizada:\s*(.*?)(?=\n|Conduta)/i);
    if (limaMatch) extractedData.lima = limaMatch[1].trim();

    // Get only the text after the Conduta block (after "Odontometria" heading)
    const postCondutaMatch = text.match(/Odontometria[\s\S]*/i);
    const postCondutaText = postCondutaMatch ? postCondutaMatch[0] : '';

    // Extract from structured sections after Conduta
    const obturacaoMatch = postCondutaText.match(/Obtura[cç][aã]o[\s\n]+([\s\S]*?)(?=[\s\n]+(?:Cimento|Selamento(?:\s*da\s*Coroa)?|Imagens|Progn[oó]stico)|$)/i);
    if (obturacaoMatch) extractedData.obturacao = obturacaoMatch[1].trim();

    const cimentoMatch = postCondutaText.match(/Cimento[\s\n]+([\s\S]*?)(?=[\s\n]+(?:Selamento(?:\s*da\s*Coroa)?|Imagens|Progn[oó]stico)|$)/i);
    if (cimentoMatch) extractedData.cimento = cimentoMatch[1].trim();

    const selamentoMatch = postCondutaText.match(/Selamento\s*da\s*Coroa[\s\n]+([\s\S]*?)(?=[\s\n]+(?:Imagens|Progn[oó]stico)|$)/i);
    if (selamentoMatch) extractedData.selamento = selamentoMatch[1].trim();

    const prognosticoMatch = postCondutaText.match(/Progn[oó]stico[\s\n]+([\s\S]*?)(?=[\s\n]+(?:DigoBigode|Instagram|WhatsApp|Site)|$)/i);
    if (prognosticoMatch) {
      extractedData.prognostico = prognosticoMatch[1]
        .split(/(?:DigoBigode|Instagram|WhatsApp|Google|Site)/i)[0]
        .trim()
        .replace(/\.$/, '');
    }

    // Extract odontometria - fix to properly separate channels
    const odontometriaMatches = text.matchAll(/Canal\s*(\d+):\s*(.+?)(?=\s*Canal\s*\d+:|$)/gi);
    for (const match of odontometriaMatches) {
      const canalNum = match[1];
      const measurementsStr = match[2].trim();

      const medicoes: any[] = [];
      const medicaoMatches = measurementsStr.matchAll(/(\w+)=([\d.]+)mm/g);
      for (const medicaoMatch of medicaoMatches) {
        medicoes.push({
          nome: medicaoMatch[1],
          valor: medicaoMatch[2],
        });
      }

      if (medicoes.length > 0) {
        extractedData.odontometria.push({ medicoes });
      } else {
        const oldFormatMatch = measurementsStr.match(/MV=([\d.]+)mm,\s*DV=([\d.]+)mm,\s*P=([\d.]+)mm/);
        if (oldFormatMatch) {
          extractedData.odontometria.push({
            mv: oldFormatMatch[1],
            dv: oldFormatMatch[2],
            p: oldFormatMatch[3],
          });
        }
      }
    }

    // Images cannot be reliably extracted from PDF
    extractedData.images = [];

    // Return extracted data without auto-saving
    return NextResponse.json(extractedData);
  } catch (error) {
    console.error('Error importing PDF:', error);
    return NextResponse.json({ error: 'Erro ao importar PDF' }, { status: 500 });
  }
}
