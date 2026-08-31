import re

path = 'server/src/modules/events/dto/create-event.dto.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

if 'Matches' not in c:
    c = c.replace("from 'class-validator';", "Matches } from 'class-validator';").replace("} from 'class-validator';\n", "\n")
    
c = re.sub(
    r'inChargeName\?: string;',
    "@Matches(/^[a-zA-Z\\\\s.,-]+$/, { message: 'Name can only contain alphabets, spaces, dots, commas, and dashes' })\n  inChargeName?: string;",
    c
)

c = re.sub(
    r'inChargeRegNum\?: string;',
    "@Matches(/^\\\\d{7}$/, { message: 'Registration number must be exactly 7 digits' })\n  inChargeRegNum?: string;",
    c
)

c = re.sub(
    r'inChargeContact\?: string;',
    "@Matches(/^\\\\d{11}$/, { message: 'Contact number must be exactly 11 digits' })\n  inChargeContact?: string;",
    c
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
