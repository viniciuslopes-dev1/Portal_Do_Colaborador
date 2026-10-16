"""Gera documentação PDF a partir do guia Markdown; não integra o Apps Script."""
from pathlib import Path
import html
import re
import shutil
import zipfile

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
ARCHIVE = ROOT / 'docs' / 'referencias' / 'atualizada'
SOURCE = ROOT / 'docs' / 'GUIA_DO_PROJETO_E_ETAPAS.md'
NAVY = colors.HexColor('#13344B')
TEAL = colors.HexColor('#007D80')
INK = colors.HexColor('#263C49')
MUTED = colors.HexColor('#526875')
PALE = colors.HexColor('#EDF5F6')
WIDTH, HEIGHT = A4
DATE = '16/10/2026'


def fonts():
    # Arial no Windows; DejaVu permite execução em outros ambientes.
    candidates = [
        (Path('C:/Windows/Fonts'), ['arial.ttf', 'arialbd.ttf', 'ariali.ttf', 'arialbi.ttf']),
        (Path('/usr/share/fonts/truetype/dejavu'), ['DejaVuSans.ttf', 'DejaVuSans-Bold.ttf',
          'DejaVuSans-Oblique.ttf', 'DejaVuSans-BoldOblique.ttf']),
    ]
    for folder, files in candidates:
        if all((folder / f).exists() for f in files):
            for name, file in zip(['Body', 'Body-Bold', 'Body-Italic', 'Body-BoldItalic'], files):
                pdfmetrics.registerFont(TTFont(name, str(folder / file)))
            pdfmetrics.registerFontFamily('Body', normal='Body', bold='Body-Bold',
                                          italic='Body-Italic', boldItalic='Body-BoldItalic')
            return
    raise RuntimeError('Instale Arial ou DejaVu Sans para preservar os caracteres portugueses.')


def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle('Text', fontName='Body', fontSize=10, leading=13.5,
                         textColor=INK, spaceAfter=6, splitLongWords=True))
    s.add(ParagraphStyle('Section', parent=s['Text'], fontName='Body-Bold', fontSize=20,
                         leading=25, textColor=NAVY, spaceBefore=4, spaceAfter=16,
                         keepWithNext=True))
    s.add(ParagraphStyle('Sub', parent=s['Text'], fontName='Body-Bold', fontSize=12,
                         leading=16, textColor=TEAL, spaceBefore=9, spaceAfter=6,
                         keepWithNext=True))
    s.add(ParagraphStyle('BulletText', parent=s['Text'], leftIndent=13, firstLineIndent=-11,
                         spaceAfter=6))
    s.add(ParagraphStyle('Cell', parent=s['Text'], fontSize=8.5, leading=12, spaceAfter=0))
    s.add(ParagraphStyle('CellHead', parent=s['Cell'], fontName='Body-Bold', textColor=colors.white))
    s.add(ParagraphStyle('CoverTitle', fontName='Body-Bold', fontSize=34, leading=40,
                         textColor=NAVY, spaceAfter=20))
    s.add(ParagraphStyle('CoverSub', parent=s['Text'], fontSize=17, leading=24,
                         textColor=TEAL, spaceAfter=18))
    s.add(ParagraphStyle('Small', parent=s['Text'], fontSize=9, leading=13, textColor=MUTED))
    return s


