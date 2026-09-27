"""Bundle dist/ into one self-contained HTML page (for single-file hosting / previews)."""
import glob, sys
out_path = sys.argv[1]
js = open(glob.glob('dist/assets/*.js')[0], encoding='utf-8').read()
css = open(glob.glob('dist/assets/*.css')[0], encoding='utf-8').read()
def esc_js(s):
    return ''.join(c if ord(c) < 128 else ('\\u%04x' % ord(c) if ord(c) < 0x10000 else ''.join('\\u%04x' % u for u in c.encode('utf-16-be') and [int.from_bytes(c.encode('utf-16-be')[i:i+2], 'big') for i in (0, 2)])) for c in s)
def esc_css(s):
    return ''.join(c if ord(c) < 128 else '\\%x ' % ord(c) for c in s)
js = esc_js(js).replace('</script', '<\\/script')
page = f'''<meta charset="utf-8">
<title>GharGyaan</title>
<meta name="description" content="Everyday self-care and Indian household knowledge with evidence labels and safety escalation.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Mukta:wght@400;500;600;700&family=Tiro+Devanagari+Hindi&display=swap">
<style>{esc_css(css)}</style>
<div id="root"></div>
<noscript>GharGyaan needs JavaScript. In an emergency in India, call 112.</noscript>
<script type="module">{js}</script>
'''
open(out_path, 'w', encoding='ascii').write(page)
print(out_path, len(page))
