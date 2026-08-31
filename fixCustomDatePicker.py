import re

path = 'client/src/components/ui/CustomDatePicker.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

sync_effect = '''  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewDate(d);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);
'''

if 'useEffect(() => {\n    if (value)' not in c:
    c = c.replace('const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});', sync_effect + '\n  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
