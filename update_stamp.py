import base64, re

# Read new stamp image and encode to base64
with open('image-removebg-preview (7).png', 'rb') as f:
    stamp_b64 = base64.b64encode(f.read()).decode('utf-8')

# Read current assets.js
with open('assets.js', 'r') as f:
    content = f.read()

# Replace the stamp data URI (everything between stamp:" and the closing ")
new_stamp_uri = 'data:image/png;base64,' + stamp_b64
content = re.sub(r'(stamp:\s*")data:image/[^"]*"', r'\g<1>' + new_stamp_uri + '"', content)

with open('assets.js', 'w') as f:
    f.write(content)

print('Stamp updated successfully')
