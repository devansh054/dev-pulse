'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Check, User } from 'lucide-react'

interface AvatarSelectorProps {
  currentAvatar?: string
  githubAvatar?: string
  onAvatarSelect: (avatar: string) => void
}

const customAvatars = [
  '/avatars/user_krimson.png',
  '/avatars/user_mati.png', 
  '/avatars/user_pek.png',
  '/avatars/user_joyboy.png',
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png'
]

export function AvatarSelector({ currentAvatar, githubAvatar, onAvatarSelect }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || githubAvatar)

  const handleSelect = (avatar: string) => {
    setSelectedAvatar(avatar)
    onAvatarSelect(avatar)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          Change Avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {/* GitHub Avatar Option */}
          {githubAvatar && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">GitHub Profile</h4>
              <div 
                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                  selectedAvatar === githubAvatar 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleSelect(githubAvatar)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={githubAvatar} alt="GitHub Avatar" />
                    <AvatarFallback>GH</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Use GitHub Profile Picture</p>
                    <p className="text-xs text-muted-foreground">Your current GitHub avatar</p>
                  </div>
                  {selectedAvatar === githubAvatar && (
                    <Check className="ml-auto h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Avatars */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Custom Avatars</h4>
            <div className="grid grid-cols-4 gap-3">
              {customAvatars.map((avatar, index) => (
                <div
                  key={avatar}
                  className={`relative cursor-pointer rounded-lg border-2 p-2 transition-colors ${
                    selectedAvatar === avatar 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleSelect(avatar)}
                >
                  <Avatar className="h-12 w-12 mx-auto">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback>{index + 1}</AvatarFallback>
                  </Avatar>
                  {selectedAvatar === avatar && (
                    <Check className="absolute -top-1 -right-1 h-4 w-4 text-primary bg-background rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
