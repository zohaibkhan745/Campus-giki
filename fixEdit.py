import re

with open('client/src/pages/events/EditEventPage.tsx', 'r', encoding='utf-8') as f:
    edit_content = f.read()

with open('client/src/pages/events/CreateEventPage.tsx', 'r', encoding='utf-8') as f:
    create_content = f.read()

create_form_match = re.search(r'(<div className="form-section">\s*<div className="section-header">[\s\S]*?)<button type="button" className="btn-submit-review"', create_content)
create_form_inner = create_form_match.group(1)

create_form_inner = create_form_inner.replace('createMutation.isPending', 'updateMutation.isPending || isEditLocked')

edit_buttons_match = re.search(r'(<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20 mt-4">[\s\S]*?)</form>', edit_content)
edit_buttons = edit_buttons_match.group(1)

new_form = '<form onSubmit={(e) => e.preventDefault()} className="bg-white/[0.08] backdrop-blur-[20px] p-6 md:p-8 rounded-cards border border-white/20 space-y-8" noValidate>\n' + create_form_inner + edit_buttons + '</form>'

edit_form_match = re.search(r'<form onSubmit=\{\(e\) => e.preventDefault\(\)\} className="bg-white/\[0\.08\] backdrop-blur-\[20px\] p-6 md:p-8 rounded-cards border border-white/20 space-y-8" noValidate>[\s\S]*?</form>', edit_content)
edit_content = edit_content.replace(edit_form_match.group(0), new_form)

state_vars = '''  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [isCustomIncharge, setIsCustomIncharge] = useState(false);'''

edit_content = re.sub(r'(const \{\s*register,)', state_vars + r'\n  \1', edit_content)

imports = "import { CustomDropdown } from '@/components/ui/CustomDropdown';\nimport { CustomDatePicker } from '@/components/ui/CustomDatePicker';\nimport { CustomTimePicker } from '@/components/ui/CustomTimePicker';\nimport { Controller } from 'react-hook-form';\nimport { cn } from '@/lib/utils';"
edit_content = edit_content.replace("import { Input } from '@/components/ui/Input';", imports)

with open('client/src/pages/events/EditEventPage.tsx', 'w', encoding='utf-8') as f:
    f.write(edit_content)
