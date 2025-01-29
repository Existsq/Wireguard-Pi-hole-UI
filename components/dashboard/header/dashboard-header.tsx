'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function DashboardHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleCreate = async () => {
    if (!newProfileName.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Название профиля не может быть пустым"
      });
      return;
    }

    try {
      const response = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileName: newProfileName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при создании профиля');
      }

      toast({
        title: "Успешно",
        description: "Профиль создан"
      });

      setIsCreateDialogOpen(false);
      setNewProfileName('');
      window.location.reload();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать профиль"
      });
    }
  };

  return (
    <header className="sticky top-0 flex h-fit items-center border bg-background z-[100] mx-6 mt-6 rounded-md">
      <nav className="grid grid-cols-2 gap-2 text-lg font-medium p-4 w-full space-y-1">
      <Button 
          className="w-full col-span-2" 
          variant="default"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create new
        </Button>
        <Button variant="secondary" className="w-full">
          Export profiles
        </Button>
        <Button variant="secondary" className="w-full">
          Import profiles
        </Button>
      </nav>

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent className="max-w-[400px] p-6 rounded-lg">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-2xl font-bold">
              Создать новый профиль
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Введите название для нового профиля
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Название профиля"
              className="w-full"
              autoFocus
            />
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              className="mt-0 flex-1"
              onClick={() => {
                setNewProfileName('');
                setIsCreateDialogOpen(false);
              }}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              className="mt-0 flex-1"
              onClick={handleCreate}
            >
              Создать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
} 