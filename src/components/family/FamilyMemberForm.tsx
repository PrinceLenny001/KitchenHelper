"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FamilyMember } from '@/hooks/useFamilyMembersApi';
import { useFamilyMember } from '@/lib/context/FamilyMemberContext';
import { TouchButton } from '@/components/ui/TouchButton';
import { X, Upload, User, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface FamilyMemberFormProps {
  familyMember?: FamilyMember;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  familyMember,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(familyMember?.name || '');
  const [color, setColor] = useState(familyMember?.color || '#3B82F6');
  const [image, setImage] = useState<string | null>(familyMember?.image || null);
  const [isDefault, setIsDefault] = useState(familyMember?.isDefault || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createFamilyMember, updateFamilyMember, uploadImage } = useFamilyMember();
  
  const isEditing = !!familyMember;
  
  // Set up image preview
  useEffect(() => {
    if (image) {
      setPreviewUrl(image);
    }
  }, [image]);
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    try {
      // Upload the image
      const imagePath = await uploadImage(file);
      if (imagePath) {
        setImage(imagePath);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
    }
    
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && familyMember) {
        // Update existing family member
        await updateFamilyMember(
          familyMember.id,
          name,
          color,
          image,
          isDefault
        );
        toast.success('Family member updated successfully');
      } else {
        // Create new family member
        await createFamilyMember(
          name,
          color,
          image,
          isDefault
        );
        toast.success('Family member created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to save family member');
      console.error('Error saving family member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Color options
  const colorOptions = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#EF4444', label: 'Red' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#6B7280', label: 'Gray' },
    { value: '#000000', label: 'Black' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Edit Family Member' : 'Add Family Member'}
        </h2>
        <TouchButton
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </TouchButton>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        {/* Image upload */}
        <div className="mb-4 flex flex-col items-center">
          <div 
            className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleUploadClick}
          >
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt={name || 'Family member'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <TouchButton
            type="button"
            onClick={handleUploadClick}
            className="flex items-center text-sm text-blue-500"
          >
            <Upload className="w-4 h-4 mr-1" />
            {previewUrl ? 'Change Photo' : 'Upload Photo'}
          </TouchButton>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
        </div>
        
        {/* Name input */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter name"
            required
          />
        </div>
        
        {/* Color selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((option) => (
              <TouchButton
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`w-full p-1 rounded-md border-2 ${
                  color === option.value ? 'border-blue-500' : 'border-transparent'
                }`}
                aria-label={`Select ${option.label} color`}
                aria-pressed={color === option.value}
              >
                <div 
                  className="w-full h-8 rounded-md"
                  style={{ backgroundColor: option.value }}
                />
              </TouchButton>
            ))}
          </div>
          
          {/* Custom color input */}
          <div className="mt-2 flex items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#RRGGBB"
            />
          </div>
        </div>
        
        {/* Default checkbox */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">Set as default family member</span>
          </label>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <TouchButton
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </TouchButton>
          <TouchButton
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </TouchButton>
        </div>
      </form>
    </div>
  );
}; 