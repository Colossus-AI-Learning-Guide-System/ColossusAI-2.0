"use client"

import { useCallback, useRef, useState } from 'react'
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
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
        
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        
      if (updateError) throw updateError
      
      setPreviewUrl(publicUrl)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(publicUrl);
      }
      
      return publicUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      return null
    } finally {
      setIsUploading(false)
    }
  }, [onSuccess])

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

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

