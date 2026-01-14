
import React from 'react';
import { Camera } from 'lucide-react';

interface Props {
  itemId: string;
  onImageSelected: (file: File) => void;
  className?: string;
}

const ImageUploader: React.FC<Props> = ({ itemId, onImageSelected, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  return (
    <div className={className}>
      <label htmlFor={`upload-${itemId}`} className="cursor-pointer">
        <div 
          className="bg-white/90 text-pawon-dark p-2 rounded-full shadow-lg hover:bg-white flex items-center justify-center transition-colors"
          title="Ganti Foto"
        >
          <Camera size={16} />
        </div>
      </label>
      <input
        id={`upload-${itemId}`}
        type="file"
        accept="image/*,.heic,.heif" // Add HEIC/HEIF for iOS compatibility
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

export default ImageUploader;