def markup(text):
    text = text.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-')
    text = html.escape(text)
    text = re.sub(r'`([^`]+)`', r'<font color="#007D80">\1</font>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'(https://[^\s<>]+)', r'<link href="\1" color="#007D80">\1</link>', text)
    return text


class Manual(BaseDocTemplate):
    def __init__(self, path, label, **kwargs):
        super().__init__(str(path), pagesize=A4, leftMargin=48, rightMargin=48,
                         topMargin=63, bottomMargin=53, title=label,
                         author='Portal do Colaborador', **kwargs)
        self.label = label
        self.anchor = 0
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id='manual', frames=frame, onPage=self.chrome))

    def beforeDocument(self):
        self.anchor = 0

    def chrome(self, canvas, doc):
        canvas.saveState()
        if doc.page == 1:
            canvas.setFillColor(TEAL)
            canvas.rect(0, HEIGHT - 18, WIDTH, 18, fill=1, stroke=0)
            canvas.setFillColor(PALE)
            canvas.rect(0, 0, 16, HEIGHT - 18, fill=1, stroke=0)
        else:
            canvas.setFont('Body-Bold', 8)
            canvas.setFillColor(NAVY)
            canvas.drawString(48, HEIGHT - 34, 'PORTAL DO COLABORADOR')
            canvas.setFont('Body', 8)
            canvas.setFillColor(MUTED)
            canvas.drawRightString(WIDTH - 48, HEIGHT - 34, self.label)
            canvas.setStrokeColor(colors.HexColor('#D8E5E9'))
            canvas.line(48, HEIGHT - 43, WIDTH - 48, HEIGHT - 43)
        canvas.setStrokeColor(colors.HexColor('#D8E5E9'))
        canvas.line(48, 39, WIDTH - 48, 39)
        canvas.setFont('Body', 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(48, 25, f'Documentação do projeto | {DATE}')
        canvas.drawRightString(WIDTH - 48, 25, f'{doc.page}')
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if (isinstance(flowable, Paragraph) and flowable.style.name == 'Section'
                and flowable.getPlainText() != 'Sumário'):
            key = f'section-{self.anchor}'
            self.anchor += 1
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(flowable.getPlainText(), key, level=0)
            self.notify('TOCEntry', (0, flowable.getPlainText(), self.page, key))


def markdown_blocks(content, s, width, section_break=True):
    lines = content.splitlines()
    result = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('# '):
            i += 1
            continue
        if line.startswith('## '):
            if result and section_break:
                result.append(PageBreak())
            result.append(Paragraph(markup(line[3:]), s['Section']))
            i += 1
        elif line.startswith('### '):
            result.append(Paragraph(markup(line[4:]), s['Sub']))
            i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cols = [v.strip() for v in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+', c) for c in cols):
                    rows.append(cols)
                i += 1
            n = len(rows[0])
            weights = [0.30, 0.70] if n == 2 else [0.30, 0.30, 0.40]
            if len(weights) != n:
                weights = [1 / n] * n
            data = [[Paragraph(markup(c), s['CellHead' if r == 0 else 'Cell'])
                     for c in row] for r, row in enumerate(rows)]
            table = Table(data, colWidths=[width * w for w in weights], repeatRows=1,
                          hAlign='LEFT')
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), NAVY),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PALE, colors.white]),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 9),
                ('RIGHTPADDING', (0, 0), (-1, -1), 9),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LINEBELOW', (0, 0), (-1, 0), 0.6, TEAL),
            ]))
            result.extend([table, Spacer(1, 12)])
        elif line.startswith('- ') or re.match(r'^\d+\. ', line):
            prefix = '• ' if line.startswith('- ') else re.match(r'^\d+\. ', line).group()
            text = line[2:] if line.startswith('- ') else re.sub(r'^\d+\. ', '', line)
            result.append(Paragraph(markup(prefix + text), s['BulletText']))
            i += 1
        else:
            para = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||- |\d+\. )', lines[i]):
                para.append(lines[i].strip())
                i += 1
            result.append(Paragraph(markup(' '.join(para)), s['Text']))
    return result


def cover(s, subtitle, status):
    return [Spacer(1, 65), Paragraph('GUIA DO PROJETO', s['Sub']), Spacer(1, 22),
            Paragraph('Portal do<br/>Colaborador', s['CoverTitle']),
            Paragraph(markup(subtitle), s['CoverSub']), Spacer(1, 18),
            Paragraph(markup(status), s['Text']), Spacer(1, 25),
            Paragraph('HTML • CSS • JavaScript • Apps Script<br/>Google Workspace • Drive • Sheets • Sites', s['Small']),
            Spacer(1, 30), Paragraph('Edição de 16 de outubro de 2026', s['Text']),
            Paragraph('Guia para RH, administração do ambiente Google e desenvolvimento. '
                      'Dados fictícios no piloto. Validações e limites identificados em cada etapa.', s['Small']),
            PageBreak()]


