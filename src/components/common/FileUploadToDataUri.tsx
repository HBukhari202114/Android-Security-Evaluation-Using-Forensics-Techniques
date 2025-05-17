
"use client";
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileUploadToDataUriProps {
  id: string;
  label: string;
  onFileLoad: (dataUri: string, fileName: string) => void;
  accept?: string;
  className?: string;
}

export function FileUploadToDataUri({ id, label, onFileLoad, accept, className }: FileUploadToDataUriProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(null);
    setError(null);
    setSuccessMessage(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onFileLoad(result, file.name);
          setFileName(file.name);
          setSuccessMessage(`File "${file.name}" loaded successfully.`);
        } else {
          setError('Failed to read file content.');
          onFileLoad('', '');
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
        onFileLoad('', '');
      };
      reader.readAsDataURL(file);
    } else {
      onFileLoad('', ''); // Clear if no file selected or deselected
    }
  };

  return (
    <div className={`grid w-full items-center gap-2 ${className}`}>
      <Label htmlFor={id} className="font-medium">{label}</Label>
      <Input 
        id={id} 
        type="file" 
        onChange={handleFileChange} 
        accept={accept}
        className="file:text-primary file:font-semibold hover:file:bg-primary/10"
      />
      {fileName && successMessage && (
        <div className="flex items-center text-sm text-green-600 mt-1">
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="flex items-center text-sm text-destructive mt-1">
          <AlertCircle className="h-4 w-4 mr-1.5" />
          {error}
        </div>
      )}
    </div>
  );
}
