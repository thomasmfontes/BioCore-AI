import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 2600

# 1. Base Image
img = Image.new('RGBA', (W, H), (7, 15, 10, 255))
draw = ImageDraw.Draw(img)

# 2. Gradient Background
for y in range(H):
    # Smooth vertical color progression
    if y < 700:
        factor = y / 700
        r = int(5 + factor * 7)
        g = int(12 + factor * 22)
        b = int(8 + factor * 14)
    elif y < 1700:
        factor = (y - 700) / 1000
        r = int(12 - factor * 4)
        g = int(34 - factor * 14)
        b = int(22 - factor * 9)
    else:
        factor = (y - 1700) / 900
        r = int(8 - factor * 3)
        g = int(20 - factor * 8)
        b = int(13 - factor * 5)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# 3. Subtle Tech Grid Pattern
grid_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
grid_draw = ImageDraw.Draw(grid_overlay)
grid_size = 60
for x in range(0, W, grid_size):
    grid_draw.line([(x, 0), (x, H)], fill=(90, 240, 157, 10), width=1)
for y in range(0, H, grid_size):
    grid_draw.line([(0, y), (W, y)], fill=(90, 240, 157, 10), width=1)

# Subtle crosshairs at grid intersections
for x in range(grid_size*2, W, grid_size*4):
    for y in range(grid_size*2, 1600, grid_size*4):
        grid_draw.line([(x-4, y), (x+4, y)], fill=(90, 240, 157, 30), width=1)
        grid_draw.line([(x, y-4), (x, y+4)], fill=(90, 240, 157, 30), width=1)

img = Image.alpha_composite(img, grid_overlay)

# 4. Soft Radial Spotlight behind the Prototype
glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)
cx, cy = 600, 1080
radius = 480
for r in range(radius, 0, -15):
    alpha = int(45 * (1 - r / radius))
    glow_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(90, 240, 157, alpha))
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=30))
img = Image.alpha_composite(img, glow_layer)

draw = ImageDraw.Draw(img)

# 5. Fonts setup
f_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 22)
f_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 82)
f_subtitle = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 32)
f_desc = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 22)

f_card_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 24)
f_card_sub = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 17)

f_raffle_tag = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 22)
f_raffle_h1 = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44)
f_raffle_sub = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 24)

f_step_num = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 22)
f_step_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 22)
f_step_desc = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 17)

f_cta = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 24)
f_url = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 26)
f_footer = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 18)

# -------------------------------------------------------------
# SECTION 1: HEADER & EVENT INFO
# -------------------------------------------------------------
# Top Event Pill
pill_text = "🌿 INICIAÇÃO CIENTÍFICA  •  FEIRA DE TECNOLOGIA NEXT 2026"
bbox = f_badge.getbbox(pill_text)
pw = bbox[2] - bbox[0] + 48
ph = 44
px = (W - pw) // 2
py = 70

# Pill background & border
overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
odraw = ImageDraw.Draw(overlay)
odraw.rounded_rectangle([px, py, px + pw, py + ph], radius=22, fill=(90, 240, 157, 25), outline=(90, 240, 157, 100), width=2)
img = Image.alpha_composite(img, overlay)
draw = ImageDraw.Draw(img)
draw.text((px + 24, py + 8), pill_text, font=f_badge, fill=(90, 240, 157, 255))

# Official Logo & Title
logo_path = 'C:/Users/thomas/OneDrive/Documentos/Projetos/ESP32/esp32-react-control/public/biocore-logo.png'
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert('RGBA')
    logo = logo.resize((104, 104), Image.Resampling.LANCZOS)
    
    # Calculate title layout with logo
    title_w1 = f_title.getbbox("BIOCORE ")[2] - f_title.getbbox("BIOCORE ")[0]
    title_w2 = f_title.getbbox("AI")[2] - f_title.getbbox("AI")[0]
    total_title_w = 104 + 20 + title_w1 + title_w2
    start_x = (W - total_title_w) // 2
    
    img.alpha_composite(logo, (start_x, 145))
    draw.text((start_x + 104 + 20, 142), "BIOCORE ", font=f_title, fill=(255, 255, 255, 255))
    draw.text((start_x + 104 + 20 + title_w1, 142), "AI", font=f_title, fill=(90, 240, 157, 255))
