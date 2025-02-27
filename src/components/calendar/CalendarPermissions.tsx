"use client";

import React, { useState } from 'react';
import { TouchButton } from '@/components/ui/TouchButton';
import { X, Plus, User, Users, Globe, Lock, Mail, Copy, Check, Info } from 'lucide-react';
import { toast } from 'react-toastify';

interface CalendarPermissionsProps {
  calendarId: string;
  calendarName: string;
  onClose?: () => void;
}

type PermissionLevel = 'see' | 'edit' | 'make_changes' | 'manage';
type VisibilityOption = 'private' | 'public' | 'selected';

interface CalendarPermission {
  id: string;
  email: string;
  role: PermissionLevel;
}

export const CalendarPermissions: React.FC<CalendarPermissionsProps> = ({
  calendarId,
  calendarName,
  onClose,
}) => {
  const [visibility, setVisibility] = useState<VisibilityOption>('private');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<PermissionLevel>('see');
  const [permissions, setPermissions] = useState<CalendarPermission[]>([
    { id: '1', email: 'family@example.com', role: 'edit' },
    { id: '2', email: 'friend@example.com', role: 'see' },
  ]);
  const [shareLink, setShareLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // Handle adding a new permission
  const handleAddPermission = () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Check if the email already has permissions
    if (permissions.some(p => p.email === newEmail)) {
      toast.error('This email already has permissions');
      return;
    }
    
    // Add the new permission
    const newPermission: CalendarPermission = {
      id: Date.now().toString(),
      email: newEmail,
      role: newRole,
    };
    
    setPermissions([...permissions, newPermission]);
    setNewEmail('');
    toast.success('Permission added successfully');
  };

  // Handle removing a permission
  const handleRemovePermission = (id: string) => {
    setPermissions(permissions.filter(p => p.id !== id));
    toast.success('Permission removed successfully');
  };

  // Handle updating a permission role
  const handleUpdateRole = (id: string, role: PermissionLevel) => {
    setPermissions(permissions.map(p => 
      p.id === id ? { ...p, role } : p
    ));
    toast.success('Permission updated successfully');
  };

  // Generate a share link
  const handleGenerateLink = () => {
    // In a real app, this would call an API to generate a sharing link
    const link = `https://calendar.example.com/share/${calendarId}?token=${Date.now()}`;
    setShareLink(link);
  };

  // Copy the share link to clipboard
  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  // Get the icon for the visibility option
  const getVisibilityIcon = (option: VisibilityOption) => {
    switch (option) {
      case 'private':
        return <Lock className="w-5 h-5" />;
      case 'public':
        return <Globe className="w-5 h-5" />;
      case 'selected':
        return <Users className="w-5 h-5" />;
    }
  };

  // Get the label for the permission role
  const getRoleLabel = (role: PermissionLevel) => {
    switch (role) {
      case 'see':
        return 'See all event details';
      case 'edit':
        return 'Make changes to events';
      case 'make_changes':
        return 'Make changes and manage sharing';
      case 'manage':
        return 'Make changes and manage sharing';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Share "{calendarName}"
        </h2>
        {onClose && (
          <TouchButton
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close permissions"
          >
            <X className="w-5 h-5" />
          </TouchButton>
        )}
      </div>

      <div className="p-4">
        {/* Visibility options */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">General access</h3>
          
          <div className="space-y-2">
            <TouchButton
              onClick={() => setVisibility('private')}
              className={`flex items-center w-full p-3 border rounded-md ${
                visibility === 'private' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Lock className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Private</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Only people with permissions can see this calendar
                </div>
              </div>
            </TouchButton>
            
            <TouchButton
              onClick={() => setVisibility('selected')}
              className={`flex items-center w-full p-3 border rounded-md ${
                visibility === 'selected' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Selected people</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Only people you select can see this calendar
                </div>
              </div>
            </TouchButton>
            
            <TouchButton
              onClick={() => setVisibility('public')}
              className={`flex items-center w-full p-3 border rounded-md ${
                visibility === 'public' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Globe className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Public</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Anyone can find and see this calendar
                </div>
              </div>
            </TouchButton>
          </div>
        </div>
        
        {/* Share with specific people */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Share with specific people</h3>
          
          <div className="flex mb-3">
            <input
              type="email"
              placeholder="Add email or name"
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <select
              className="px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as PermissionLevel)}
            >
              <option value="see">See only</option>
              <option value="edit">Edit</option>
              <option value="make_changes">Make changes</option>
              <option value="manage">Manage</option>
            </select>
            <TouchButton
              onClick={handleAddPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              aria-label="Add permission"
            >
              <Plus className="w-5 h-5" />
            </TouchButton>
          </div>
          
          {/* Permissions list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {permissions.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No permissions added yet
              </div>
            ) : (
              permissions.map(permission => (
                <div 
                  key={permission.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-gray-500" />
                    <span>{permission.email}</span>
                  </div>
                  <div className="flex items-center">
                    <select
                      className="mr-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={permission.role}
                      onChange={(e) => handleUpdateRole(permission.id, e.target.value as PermissionLevel)}
                    >
                      <option value="see">See only</option>
                      <option value="edit">Edit</option>
                      <option value="make_changes">Make changes</option>
                      <option value="manage">Manage</option>
                    </select>
                    <TouchButton
                      onClick={() => handleRemovePermission(permission.id)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label={`Remove ${permission.email}`}
                    >
                      <X className="w-4 h-4" />
                    </TouchButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Share link */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Get a shareable link</h3>
          
          {shareLink ? (
            <div className="mb-3">
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <TouchButton
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  aria-label="Copy link"
                >
                  {linkCopied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </TouchButton>
              </div>
              <div className="mt-2 flex items-start">
                <Info className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Anyone with this link can view this calendar according to the permissions you've set.
                </p>
              </div>
            </div>
          ) : (
            <TouchButton
              onClick={handleGenerateLink}
              className="flex items-center justify-center w-full p-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Globe className="w-4 h-4 mr-2" />
              Create shareable link
            </TouchButton>
          )}
        </div>
        
        {/* Done button */}
        <div className="flex justify-end">
          <TouchButton
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Done
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

export default CalendarPermissions; 