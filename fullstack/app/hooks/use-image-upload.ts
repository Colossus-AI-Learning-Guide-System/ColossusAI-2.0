"use client"

import { useCallback, useRef, useState, useEffect } from 'react'
import { supabase } from '@/app/lib/utils/supabaseClient'

type ImageUploadOptions = {
  onSuccess?: (url: string) => void;
}

export function useImageUpload(initialUrl: string | null = null, options: ImageUploadOptions = {}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { onSuccess } = options;

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      // Create preview immediately for better UX
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
      
      // Upload to Supabase storage in a user-specific folder
      const fileExt = file.name.split('.').pop()
      const folderPath = `${user.id}/`
      const fileName = `avatar.${fileExt}`
      const filePath = `${folderPath}${fileName}`
      
      // First, check if user folder exists and delete any existing files
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id)
      
      if (listError) {
        console.warn('Error listing files:', listError)
        // Continue anyway, as the folder might not exist yet
      }
      
      // Delete any existing files in the user's folder
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`)
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete)
          
        if (deleteError) {
          console.warn('Error deleting existing files:', deleteError)
          // Continue anyway, as we might still be able to upload
        }
      }
      
      // Upload the new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true, // Overwrite if exists
          cacheControl: '3600'
        })
        
      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      if (!data || !data.publicUrl) {
        throw new Error('Could not get public URL for uploaded file')
      }
      
      const publicUrl = data.publicUrl
      
      try {
        // Verify the URL is accessible
        const checkResponse = await fetch(publicUrl, { method: 'HEAD' })
        if (!checkResponse.ok) {
          console.warn(`URL validity check failed: ${checkResponse.status}`)
        }
      } catch (checkErr) {
        console.warn('Error checking URL validity:', checkErr)
        // Continue anyway, as this is just a validation step
      }
      
      // Skip updating profile table since avatar_url column doesn't exist
      
      // Set the URL with timestamp to avoid caching issues
      const cacheBustedUrl = `${publicUrl}?t=${new Date().getTime()}`
      console.log('Setting preview URL to:', cacheBustedUrl)
      setPreviewUrl(cacheBustedUrl)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(cacheBustedUrl);
      }
      
      return cacheBustedUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      throw err; // Re-throw to allow component to handle the error
    } finally {
      setIsUploading(false)
    }
  }, [onSuccess])

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Fetch the avatar on mount if initialUrl is not provided
  useEffect(() => {
    const fetchAvatar = async () => {
      if (initialUrl === null) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          
          // Check if the user has an avatar in the 'avatars' bucket
          const { data: files, error: listError } = await supabase.storage
            .from('avatars')
            .list(user.id)
          
          if (listError) {
            console.warn('Error listing files:', listError)
            return
          }
            
          if (files && files.length > 0) {
            // Get the URL of the first file (should be the only one)
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(`${user.id}/${files[0].name}`)
              
            // Add timestamp to avoid caching issues
            const cacheBustedUrl = `${publicUrl}?t=${new Date().getTime()}`
            setPreviewUrl(cacheBustedUrl)
          }
        } catch (err) {
          console.error('Error fetching avatar:', err)
        }
      } else if (initialUrl) {
        // If initial URL is provided, also add cache busting
        const cacheBustedUrl = initialUrl.includes('?') 
          ? `${initialUrl}&t=${new Date().getTime()}`
          : `${initialUrl}?t=${new Date().getTime()}`
        setPreviewUrl(cacheBustedUrl)
      }
    }
    
    fetchAvatar()
  }, [initialUrl])

  return { 
    previewUrl, 
    isUploading,
    error,
    fileInputRef, 
    handleThumbnailClick, 
    handleFileChange,
    setPreviewUrl
  }
}

