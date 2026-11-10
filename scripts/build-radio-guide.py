from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
import io, base64, argparse
from pathlib import Path

# Emit base64 on stdout; decode into assets/VATSIM-ATC-Communication-Guide.pdf.
def first_font(*paths):
 for path in paths:
  if Path(path).is_file(): return path
 raise FileNotFoundError('Install Segoe UI or DejaVu Sans to generate the guide')
pdfmetrics.registerFont(TTFont('Segoe', first_font('C:/Windows/Fonts/segoeui.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('SegoeBold', first_font('C:/Windows/Fonts/segoeuib.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')))
W,H=A4
BG=HexColor('#071320'); PANEL=HexColor('#10263a'); EDGE=HexColor('#31516d'); WHITE=HexColor('#e8f2ff'); MUTED=HexColor('#a9bed1'); BLUE=HexColor('#9ad6ff'); ORANGE=HexColor('#ffa46f')
# Every option is a separate, selectable text line. Replace bracketed values with actual details.
pages=[
('01', 'Before the first call', 'PREPARATION  /  RADIO CHECK', [
 ('SET UP', [('CHECK','Flight plan filed; charts, departure route and airport diagram ready.'),('CHECK','Listen to ATIS and note its letter, runway, QNH and relevant information.'),('CHECK','Identify the appropriate controller and listen before transmitting.')], 'A radio check is optional. Keep the frequency clear when it is busy.'),
 ('RADIO CHECK  /  choose one', [('PILOT','[Station], [callsign], radio check.'),('ATC','[Callsign], readability five.'),('PILOT','Readability five, [callsign].'),('IF WEAK','[Callsign], readability two. Please check your microphone.')], 'Readability is reported from 1 (unreadable) to 5 (perfectly readable).'),
 ('FIRST CONTACT', [('FORMULA','Station + full callsign + position + information + request.'),('EXAMPLE','Rome Delivery, Speedbird one two three, stand two zero one, information Alpha, request IFR clearance to London Heathrow.')], 'Write down the clearance before reading it back.')]),
('02','Clearance & start','DEPARTURE  /  AT THE STAND',[
 ('IFR CLEARANCE', [('ATC','Speedbird one two three, cleared to London Heathrow via [SID], initial climb [altitude], squawk [code].'),('PILOT','Cleared to London Heathrow via [SID], initial climb [altitude], squawk [code], Speedbird one two three.'),('CLARIFY','Confirm initial altitude, Speedbird one two three.')], 'Read back the clearance as issued, including route, initial level, squawk and any restrictions.'),
 ('PUSHBACK & ENGINE START  /  choose one', [('BOTH','[Station], [callsign], stand [number], request pushback and start.'),('START ONLY','[Station], [callsign], stand [number], request start-up.'),('ATC','[Callsign], pushback and start approved, facing [direction].'),('READ BACK','Pushback and start approved, facing [direction], [callsign].')], 'An approval may include a direction or condition. Do not assume taxi approval.')]),
('03','Taxi & runway','DEPARTURE  /  ON THE GROUND',[
 ('TAXI', [('PILOT','[Station], [callsign], ready to taxi.'),('ATC','[Callsign], taxi to holding point runway [runway] via [route], hold short of runway [runway].'),('READ BACK','Taxi to holding point runway [runway] via [route], hold short of runway [runway], [callsign].'),('UNSURE','[Callsign], confirm taxi route after [taxiway].')], 'Taxi on the cleared route. Hold short means stop before the runway holding point.'),
 ('CROSS OR HOLD  /  choose the actual instruction', [('ATC','[Callsign], cross runway [runway].'),('PILOT','Cross runway [runway], [callsign].'),('ATC','[Callsign], hold short of runway [runway].'),('PILOT','Hold short of runway [runway], [callsign].')], 'A taxi clearance alone is not permission to cross an intervening runway.'),
 ('TOWER HANDOFF', [('ATC','[Callsign], contact Tower [frequency].'),('PILOT','Tower [frequency], [callsign].'),('NEW CALL','[Tower], [callsign], holding point runway [runway], ready for departure.')], 'Change frequency when instructed.')]),
('04','Takeoff & climb','DEPARTURE  /  AIRBORNE',[
 ('LINE UP OR TAKE OFF  /  read back the one issued', [('ATC','[Callsign], runway [runway], line up and wait.'),('PILOT','Runway [runway], line up and wait, [callsign].'),('ATC','[Callsign], runway [runway], cleared for takeoff.'),('PILOT','Runway [runway], cleared for takeoff, [callsign].')], 'Line up and wait is not a takeoff clearance.'),
 ('DEPARTURE CONTACT', [('CHECK IN','[Departure], [callsign], passing [altitude], climbing [assigned altitude].'),('LEVEL','[Station], [callsign], level [altitude or flight level].'),('ATC','[Callsign], climb flight level one five zero.'),('READ BACK','Climb flight level one five zero, [callsign].')], 'On check-in while changing level, give both your current and assigned levels.'),
 ('HEADING & SPEED', [('ATC','[Callsign], turn right heading two seven zero, speed two one zero knots.'),('PILOT','Right heading two seven zero, speed two one zero knots, [callsign].')], 'Read back turn direction, heading and speed; apply only what is assigned.')]),
('05','En route & descent','CRUISE  /  ARRIVAL PREPARATION',[
 ('FREQUENCY CHANGE', [('ATC','[Callsign], contact [station] [frequency].'),('READ BACK','[Station] [frequency], [callsign].'),('LEVEL','[Station], [callsign], flight level [level].'),('CHANGING','[Station], [callsign], passing flight level [level], descending flight level [level].')], 'Use the full callsign on initial contact. Do not change frequency before the handoff.'),
 ('ROUTING  /  choose one', [('ATC','[Callsign], proceed direct [waypoint].'),('PILOT','Direct [waypoint], [callsign].'),('REQUEST','[Callsign], request direct [waypoint].')], 'A request is not approval. Check the cleared waypoint before changing the route.'),
 ('DESCENT', [('REQUEST','[Station], [callsign], request descent.'),('ATC','[Callsign], descend flight level one one zero.'),('PILOT','Descend flight level one one zero, [callsign].')], 'Do not leave an assigned level until cleared or instructed. Prepare arrival information early.')]),
('06','Approach & landing','ARRIVAL  /  IN THE TERMINAL AREA',[
 ('VECTORS, QNH & APPROACH', [('ATC','[Callsign], turn left heading two seven zero, descend altitude four thousand feet, QNH one zero one three.'),('PILOT','Left heading two seven zero, descend altitude four thousand feet, QNH one zero one three, [callsign].'),('ATC','[Callsign], cleared ILS approach runway two seven left.'),('PILOT','Cleared ILS approach runway two seven left, [callsign].')], 'An approach clearance does not itself authorise landing. Follow the approach clearance and restrictions.'),
 ('TOWER & LANDING', [('PILOT','[Tower], [callsign], established ILS runway two seven left.'),('ATC','[Callsign], runway two seven left, cleared to land.'),('PILOT','Runway two seven left, cleared to land, [callsign].')], 'Include the complete runway designator, including left, right or centre.'),
 ('GO-AROUND', [('PILOT','[Callsign], going around.'),('FOLLOW','Fly the applicable missed approach or ATC instructions, as appropriate.')], 'Advise ATC promptly and listen for further instructions.')]),
('07','Vacate & park','ARRIVAL  /  BACK ON THE GROUND',[
 ('AFTER LANDING', [('ATC','[Callsign], vacate via [taxiway], contact Ground [frequency] when clear.'),('PILOT','Vacate via [taxiway], Ground [frequency] when clear, [callsign].'),('PILOT','[Ground], [callsign], runway [runway] vacated via [taxiway], request taxi to stand.')], 'Report the runway vacated only once the entire aircraft is clear of the runway holding position.'),
 ('TAXI TO STAND', [('ATC','[Callsign], taxi to stand [number] via [route].'),('PILOT','Taxi to stand [number] via [route], [callsign].'),('IF NEEDED','[Callsign], confirm stand [number] and taxi route.'),('OPTIONAL','[Callsign], on stand, thank you.')], 'Use the airport diagram. Observe any runway crossing or hold-short instruction.')]),
('08','When you need help','QUICK REFERENCE  /  CHOOSE THE PHRASE',[
 ('ASK, CONFIRM OR DECLINE', [('REPEAT','Say again, [callsign].'),('PART','Say again the taxi route, [callsign].'),('SLOWER','Speak slower, [callsign].'),('CONFIRM','Confirm assigned altitude, [callsign].'),('UNABLE','Unable [instruction], request [alternative], [callsign].'),('WAIT','Stand by, [callsign].')], 'If you are unsure, ask before acting. Acknowledge instructions addressed to your callsign.'),
 ('READBACK QUICK LIST', [('ROUTE','Route / SID / approach, assigned level and any restrictions.'),('GROUND','Taxi route, runway, hold-short, crossing, line-up, takeoff and landing clearances.'),('SETTINGS','Heading and direction, speed, QNH, squawk and frequency.')], 'Read back what was actually issued; local procedures and controller instructions can differ.'),
 ('REFERENCES', [('VATSIM','vatsim.net/docs/pilots/pilot-basics/'),('LOCAL','docs.vatsim.uk/Pilots/'),('RADIO','faa.gov/air_traffic/publications/aim_html/chap4_section_3.html')], 'Use current charts, local procedures and the instructions you receive.')]),
('09','No controller online','ADVISORY  /  COORDINATE WITH TRAFFIC',[
 ('CHECK COVERAGE FIRST', [('CHECK','An approach or centre controller may cover lower positions. Check the available ATC and local information.'),('FREQUENCY','Without applicable ATC, monitor the designated advisory frequency. If none is published, use 122.800.'),('PRINCIPLE','Advisory calls communicate intentions; they are not clearances.')], 'Monitor traffic, follow local procedures and keep calls concise.'),
 ('ADVISORY CALLS  /  choose the phase', [('TAXI','[Airport] traffic, [callsign], taxiing from stand [number] to runway [runway] via [route], [airport].'),('DEPART','[Airport] traffic, [callsign], departing runway [runway], [departure direction], [airport].'),('ARRIVAL','[Airport] traffic, [callsign], [distance] miles [direction], inbound for runway [runway], [airport].'),('VACATED','[Airport] traffic, [callsign], runway [runway] vacated via [taxiway], [airport].')], 'These are position reports. They do not authorise crossing, takeoff or landing.'),
 ('PREPARE FOR ATC', [('CHANGE','When entering controlled coverage, contact the appropriate unit as required.'),('CHECK IN','[Station], [callsign], [position], [level] and [intentions].')], 'Review current local frequency and coverage information before departure.')]) ]

def lines(s, font, size, width): return simpleSplit(s,font,size,width)
def frame(c,n,title,kicker):
 c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
 c.setStrokeColor(EDGE); c.setLineWidth(.6);c.line(42,H-58,W-42,H-58);c.line(42,43,W-42,43)
 c.saveState();c.setFillColor(HexColor('#294258'));c.setFont('SegoeBold',44);c.translate(W/2,H/2);c.rotate(35);c.drawCentredString(0,0,'DENIS-AVIATION');c.restoreState()
 for x,angle in [(18,90),(W-18,-90)]:
  c.saveState();c.translate(x,H/2);c.rotate(angle);c.setFillColor(HexColor('#52728e'));c.setFont('SegoeBold',7);c.drawCentredString(0,0,'D E N I S - A V I A T I O N');c.restoreState()
 c.setFont('SegoeBold',8);c.setFillColor(BLUE);c.drawString(48,H-39,'DENIS-AVIATION  /  RADIO GUIDE');c.drawRightString(W-48,H-39,f'{n}  /  {len(pages):02}')
 c.setFillColor(MUTED);c.setFont('Segoe',7.5);c.drawString(48,27,'ATC COMMUNICATION  /  ENGLISH PHRASEBOOK');c.drawRightString(W-48,27,'DENIS-AVIATION')
 c.setFillColor(BLUE);c.setFont('SegoeBold',8);c.drawString(48,H-86,kicker)
 c.setFillColor(WHITE);c.setFont('SegoeBold',25);c.drawString(48,H-116,title)
 return H-137

def card(c,y,title,entries,tip):
 x=48; w=W-96; text_w=w-115
 rows=[]
 for label,phrase in entries:
  wrapped=lines(phrase,'Segoe',9.3,text_w)
  rows.append((label,wrapped))
 tip_lines=lines(tip,'Segoe',8.5,w-35)
 height=32+sum(max(15,len(words)*12+3) for _,words in rows)+18+len(tip_lines)*11
 c.setFillColor(PANEL);c.setStrokeColor(EDGE);c.roundRect(x,y-height,w,height,7,fill=1,stroke=1)
 c.setFillColor(BLUE);c.setFont('SegoeBold',8.3);c.drawString(x+14,y-19,title)
 yy=y-36
 for label,words in rows:
  c.setFillColor(ORANGE if label in ('ATC','UNABLE') else MUTED);c.setFont('SegoeBold',7);c.drawString(x+14,yy,label)
  c.setFillColor(WHITE);c.setFont('Segoe',9.3)
  for line in words: c.drawString(x+93,yy,line);yy-=12
  yy-=3
 c.setStrokeColor(EDGE);c.line(x+14,yy+3,x+w-14,yy+3);yy-=9
 c.setFillColor(BLUE);c.setFont('Segoe',8.5)
 for line in tip_lines: c.drawString(x+14,yy,line);yy-=11
 return y-height-12

buffer=io.BytesIO()
c=canvas.Canvas(buffer, pagesize=A4, pageCompression=1)
c.setTitle('ATC Communication | Denis Aviation');c.setAuthor('Denis Aviation')
for n,title,kicker,cards in pages:
 y=frame(c,n,title,kicker)
 for t,e,tip in cards: y=card(c,y,t,e,tip)
 if y<48: raise ValueError(f'Content overflows page {n}: {y}')
 c.showPage()
c.save()
parser=argparse.ArgumentParser(description='Build the radio phrasebook')
parser.add_argument('--output', help='PDF file to create; without this option, emit base64 to stdout')
args=parser.parse_args()
if args.output:
 Path(args.output).write_bytes(buffer.getvalue())
else:
 print(base64.b64encode(buffer.getvalue()).decode('ascii'))
