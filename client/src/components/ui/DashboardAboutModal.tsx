import React from 'react';
import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import { X, Globe, Instagram, Facebook, Linkedin, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const DashboardAboutModal: React.FC<DashboardAboutModalProps> = ({ isOpen, onClose, profile }) => {
  const navigate = useNavigate();
  if (!isOpen || !profile) return null;

  let council = [];
  try {
    council = profile.executiveCouncil ? JSON.parse(profile.executiveCouncil) : [];
  } catch (e) {}

  const handleEdit = () => {
    onClose();
    navigate('/society/setup?tab=council');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 z-[1000] opacity-100 transition-opacity overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#1e2025]/80 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5)] my-auto relative flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all border border-white/20">
          <X className="w-5 h-5" />
        </button>

        {/* Header/Banner Section */}
        <div className="relative h-[200px] w-full shrink-0">
          <img src={getSocietyBanner(profile.bannerUrl)} alt="Banner" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/default-banner.png'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2025]/90 via-[#1e2025]/30 to-transparent"></div>
          
          <div className="absolute bottom-4 left-6 flex items-end gap-5">
            <img src={getSocietyLogo(profile.logoUrl)} alt="Logo" className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover bg-white" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
            <div className="mb-2">
              <h2 className="text-2xl font-extrabold text-white shadow-sm">{profile.name}</h2>
              <p className="text-white/80 font-medium text-sm">{profile.shortDescription}</p>
            </div>
          </div>

          {/* Socials */}
          <div className="absolute top-4 left-4 flex gap-2">
            {profile.instagram && <a href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Instagram className="w-4 h-4" /></a>}
            {profile.facebook && <a href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Facebook className="w-4 h-4" /></a>}
            {profile.linkedin && <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Linkedin className="w-4 h-4" /></a>}
            {profile.website && <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/80 text-white hover:text-blue-400 rounded-full backdrop-blur-sm transition-all border border-white/20"><Globe className="w-4 h-4" /></a>}
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">About Us</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{profile.longDescription || 'No description provided.'}</p>
          </div>

          {/* Executive Council Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-lg font-bold text-white">Executive Council</h3>
              <button onClick={handleEdit} className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">Manage Members</button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="py-3 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.presidentName && (
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5 text-sm font-semibold text-blue-300">President</td>
                        <td className="py-3 px-5 text-sm font-semibold text-white">{profile.presidentName}</td>
                        <td className="py-3 px-5 text-sm text-gray-400">{profile.presidentEmail}</td>
                        <td className="py-3 px-5 text-right">
                          <button onClick={handleEdit} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    )}
                    {council.map((member: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5 text-sm font-semibold text-gray-300">{member.role}</td>
                        <td className="py-3 px-5 text-sm font-semibold text-white">{member.name}</td>
                        <td className="py-3 px-5 text-sm text-gray-400">{member.email}</td>
                        <td className="py-3 px-5 flex justify-end gap-1">
                          <button onClick={handleEdit} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Edit"><Edit className="w-4 h-4"/></button>
                          <button onClick={handleEdit} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {!profile.presidentName && council.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-gray-500">No members added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
