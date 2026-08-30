import re

with open('client/src/routes/AppRoutes.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<Route path="/admin/events/:id/review" element={<AdminEventReviewPage />} />', '<Route path="/admin/events/:id" element={<AdminEventReviewPage />} />')

with open('client/src/routes/AppRoutes.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
