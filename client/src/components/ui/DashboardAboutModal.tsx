import React, { useState } from 'react';
import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import { X, Globe, Edit, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { societyService } from '@/services/society.service';
import { createPortal } from 'react-dom';
import { globalNotification } from '@/contexts/NotificationContext'; from 'react-dom';

const Instagram = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Facebook = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Linkedin = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;

interface DashboardAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const DashboardAboutModal: React.FC<DashboardAboutModalProps> = ({ isOpen, onClose, profile }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState<any>(null);
  
  const updateMutation = useMutation({
    mutationFn: (data: any) => societyService.updateSociety(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      globalNotification.triggerSuccess('Member updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['mySociety'] });
      setEditingMember(null);
    }
  });

  if (!isOpen || !profile) return null;

  let council: any[] = [];
  try {
    if (profile.executiveCouncil) {
      council = typeof profile.executiveCouncil === 'string' ? JSON.parse(profile.executiveCouncil) : profile.executiveCouncil;
    }
  } catch (e) {}

  const handleEdit = () => {
    onClose();
    navigate('/society/setup?tab=council');
  };

  const handleSaveMember = (updatedMember: any) => {
    const newCouncil = council.map(m => m.name === editingMember.original.name && m.role === editingMember.original.role ? updatedMember : m);
    
    // Construct payload from profile
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

  const handleDeleteMember = () => {
    const newCouncil = council.filter(m => !(m.name === editingMember.original.name && m.role === editingMember.original.role));
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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10">
        
        {/* Banner Section */}
        <div className="relative h-48 sm:h-64 w-full shrink-0">
          <img src={getSocietyBanner(profile.bannerUrl)} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Socials */}
          <div className="absolute top-4 left-4 flex gap-2">
            {profile.instagram && <a href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Instagram className="w-4 h-4" /></a>}
            {profile.facebook && <a href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Facebook className="w-4 h-4" /></a>}
            {profile.linkedin && <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Linkedin className="w-4 h-4" /></a>}
            {profile.website && <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Globe className="w-4 h-4" /></a>}
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-24 relative z-10 px-4 sm:px-12 pb-4">
            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 sm:border-8 border-[#0d0d0d] bg-white shadow-2xl shrink-0 flex items-center justify-center -mb-8 sm:-mb-12 relative z-20">
              <img src={getSocietyLogo(profile.logoUrl)} alt="Logo" className="w-[80%] h-[80%] object-contain" />
            </div>
            <div className="flex-1 pt-2 sm:pt-16">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {profile.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-500/20">
                  {profile.type}
                </span>
                <span className="text-sm font-medium text-gray-400">
                  {profile.category?.name}
                </span>
              </div>
            </div>
            
            <div className="shrink-0 pt-2 sm:pt-16 self-start sm:self-auto">
              <button onClick={handleEdit} className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl text-sm font-bold transition-all shadow-lg">
                <Edit className="w-4 h-4" /> Manage Info
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">About Us</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {profile.longDescription || profile.shortDescription}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Executive Council</h3>
            <div className="bg-[#1e2025]/50 border border-white/10 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-5 font-bold">Position</th>
                    <th className="py-4 px-5 font-bold">Name</th>
                    <th className="py-4 px-5 font-bold">Email</th>
                    <th className="py-4 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profile.presidentName && (
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-5 text-sm font-bold text-blue-400">President</td>
                      <td className="py-3 px-5 text-sm font-bold text-white">{profile.presidentName}</td>
                      <td className="py-3 px-5 text-sm text-gray-400">{profile.presidentEmail}</td>
                      <td className="py-3 px-5 text-right">
                        {/* Locked for President */}
                      </td>
                    </tr>
                  )}
                  {council.map((member: any, i: number) => {
                    const isUneditable = UNEDITABLE_ROLES.includes(member.role);
                    return (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-5 text-sm font-semibold text-gray-300">{member.role}</td>
                        <td className="py-3 px-5 text-sm font-semibold text-white">{member.name}</td>
                        <td className="py-3 px-5 text-sm text-gray-400">{member.email}</td>
                        <td className="py-3 px-5 flex justify-end gap-1">
                          {!isUneditable && (
                            <button onClick={() => setEditingMember({ original: member, current: member, confirmDelete: false })} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4"/></button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Editing Overlay Popup */}
      {editingMember && (
        <div className="absolute inset-0 z-[100000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl border border-white/20">
          <div className="bg-[#1e2025] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 relative">
            <h3 className="text-white font-bold text-lg">Edit Member</h3>
            
            {editingMember.confirmDelete ? (
              <div className="space-y-4 py-2">
                <p className="text-gray-300 text-sm">Are you sure you want to remove <strong className="text-white">{editingMember.current.name}</strong> from the executive council?</p>
                <div className="flex gap-2">
                  <button onClick={handleDeleteMember} disabled={updateMutation.isPending} className="flex-1 bg-red-500 text-white text-sm font-bold py-2 rounded-xl hover:bg-red-600 transition-colors">Confirm Delete</button>
                  <button onClick={() => setEditingMember({ ...editingMember, confirmDelete: false })} className="flex-1 bg-white text-black text-sm font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase">Position</label>
                    <input 
                      type="text" 
                      value={editingMember.current.role} 
                      onChange={e => setEditingMember({...editingMember, current: {...editingMember.current, role: e.target.value}})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 uppercase">Name</label>
                    <input 
                      type="text" 
                      value={editingMember.current.name} 
                      onChange={e => setEditingMember({...editingMember, current: {...editingMember.current, name: e.target.value.replace(/[^a-zA-Z.,\- ]/g, '')}})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleSaveMember(editingMember.current)} 
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-white text-black text-sm font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setEditingMember({ ...editingMember, confirmDelete: true })}
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-red-500 text-white text-sm font-bold py-2 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button onClick={() => setEditingMember(null)} className="p-2 bg-white text-black rounded-xl hover:bg-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  , document.body);
};
