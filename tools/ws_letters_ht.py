"""Rebuild the Kreyol letter-tracing pages of worksheets/mondiloo-worksheets-ht.pdf
with the official 32-letter alphabet, keeping the cover and the other pages.
Usage: python3 tools/ws_letters_ht.py <old.pdf> <out.pdf>
"""
import sys, io
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth
from pypdf import PdfReader, PdfWriter

ALPHA = ["A","An","B","Ch","D","E","È","En","F","G","H","I","J","K","L","M","N","Ng",
         "O","Ò","On","Ou","Oun","P","R","S","T","Ui","V","W","Y","Z"]
W, H = 612, 792
RAINBOW = [(1,.419608,.356863),(1,.784314,.239216),(.176471,.745098,.494118),(.184314,.501961,.929412),
           (.556863,.360784,.960784),(.878431,.270588,.482353),(1,.784314,.239216),(1,.419608,.356863)]
GREY = (.419608,.443137,.564706); NAVY=(.141176,.188235,.368627)
LINE=(.788235,.811765,.878431); DASH=(.603922,.639216,.74902); RED=(1,.419608,.356863)

def header(c, page):
    x = 43.2
    c.setFont("Helvetica-Bold", 16)
    for ch, col in zip("Mondiloo", RAINBOW):
        c.setFillColorRGB(*col); c.drawString(x, 742.8, ch); x += stringWidth(ch, "Helvetica-Bold", 16)
    c.setFillColorRGB(*GREY); c.setFont("Helvetica", 10)
    c.drawRightString(568.8, 744.8, "Non: ____________________   Dat: ________")
    c.setFillColorRGB(*NAVY); c.setFont("Helvetica-Bold", 24); c.drawString(43.2, 700.8, "Trase lèt yo")
    c.setStrokeColorRGB(*LINE); c.setLineWidth(1); c.line(43.2, 690.8, 568.8, 690.8)
    c.setFillColorRGB(*GREY); c.setFont("Helvetica", 8)
    c.drawString(43.2, 28.8, "Mondiloo · 509lakay LLC"); c.drawRightString(568.8, 28.8, str(page))

def row(c, L, i):
    base = 606.8 - 150*i
    pair = f"{L} {L.lower()}"
    c.setFillColorRGB(*RED); c.setFont("Helvetica-Bold", 44); c.drawString(43.2, base, pair)
    c.setStrokeColorRGB(*LINE); c.setLineWidth(1); c.setDash()
    c.line(43.2, base-8, 568.8, base-8); c.line(43.2, base+44, 568.8, base+44)
    c.setDash(4, 4); c.line(43.2, base+18, 568.8, base+18); c.setDash()
    size = 64
    w = stringWidth(pair, "Helvetica", size)
    x = max(193.2, 43.2 + stringWidth(pair, "Helvetica-Bold", 44) + 24)
    while x + w <= 568.8:
        c.saveState(); c.setStrokeColorRGB(*DASH); c.setLineWidth(1.6); c.setDash([2.5, 3], 0)
        t = c.beginText(x, base-6); t.setFont("Helvetica", size); t.setTextRenderMode(1); t.textOut(pair)
        c.drawText(t); c.restoreState()
        x += w + 24

def letter_pages(first_page):
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=(W, H))
    c.setTitle("Mondiloo · Fèy egzèsis"); c.setAuthor("509lakay LLC")
    for p in range(0, len(ALPHA), 4):
        header(c, first_page + p//4)
        for i, L in enumerate(ALPHA[p:p+4]): row(c, L, i)
        c.showPage()
    c.save(); buf.seek(0); return PdfReader(buf)

def renumber(page, n):
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=(W, H))
    c.setFillColorRGB(1,1,1); c.rect(540, 24, 32, 14, stroke=0, fill=1)
    c.setFillColorRGB(*GREY); c.setFont("Helvetica", 8); c.drawRightString(568.8, 28.8, str(n))
    c.save(); buf.seek(0); page.merge_page(PdfReader(buf).pages[0]); return page

old = PdfReader(sys.argv[1])
# old layout: p1 cover, p2-8 letters (26-letter alphabet), p9-16 numbers/counting/etc.
new = letter_pages(2)
out = PdfWriter()
out.add_page(old.pages[0])
for p in new.pages: out.add_page(p)
n = 2 + len(new.pages)
for i in range(8, len(old.pages)):
    pg = old.pages[i]
    out.add_page(renumber(pg, n) if i < len(old.pages)-1 or "Bravo" not in pg.extract_text() else pg); n += 1
out.add_metadata({"/Title": "Mondiloo · Fèy egzèsis", "/Author": "509lakay LLC"})
with open(sys.argv[2], "wb") as f: out.write(f)
print("pages:", len(out.pages))
