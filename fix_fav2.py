from PIL import Image
img = Image.open(r'f:\chanzong.space\public\favicon.png').convert('RGBA')
img.save(r'f:\chanzong.space\public\favicon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48),(64,64)])
print('OK')