def generate():
    fonts()
    s = styles()
    OUT.mkdir(parents=True, exist_ok=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    content = SOURCE.read_text(encoding='utf-8')
    # Abertura editorial da fonte já está representada na capa.
    body = content[content.index('## Como ler'):].split('### Geração dos PDFs')[0].strip()
    general_path = OUT / 'Portal_do_Colaborador_Documentacao_Completa.pdf'
    doc = Manual(general_path, 'Documentação completa')
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('TOC', parent=s['Text'], fontSize=10,
                                     leading=15, spaceBefore=7, rightIndent=22)]
    story = cover(s, 'Documentação explicativa do projeto e das oito etapas',
                  'Etapas 01 a 04 concluídas no piloto. Etapa 05 aguardando testes Google. '
                  'Etapas 06 a 08 planejadas e não iniciadas.')
    story += [Paragraph('Sumário', s['Section']), toc, PageBreak()]
    story += markdown_blocks(body, s, doc.width)
    doc.multiBuild(story)
    paths = [general_path]
    parts = re.split(r'(?=^## Etapa \d{2} - )', body, flags=re.M)
    for part in parts[1:]:
        match = re.match(r'## Etapa (\d{2}) - (.+)', part)
        number, title = match.groups()
        part = part.split('## Continuidade, glossário e fontes')[0].strip()
        path = OUT / f'Portal_do_Colaborador_Etapa_{number}.pdf'
        doc = Manual(path, f'Etapa {number}')
        state = 'Concluída no piloto, por confirmação manual do usuário.' if int(number) <= 4 else (
            'Implementada localmente. Aguardando testes e confirmação no Google.' if number == '05'
            else 'Planejamento documental. Etapa não iniciada; execução depende de autorização explícita.')
        story = cover(s, f'Etapa {number} - {title}', state)
        story.pop()  # Referências ficam na capa para evitar uma página final isolada.
        story += [Spacer(1, 12), Paragraph('Referências e continuidade', s['Sub']),
                  Paragraph('Leia também a documentação completa desta coleção e o guia editável '
                            'docs/GUIA_DO_PROJETO_E_ETAPAS.md. A situação descrita é a de 16/10/2026; '
                            'confira docs/PROGRESSO.md antes de executar procedimentos. '
                            'Os registros originais preservam o histórico; este manual é uma explicação consolidada.', s['Text'])]
        if int(number) <= 5:
            story.append(Paragraph(f'Registro detalhado: docs/etapas/ETAPA_{number}.md.', s['Text']))
        story.append(Paragraph('Fontes oficiais: <link href="https://developers.google.com/apps-script/guides/web" '
                               'color="#007D80">Web Apps e implantação</link>; '
                               '<link href="https://developers.google.com/apps-script/reference/base/session" '
                               'color="#007D80">Session</link>; '
                               '<link href="https://developers.google.com/apps-script/guides/services/quotas" '
                               'color="#007D80">quotas</link>; '
                               '<link href="https://developers.google.com/workspace/drive/api/guides/manage-sharing" '
                               'color="#007D80">compartilhamento Drive</link>. Consultadas em 16/10/2026.', s['Small']))
        story.append(PageBreak())
        story += markdown_blocks(part, s, doc.width)
        doc.build(story)
        paths.append(path)
    for path in paths:
        reader = PdfReader(path)
        text = '\n'.join(p.extract_text() or '' for p in reader.pages)
        if len(reader.pages) < 2 or '\ufffd' in text or 'Portal do' not in text:
            raise RuntimeError(f'PDF inválido: {path}')
        shutil.copy2(path, ARCHIVE / path.name)
        print(f'{path.name}: {len(reader.pages)} páginas, {len(text)} caracteres')
    bundle = OUT / 'Portal_do_Colaborador_Documentacao_PDFs.zip'
    with zipfile.ZipFile(bundle, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for path in paths:
            z.write(path, path.name)
    print(f'Pacote: {bundle}')


if __name__ == '__main__':
    generate()
