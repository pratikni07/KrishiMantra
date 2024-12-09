import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

  
interface CropsProps {
  onAddCrops?: () => void;
  onSearch?: (searchTerm: string) => void;
}

const Crops: React.FC<CropsProps> = ({
  onAddCrops,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K shortcut to focus on search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
    searchInputRef.current?.focus();
  };

  const handleAddCrops = () => {
    onAddCrops?.();
  };

  return (
    <div className="">
      <div className="bg-white  overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-[#31A05F] to-[#2a8f54] text-white py-5 px-6 ">
          <h1 className="text-3xl font-extrabold text-center tracking-tight">
            Crops Management
          </h1>
        </div>
        
        <div className="p-6 space-y-6">
        <div className="flex justify-between items-center gap-4">
  
  <Dialog>
  <DialogTrigger>
  <Button
    onClick={handleAddCrops}
    className="w-auto flex items-center justify-center gap-2 
      bg-[#31A05F] hover:bg-[#2a8f54] text-white 
      transition-all duration-300 ease-in-out 
      transform hover:scale-105 active:scale-95 
      shadow-md hover:shadow-lg"
  >
    <Plus size={20} className="mr-2" />
    Add Crops
  </Button>


  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>


  
  <div className="relative flex-grow max-w-[400px] w-full">
    <div className="flex items-center">
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Search crops..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full pl-10 pr-10 py-2 
          border-2 border-gray-300 
          focus:border-[#31A05F] 
          focus:ring-2 focus:ring-[#31A05F]/30 
          rounded-lg 
          transition-all duration-300"
      />
      <div className="absolute left-3 top-1/4 -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
      {searchTerm && (
        <button
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 
            text-gray-400 hover:text-gray-600 
            transition-colors duration-200"
        >
          <X size={20} />
        </button>
      )}
    </div>
    <div>
        <div className="text-center text-sm text-gray-500 flex justify-center items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs font-sans font-medium">
                Ctrl
              </kbd>
              <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs font-sans font-medium">
                K
              </kbd>
            </div>
            <span>Quick search shortcut</span>
          </div>
    </div>
  </div>
</div>

     

          
        </div>
      </div>
    </div>
  );
};

export default Crops;