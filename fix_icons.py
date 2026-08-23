import sys
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # AdminDashboardPage uses <Calendar className="... for upcoming events
    # And DashboardPage uses <CalendarIcon className="...
    # Let's replace both for the Upcoming Events specifically.
    
    # In AdminDashboardPage:
    content = re.sub(r'<Calendar className="w-5 h-5 text-white" />', r'<UpcomingEventIcon className="w-5 h-5 text-white" />', content)
    content = re.sub(r'<Calendar className="w-12 h-12 text-gray-400 opacity-30" />', r'<UpcomingEventIcon className="w-12 h-12 text-gray-400 opacity-30" />', content)
    
    # In DashboardPage:
    content = re.sub(r'<CalendarIcon className="w-5 h-5 text-forest-ink" />', r'<UpcomingEventIcon className="w-5 h-5 text-forest-ink" />', content)
    content = re.sub(r'<CalendarIcon className="w-12 h-12 text-gray-400 opacity-30" />', r'<UpcomingEventIcon className="w-12 h-12 text-gray-400 opacity-30" />', content)
    
    # Building2 -> SocietyIcon
    content = re.sub(r'<Building2 className="w-6 h-6" />', r'<SocietyIcon className="w-6 h-6" />', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('client/src/pages/admin/AdminDashboardPage.tsx')
fix_file('client/src/pages/DashboardPage.tsx')
