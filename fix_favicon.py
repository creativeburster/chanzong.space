from PIL import Image

# 读取现有 favicon.png（已经是粉红色描边，64x64）
png = Image.open(r'f:\chanzong.space\public\favicon.png').convert('RGBA')

# 目标 ico 尺寸
sizes = [16, 32, 48, 64]
frames = []

for size in sizes:
    frame = png.resize((size, size), Image.LANCZOS)
    # 转成 RGB，并把透明背景填充为白色，保证在小尺寸下可见
    rgb = Image.new('RGB', (size, size), (255, 255, 255))
    rgb.paste(frame, mask=frame.split()[3])
    frames.append(rgb)

frames[0].save(
    r'f:\chanzong.space\public\favicon.ico',
    format='ICO',
    append_images=frames[1:],
    sizes=[(s, s) for s in sizes]
)
print('favicon.ico updated')
