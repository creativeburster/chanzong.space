from PIL import Image

def process_icon(src, dst, bg_color=(244, 114, 182), icon_color=(255, 255, 255)):
    img = Image.open(src).convert('RGBA')
    w, h = img.size
    new_img = Image.new('RGBA', (w, h), bg_color + (255,))
    pixels = img.load()
    new_pixels = new_img.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            lum = 0.299*r + 0.587*g + 0.114*b
            if lum > 100:
                new_pixels[x, y] = icon_color + (a,)
            elif lum > 50:
                ratio = (lum - 50) / 50
                br = int(bg_color[0] + (icon_color[0] - bg_color[0]) * ratio)
                bg = int(bg_color[1] + (icon_color[1] - bg_color[1]) * ratio)
                bb = int(bg_color[2] + (icon_color[2] - bg_color[2]) * ratio)
                new_pixels[x, y] = (br, bg, bb, a)
    
    new_img.save(dst, 'PNG')

process_icon(r'f:\chanzong.space\public\icons\icon-192.png', r'f:\chanzong.space\public\icons\icon-192.png')
process_icon(r'f:\chanzong.space\public\icons\icon-512.png', r'f:\chanzong.space\public\icons\icon-512.png')
print('Done')
