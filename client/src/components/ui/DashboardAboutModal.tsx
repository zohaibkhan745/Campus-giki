import React, { useState, useEffect } from 'react';
import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import { X, Globe, Edit, Trash2, Check } from 'lucide-react';

const Instagram = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Facebook = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Linkedin = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { societyService } from '@/services/society.service';
import { createPortal } from 'react-dom';
import { globalNotification } from '@/contexts/NotificationContext';

interface DashboardAboutModalProps {
  profile: any;
  onClose: () => void;
  isCurrentUserSociety?: boolean;
}

export const DashboardAboutModal: React.FC<DashboardAboutModalProps> = ({ profile, onClose, isCurrentUserSociety = false }) => {
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const [activeTab, setActiveTab] = useState<'info' | 'council'>('info');
  const [editingMember, setEditingMember] = useState<{ original: any, current: any, confirmDelete: boolean } | null>(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleEdit = () => {
    onClose();
    navigate(`/society/setup`);
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => societyService.updateSociety(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societyProfile'] });
      setEditingMember(null);
      globalNotification.success('Executive member updated successfully');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      globalNotification.error(error.message || 'Failed to update member');
    }
  });

  const handleSaveMember = () => {
    if (!editingMember) return;
    
    let payload = {
      name: profile.name,
      type: profile.type,
      categoryId: profile.category?.id,
      shortDescription: profile.shortDescription,
      longDescription: profile.longDescription,
      logoUrl: profile.logoUrl,
      bannerUrl: profile.bannerUrl,
      instagram: profile.instagram,
      facebook: profile.facebook,
      linkedin: profile.linkedin,
      website: profile.website,
      email: profile.email,
      presidentName: profile.presidentName,
      presidentRegNum: profile.presidentRegNum,
      presidentContact: profile.presidentContact,
      presidentEmail: profile.presidentEmail,
      presidentFaculty: profile.presidentFaculty,
      executiveCouncil: profile.executiveCouncil
    };

    if (editingMember.original.role === 'President') {
      payload.presidentName = editingMember.current.name;
      payload.presidentEmail = editingMember.current.email;
    } else {
      const newCouncil = council.map((m: any) => m.name === editingMember.original.name && m.role === editingMember.original.role ? editingMember.current : m);
      payload.executiveCouncil = JSON.stringify(newCouncil);
    }
    updateMutation.mutate(payload);
  };

  const handleDeleteMember = () => {
    if (!editingMember) return;
    const newCouncil = council.filter((m: any) => !(m.name === editingMember.original.name && m.role === editingMember.original.role));
    
    const payload = {
      name: profile.name,
      type: profile.type,
      categoryId: profile.category?.id,
      shortDescription: profile.shortDescription,
      longDescription: profile.longDescription,
      logoUrl: profile.logoUrl,
      bannerUrl: profile.bannerUrl,
      instagram: profile.instagram,
      facebook: profile.facebook,
      linkedin: profile.linkedin,
      website: profile.website,
      email: profile.email,
      presidentName: profile.presidentName,
      presidentRegNum: profile.presidentRegNum,
      presidentContact: profile.presidentContact,
      presidentEmail: profile.presidentEmail,
      presidentFaculty: profile.presidentFaculty,
      executiveCouncil: JSON.stringify(newCouncil)
    };
    updateMutation.mutate(payload);
  };

  const UNEDITABLE_ROLES = ["President", "Vice President", "Event Coordinator", "General Secretary", "Treasurer", "Director Liaison"];
  let council: any[] = [];
  try {
    if (profile.executiveCouncil) {
      council = typeof profile.executiveCouncil === 'string' ? JSON.parse(profile.executiveCouncil) : profile.executiveCouncil;
    }
  } catch (e) {}

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Outer Modal Container: Strict overflow-hidden so it acts as a window */}
      <div className="relative w-full max-w-[1000px] h-full max-h-[90vh] bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden">
        
        {/* Banner Section - Matches User HTML */}
        <div className="relative w-full h-[280px] md:h-[320px] bg-[#1e3c72] shrink-0 z-20">
          <img src={getSocietyBanner(profile.bannerUrl)} alt="Banner" className="w-full h-full object-cover block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/80 via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all border border-white/20 z-[30]"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Socials */}
          <div className="absolute top-4 left-4 flex gap-2 z-[30]">
            {profile.instagram && <a href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Instagram className="w-4 h-4" /></a>}
            {profile.facebook && <a href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Facebook className="w-4 h-4" /></a>}
            {profile.linkedin && <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Linkedin className="w-4 h-4" /></a>}
            {profile.website && <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Globe className="w-4 h-4" /></a>}
          </div>

          {/* Profile Container */}
          <div className="absolute left-1/2 bottom-[65px] -translate-x-1/2 md:left-[48px] md:bottom-[-90px] md:transform-none z-[25]">
            <img 
              src={getSocietyLogo(profile.logoUrl)} 
              alt="Society Logo" 
              className="w-[110px] h-[110px] border-[3px] md:w-[180px] md:h-[180px] md:border-[5px] rounded-full border-white object-cover bg-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] block" 
            />
          </div>

          {/* Society Name (and tags/button since they need a place to live) */}
          <div className="absolute left-[5%] right-[5%] bottom-[16px] md:left-[260px] md:right-[48px] md:bottom-[20px] flex flex-col md:flex-row md:justify-between items-center md:items-end gap-3 z-[25]">
            <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
              <div className="text-[20px] md:text-[30px] font-bold text-white leading-[1.2] break-words [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                {profile.name}
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-blue-500/80 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                  {profile.type}
                </span>
                <span className="text-sm font-medium text-gray-200 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
                  {profile.category?.name}
                </span>
              </div>
            </div>
            {isCurrentUserSociety && (
              <button onClick={handleEdit} className="shrink-0 flex items-center justify-center gap-1.5 px-5 py-2 md:py-2.5 bg-white text-gray-900 hover:bg-gray-200 rounded-xl text-sm font-bold transition-all shadow-lg">
                <Edit className="w-4 h-4" /> Manage Info
              </button>
            )}
          </div>
        </div>

        {/* Content Section - Scrolls independently */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-[24px] px-[20px] md:pt-[110px] md:pl-[138px] md:pr-[48px] pb-10 w-full max-w-full">
          
          <div className="w-full">
            <h2 className="text-[18px] md:text-[22px] font-bold text-white mb-[12px] uppercase tracking-wider">ABOUT US</h2>
            <p className="text-[14px] md:text-[16px] leading-[1.6] text-gray-300">
              {profile.longDescription || "No description provided."}
            </p>
          </div>

          <div className="mt-12 w-full">
            <h2 className="text-[18px] md:text-[22px] font-bold text-white mb-[16px] uppercase tracking-wider">EXECUTIVE COUNCIL</h2>
            {council.length > 0 ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 px-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Position</th>
                      <th className="py-4 px-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                      <th className="py-4 px-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                      <th className="py-4 px-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profile.presidentName && (
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-5 text-[15px] font-semibold text-white">President</td>
                        <td className="py-4 px-5 text-[15px] font-semibold text-white">{profile.presidentName}</td>
                        <td className="py-4 px-5 text-[14px] text-gray-400">{profile.presidentEmail}</td>
                        <td className="py-4 px-5 text-right">
                          {isCurrentUserSociety && (
                            <button onClick={() => setEditingMember({ original: { role: 'President' }, current: { name: profile.presidentName, email: profile.presidentEmail }, confirmDelete: false })} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex" title="Edit"><Edit className="w-4 h-4"/></button>
                          )}
                        </td>
                      </tr>
                    )}
                    {council.map((member: any, i: number) => {
                      const isUneditable = UNEDITABLE_ROLES.includes(member.role);
                      return (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-5 text-[15px] font-semibold text-white">{member.role}</td>
                          <td className="py-4 px-5 text-[15px] font-semibold text-white">{member.name}</td>
                          <td className="py-4 px-5 text-[14px] text-gray-400">{member.email}</td>
                          <td className="py-4 px-5 text-right">
                            {isCurrentUserSociety && !isUneditable && (
                              <button onClick={() => setEditingMember({ original: member, current: member, confirmDelete: false })} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex" title="Edit"><Edit className="w-4 h-4"/></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400">No executive council members have been added yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Editing Modal Overlay */}
      {editingMember && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative z-10 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Edit {editingMember.original.role}</h3>
              <button onClick={() => setEditingMember(null)} className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10"><X className="w-5 h-5"/></button>
            </div>
            
            {!editingMember.confirmDelete ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                  <input type="text" value={editingMember.current.name} onChange={e => setEditingMember({...editingMember, current: {...editingMember.current, name: e.target.value}})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={editingMember.current.email} onChange={e => setEditingMember({...editingMember, current: {...editingMember.current, email: e.target.value}})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  {!UNEDITABLE_ROLES.includes(editingMember.original.role) && (
                    <button onClick={() => setEditingMember({...editingMember, confirmDelete: true})} className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-semibold transition-colors mr-auto">Delete</button>
                  )}
                  <button onClick={() => setEditingMember(null)} className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                  <button onClick={handleSaveMember} disabled={updateMutation.isPending} className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">Are you sure you want to remove <strong className="text-white">{editingMember.original.name}</strong> from the Executive Council?</p>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditingMember({...editingMember, confirmDelete: false})} className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                  <button onClick={handleDeleteMember} disabled={updateMutation.isPending} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4"/> Yes, Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  , (document.getElementById('modal-root') || document.body) as HTMLElement);
};





