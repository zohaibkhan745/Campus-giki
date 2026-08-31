import re

path = 'server/src/modules/events/events.service.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "...(dto.submitForApproval === true && { approvalStatus: 'PENDING_ADVISOR', isPublished: false, lastChangeRequestBy: null }),",
    "...(dto.submitForApproval === true && { approvalStatus: (event.approvalStatus === 'CHANGES_REQUESTED' && event.lastChangeRequestBy === 'DSA_ADMIN') ? 'PENDING_DSA' : 'PENDING_ADVISOR', isPublished: false, lastChangeRequestBy: null }),"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
