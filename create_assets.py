import base64
import os

def get_base64_from_file(filename):
    with open(filename, 'r') as f:
        return f.read().strip()

logo = get_base64_from_file('tmp_logo.txt')
sig = get_base64_from_file('tmp_sig.txt')
stamp = get_base64_from_file('tmp_stamp.txt')

content = f"""const ASSETS = {{
  logo: "data:image/png;base64,{logo}",
  signature: "data:image/png;base64,{sig}",
  stamp: "data:image/png;base64,{stamp}"
}};"""

with open('assets.js', 'w') as f:
    f.write(content)

print("assets.js created successfully")
