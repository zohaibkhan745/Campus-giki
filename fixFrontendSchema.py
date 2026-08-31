import re

path = 'client/src/lib/validations/event.schema.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'inChargeName: z.string().optional(),',
    'inChargeName: z.string().min(1, "Name is required").regex(/^[a-zA-Z\\s.,-]+$/, "Name can only contain alphabets, spaces, dots, commas, and dashes"),'
)
c = c.replace(
    'inChargeRegNum: z.string().optional(),',
    'inChargeRegNum: z.string().min(1, "Reg. No is required").regex(/^\\d{7}$/, "Registration number must be exactly 7 digits"),'
)
c = c.replace(
    'inChargeContact: z.string().optional(),',
    'inChargeContact: z.string().min(1, "Contact is required").regex(/^\\d{11}$/, "Contact number must be exactly 11 digits"),'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
