"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useServer } from "@/components/general/server-context";

interface ModalOpenerButtonProps {
  name: string;
}

export default function ModalOpenerButton({ name }: ModalOpenerButtonProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { setCurrentServer } = useServer();

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleContinue = () => {
    document.cookie = `current-server=${name}; path=/;`;
    setCurrentServer(name);
    setDialogOpen(false);
  };

  return (
    <>
      <Button variant="outline" className="w-full" onClick={handleDialogOpen}>
        Rename
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changing server dashboard</DialogTitle>
            <DialogDescription>
              Do you want to change server managing to <span>{name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center items-center">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
