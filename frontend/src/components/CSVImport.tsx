'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { flashcardApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface CSVImportProps {
  deckId: number;
  onSuccess: () => void;
}

export function CSVImport({ deckId, onSuccess }: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await flashcardApi.uploadCSV(deckId, file);
      toast.success('Import CSV thành công!');
      onSuccess();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Import CSV thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">Import từ file CSV</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Format: vietnamese,pronunciation,target_language
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="csv-upload"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
      >
        Chọn file CSV
      </Button>
    </div>
  );
}