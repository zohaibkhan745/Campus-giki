import re

def fix(path):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r'onChange=\{\(val:\s*string\)\s*=>\s*\{\s*if\s*\(val\s*===\s*\'Custom \(Add\)\'\)\s*\{', r'onChange={(e: any) => {\n                  const val = typeof e === "string" ? e : e?.target?.value || "";\n                  if (val === "Custom (Add)") {', c)
    c = re.sub(r'onChange=\{\(val:\s*string\)\s*=>\s*handleSelectPlannedEvent\(val\)\}', r'onChange={(e: any) => handleSelectPlannedEvent(typeof e === "string" ? e : e?.target?.value || "")}', c)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

fix('client/src/pages/events/CreateEventPage.tsx')
fix('client/src/pages/events/EditEventPage.tsx')