else:
    draw.text(((W - 480)//2, 142), "BIOCORE AI", font=f_title, fill=(255, 255, 255, 255))

# Subtitle
sub_text = "Sistema Inteligente de Cultivo Autônomo com IoT e IA"
bbox_sub = f_subtitle.getbbox(sub_text)
sw = bbox_sub[2] - bbox_sub[0]
draw.text(((W - sw)//2, 265), sub_text, font=f_subtitle, fill=(230, 235, 232, 255))

# Description line
desc_text = "Monitoramento Agronômico de Precisão  •  Iluminação Adaptativa  •  Telemetria em Tempo Real"
bbox_desc = f_desc.getbbox(desc_text)
dw = bbox_desc[2] - bbox_desc[0]
draw.text(((W - dw)//2, 315), desc_text, font=f_desc, fill=(145, 175, 155, 255))

# Glowing Divider
overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
odraw = ImageDraw.Draw(overlay)
odraw.line([(150, 375), (W - 150, 375)], fill=(90, 240, 157, 70), width=2)
odraw.line([(350, 375), (W - 350, 375)], fill=(90, 240, 157, 180), width=3)
img = Image.alpha_composite(img, overlay)
draw = ImageDraw.Draw(img)

# -------------------------------------------------------------
# SECTION 2: HARDWARE & PROTOTYPE SHOWCASE
# -------------------------------------------------------------
# Section badge
sec_badge = "TECNOLOGIA E INOVAÇÃO APLICADA"
s_bbox = f_badge.getbbox(sec_badge)
sb_w = s_bbox[2] - s_bbox[0] + 32
draw.rounded_rectangle([((W - sb_w)//2), 410, ((W + sb_w)//2), 446], radius=8, fill=(15, 35, 22, 255), outline=(90, 240, 157, 60))
draw.text(((W - (s_bbox[2]-s_bbox[0]))//2, 417), sec_badge, font=f_badge, fill=(90, 240, 157, 240))

# 4 Tech Feature Cards positioned beside/above the prototype
# Card layout helper
def draw_feature_card(x, y, w, h, icon, title, desc):
    card_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(card_overlay)
    # Background glass
    cdraw.rounded_rectangle([x, y, x + w, y + h], radius=18, fill=(12, 28, 18, 210), outline=(90, 240, 157, 80), width=1)
    # Left green accent line
    cdraw.rounded_rectangle([x, y + 10, x + 4, y + h - 10], radius=2, fill=(90, 240, 157, 255))
    return card_overlay

# Left Column Cards
card_w = 420
card_h = 95

# Card 1: Iluminação
img = Image.alpha_composite(img, draw_feature_card(50, 480, card_w, card_h, "💡", "Iluminação Adaptativa", "LED Full Spectrum com ciclo biológico"))
draw = ImageDraw.Draw(img)
draw.text((70, 492), "💡 Iluminação Adaptativa", font=f_card_title, fill=(255, 255, 255, 255))
draw.text((70, 528), "LED Full Spectrum inteligente para fotoperíodo", font=f_card_sub, fill=(160, 190, 170, 255))

# Card 2: Nutrição e Irrigação
img = Image.alpha_composite(img, draw_feature_card(50, 600, card_w, card_h, "💧", "Irrigação de Precisão", "Dosagem de água e nutrientes NPK"))
draw = ImageDraw.Draw(img)
draw.text((70, 612), "💧 Irrigação de Precisão", font=f_card_title, fill=(255, 255, 255, 255))
draw.text((70, 648), "Dosagem automatizada de água e nutrientes NPK", font=f_card_sub, fill=(160, 190, 170, 255))

# Right Column Cards
# Card 3: Telemetria
img = Image.alpha_composite(img, draw_feature_card(W - 50 - card_w, 480, card_w, card_h, "📊", "Telemetria Multissensorial", "Solo, temperatura, umidade e condutividade"))
draw = ImageDraw.Draw(img)
draw.text((W - 50 - card_w + 20, 492), "📊 Sensores em Tempo Real", font=f_card_title, fill=(255, 255, 255, 255))
draw.text((W - 50 - card_w + 20, 528), "Leitura contínua de solo, luz e microclima", font=f_card_sub, fill=(160, 190, 170, 255))

# Card 4: IA e IoT
img = Image.alpha_composite(img, draw_feature_card(W - 50 - card_w, 600, card_w, card_h, "🧠", "Cérebro IoT & IA", "ESP32 conectado a Web Dashboard PWA"))
draw = ImageDraw.Draw(img)
draw.text((W - 50 - card_w + 20, 612), "🧠 Cérebro IoT & Web App", font=f_card_title, fill=(255, 255, 255, 255))
draw.text((W - 50 - card_w + 20, 648), "Microcontrolador ESP32 + App PWA ao vivo", font=f_card_sub, fill=(160, 190, 170, 255))

# Centered Prototype Image
proto_path = 'C:/Users/thomas/OneDrive/Documentos/Projetos/ESP32/esp32-react-control/public/banner-prototipo-feathered.png'
if os.path.exists(proto_path):
    proto = Image.open(proto_path).convert('RGBA')
    # Resize prototype preserving aspect ratio: target width ~680
    pw, ph = proto.size
    target_w = 720
    target_h = int(ph * (target_w / pw))
    proto_resized = proto.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Place prototype
    proto_x = (W - target_w) // 2
    proto_y = 715
    img.alpha_composite(proto_resized, (proto_x, proto_y))
    
    # Grounding shadow / base glow underneath
    ground_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(ground_overlay)
    base_y = proto_y + target_h - 10
    gdraw.ellipse([proto_x + 60, base_y - 30, proto_x + target_w - 60, base_y + 40], fill=(0, 0, 0, 180))
    ground_overlay = ground_overlay.filter(ImageFilter.GaussianBlur(radius=15))
    img = Image.alpha_composite(img, ground_overlay)

# -------------------------------------------------------------
# SECTION 3: SORTEIO VIP CARD (THE HIGHLIGHT OF THE BANNER)
# -------------------------------------------------------------
draw = ImageDraw.Draw(img)
card_box = [50, 1660, W - 50, 2480]

# VIP Card Glass Container
card_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
cdraw = ImageDraw.Draw(card_layer)

# Outer glow around the card
cdraw.rounded_rectangle([card_box[0]-4, card_box[1]-4, card_box[2]+4, card_box[3]+4], radius=38, fill=(90, 240, 157, 30))
# Main body
cdraw.rounded_rectangle(card_box, radius=36, fill=(11, 26, 17, 245), outline=(90, 240, 157, 140), width=3)
# Card top highlight sheen
cdraw.rounded_rectangle([card_box[0]+2, card_box[1]+2, card_box[2]-2, card_box[1]+90], radius=34, fill=(90, 240, 157, 18))

card_layer = card_layer.filter(ImageFilter.GaussianBlur(radius=1))
img = Image.alpha_composite(img, card_layer)
draw = ImageDraw.Draw(img)

# Card Header Badge
tag_text = "🎁 SORTEIO EXCLUSIVO NA BANCA"
t_bbox = f_raffle_tag.getbbox(tag_text)
tw = t_bbox[2] - t_bbox[0] + 36
th = 38
tx = (W - tw) // 2
ty = card_box[1] + 28
draw.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=19, fill=(90, 240, 157, 40), outline=(90, 240, 157, 200), width=2)
draw.text((tx + 18, ty + 6), tag_text, font=f_raffle_tag, fill=(90, 240, 157, 255))

# Card Title
main_h1 = "CONCORRA A UMA AMAZON ECHO SHOW 5!"
bbox_h1 = f_raffle_h1.getbbox(main_h1)
w_h1 = bbox_h1[2] - bbox_h1[0]
draw.text(((W - w_h1)//2, ty + 52), main_h1, font=f_raffle_h1, fill=(255, 255, 255, 255))

main_sub = "Vote no projeto BioCore AI na feira NEXT e participe gratuitamente!"
bbox_rsub = f_raffle_sub.getbbox(main_sub)
w_rsub = bbox_rsub[2] - bbox_rsub[0]
draw.text(((W - w_rsub)//2, ty + 112), main_sub, font=f_raffle_sub, fill=(160, 210, 180, 255))

# Divider inside card
draw.line([(card_box[0] + 40, ty + 160), (card_box[2] - 40, ty + 160)], fill=(90, 240, 157, 60), width=1)

# Card Two-Column Content
# Left Column: Alexa Echo Show 5
alexa_path = 'C:/Users/thomas/OneDrive/Documentos/Projetos/ESP32/esp32-react-control/public/alexa-show-5.png'
if os.path.exists(alexa_path):
    alexa = Image.open(alexa_path).convert('RGBA')
    # Resize Alexa to width ~480
    aw, ah = alexa.size
    target_aw = 480
    target_ah = int(ah * (target_aw / aw))
    alexa_resized = alexa.resize((target_aw, target_ah), Image.Resampling.LANCZOS)
    
    alexa_x = card_box[0] + 40
    alexa_y = ty + 200
    
    # Soft backlight behind Alexa
    abg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    abg_draw = ImageDraw.Draw(abg)
    abg_draw.ellipse([alexa_x + 40, alexa_y + 40, alexa_x + target_aw - 40, alexa_y + target_ah], fill=(90, 240, 157, 60))
    abg = abg.filter(ImageFilter.GaussianBlur(radius=25))
    img = Image.alpha_composite(img, abg)
    
    img.alpha_composite(alexa_resized, (alexa_x, alexa_y))
    draw = ImageDraw.Draw(img)
    
    # Feature tag below Alexa
    alexa_badge = "Tela Touch Inteligente • Alexa Integrada • Assistente de Voz"
    abbox = f_step_desc.getbbox(alexa_badge)
    ab_w = abbox[2] - abbox[0]
    draw.text((alexa_x + (target_aw - ab_w)//2, alexa_y + target_ah + 12), alexa_badge, font=f_step_desc, fill=(160, 200, 180, 255))

# Right Column: How to Enter + QR Code
rc_x = card_box[0] + 560
rc_y = ty + 185

# Step 1 Box
draw.rounded_rectangle([rc_x, rc_y, card_box[2] - 40, rc_y + 75], radius=16, fill=(15, 38, 25, 200), outline=(90, 240, 157, 70))
draw.ellipse([rc_x + 15, rc_y + 16, rc_x + 55, rc_y + 56], fill=(90, 240, 157, 255))
draw.text((rc_x + 28, rc_y + 24), "1", font=f_step_num, fill=(0, 33, 15, 255))
draw.text((rc_x + 70, rc_y + 14), "Vote no BioCore AI", font=f_step_title, fill=(255, 255, 255, 255))
draw.text((rc_x + 70, rc_y + 42), "Escaneie o QR oficial da organização na banca", font=f_step_desc, fill=(160, 195, 175, 255))

# Step 2 Box
rc2_y = rc_y + 90
draw.rounded_rectangle([rc_x, rc2_y, card_box[2] - 40, rc2_y + 75], radius=16, fill=(15, 38, 25, 200), outline=(90, 240, 157, 70))
draw.ellipse([rc_x + 15, rc2_y + 16, rc_x + 55, rc2_y + 56], fill=(90, 240, 157, 255))
draw.text((rc_x + 27, rc2_y + 24), "2", font=f_step_num, fill=(0, 33, 15, 255))
draw.text((rc_x + 70, rc2_y + 14), "Cadastre-se no Sorteio", font=f_step_title, fill=(255, 255, 255, 255))
draw.text((rc_x + 70, rc2_y + 42), "Escaneie o QR Code abaixo com seu celular", font=f_step_desc, fill=(160, 195, 175, 255))

# QR Code Box
qr_box_y = rc2_y + 95
qr_path = 'C:/Users/thomas/OneDrive/Documentos/Projetos/ESP32/esp32-react-control/public/qr-sorteio.png'
if os.path.exists(qr_path):
    qr = Image.open(qr_path).convert('RGBA')
    qr_size = 190
    qr_resized = qr.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    
    # White rounded frame for QR code
    qr_frame_x = rc_x + 20
    qr_frame_y = qr_box_y
    draw.rounded_rectangle([qr_frame_x - 12, qr_frame_y - 12, qr_frame_x + qr_size + 12, qr_frame_y + qr_size + 12], radius=18, fill=(255, 255, 255, 255))
    img.alpha_composite(qr_resized, (qr_frame_x, qr_frame_y))
    draw = ImageDraw.Draw(img)
    
    # Text next to QR code
    info_x = qr_frame_x + qr_size + 30
    draw.text((info_x, qr_frame_y + 15), "ACESSO RÁPIDO:", font=f_step_title, fill=(90, 240, 157, 255))
    draw.text((info_x, qr_frame_y + 48), "biocoreai.com.br/sorteio", font=f_url, fill=(255, 255, 255, 255))
    draw.text((info_x, qr_frame_y + 88), "📸 Tire print da tela de voto", font=f_step_desc, fill=(255, 215, 100, 255))
    draw.text((info_x, qr_frame_y + 118), "Siga nosso perfil no Instagram:", font=f_step_desc, fill=(160, 195, 175, 255))
    draw.text((info_x, qr_frame_y + 144), "@biocoreai_", font=f_url, fill=(90, 240, 157, 255))

# -------------------------------------------------------------
# SECTION 4: FOOTER
# -------------------------------------------------------------
foot_text = "Projeto BioCore AI  •  Equipe: Matheus, Gabriel, Vitória e Thomas  •  NEXT 2026"
bbox_foot = f_footer.getbbox(foot_text)
fw = bbox_foot[2] - bbox_foot[0]
draw.text(((W - fw)//2, 2530), foot_text, font=f_footer, fill=(120, 155, 135, 255))

# Save output image
out_public = 'C:/Users/thomas/OneDrive/Documentos/Projetos/ESP32/esp32-react-control/public/banner-biocore-next-2026.png'
out_artifact = 'C:/Users/thomas/.gemini/antigravity/brain/13aa5e04-7e48-4fb6-a7f2-9bcbfcdc8496/banner-biocore-next-2026.png'
img.save(out_public, format='PNG', optimize=True)
img.save(out_artifact, format='PNG', optimize=True)
print(f"Banner successfully generated: {W}x{H} px at {out_public}")
