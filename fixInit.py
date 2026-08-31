import re

path = 'client/src/pages/events/EditEventPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

replacement = '''    // Pre-fill form when event data is loaded
  useEffect(() => {
    if (eventData) {
      const formattedDate = eventData.eventDate
        ? new Date(eventData.eventDate).toISOString().split('T')[0]
        : '';

      const standardVenues = ["Auditorium", "Faculty Club (Inside)", "Faculty Club (Outside)", "Faculty Club (Inside + Outside)", "Guest House (Inside)", "Guest House (Outside)", "Guest House (Inside + Outside)", "Sports Complex", "Basket Ball Court", "Main Ground"];
      if (eventData.venue && !standardVenues.includes(eventData.venue)) {
        setIsCustomVenue(true);
      }
      
      const standardIncharge = ["President", "Vice President", "General Secretary", "Joint Secretary"];
      if (eventData.inChargeName && !standardIncharge.includes(eventData.inChargeName) && eventData.inChargeName !== "") {
        setIsCustomIncharge(true);
      }'''

c = c.replace('''    // Pre-fill form when event data is loaded
  useEffect(() => {
    if (eventData) {
      const formattedDate = eventData.eventDate
        ? new Date(eventData.eventDate).toISOString().split('T')[0]
        : '';''', replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
