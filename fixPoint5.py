import re

path = 'client/src/pages/events/EditEventPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace button text
c = c.replace('Resubmit for Advisor Review', '{eventData.lastChangeRequestBy === "DSA_ADMIN" ? "Resubmit for Admin Review" : "Resubmit for Advisor Review"}')

# Replace comment styling block
old_block = '''{eventData.approvalStatus === 'CHANGES_REQUESTED' && (eventData.advisorComments || eventData.dsaComments) && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 p-5 rounded-[18px] shadow-lg mb-6">
            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Changes Requested by Reviewer
            </h3>
            <div className="space-y-4 text-sm text-red-200/90 leading-relaxed">
              {eventData.advisorComments && (
                <div>
                  <span className="font-semibold text-red-300 block mb-1">Advisor Notes:</span>
                  <p>{eventData.advisorComments}</p>
                </div>
              )}
              {eventData.dsaComments && (
                <div>
                  <span className="font-semibold text-red-300 block mb-1">DSA / Admin Notes:</span>
                  <p>{eventData.dsaComments}</p>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs font-medium text-red-300/80">Please address the feedback above and resubmit the event for review.</p>
          </div>
        )}'''

new_block = '''{eventData.approvalStatus === 'CHANGES_REQUESTED' && (eventData.advisorComments || eventData.dsaComments) && (() => {
          const isByAdmin = eventData.lastChangeRequestBy === 'DSA_ADMIN';
          return (
            <div className={ackdrop-blur-md p-5 rounded-[18px] shadow-lg mb-6 border }>
              <h3 className={ont-bold mb-3 flex items-center gap-2 }>
                <ShieldCheck className="w-5 h-5" />
                Changes Requested by {isByAdmin ? 'Admin' : 'Advisor'}
              </h3>
              <div className={space-y-4 text-sm leading-relaxed }>
                {eventData.advisorComments && (
                  <div>
                    <span className={ont-semibold block mb-1 }>Advisor Notes:</span>
                    <p>{eventData.advisorComments}</p>
                  </div>
                )}
                {eventData.dsaComments && (
                  <div>
                    <span className={ont-semibold block mb-1 }>DSA / Admin Notes:</span>
                    <p>{eventData.dsaComments}</p>
                  </div>
                )}
              </div>
              <p className={mt-4 text-xs font-medium }>Please address the feedback above and resubmit the event for review.</p>
            </div>
          );
        })()}'''

if old_block in c:
    c = c.replace(old_block, new_block)
else:
    print("Could not find the review block to replace!")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
