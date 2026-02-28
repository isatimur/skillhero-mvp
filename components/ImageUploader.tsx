import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { FantasyButton } from './ui';

interface ImageUploaderProps {
    onUpload: (file: File) => void;
    currentImage?: string;
    loading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, currentImage, loading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Call upload handler
        onUpload(file);
    };

    const clearImage = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!preview && (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                            ? 'border-indigo-500 bg-indigo-900/20'
                            : 'border-indigo-900/50 bg-black/30 hover:border-indigo-700'
                        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />

                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center">
                            <Upload className="text-indigo-400" size={32} />
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-300 font-medium">
                                {dragActive ? 'Drop image here' : 'Drag and drop or click to upload'}
                            </p>
                            <p className="text-xs text-slate-500">
                                PNG, JPG or GIF (max 5MB)
                            </p>
                        </div>

                        <FantasyButton
                            onClick={() => fileInputRef.current?.click()}
                            variant="tech"
                            size="sm"
                            icon={<ImageIcon size={16} />}
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Choose File'}
                        </FantasyButton>
                    </div>
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="relative bg-black/50 rounded-lg p-4 border border-indigo-900/50">
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-2 bg-red-900/50 hover:bg-red-800 rounded-full transition-colors border border-red-500"
                        disabled={loading}
                    >
                        <X size={16} className="text-red-300" />
                    </button>

                    <div className="flex items-center gap-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-64 max-w-full rounded border border-indigo-500/50 object-contain"
                        />
                    </div>

                    {loading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-indigo-300">Uploading...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Current Image (if exists and no new preview) */}
            {currentImage && !preview && (
                <div className="bg-black/50 rounded-lg p-4 border border-green-900/50">
                    <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                        <ImageIcon size={12} /> Current Image
                    </p>
                    <img
                        src={currentImage}
                        alt="Current"
                        className="max-h-48 rounded border border-green-500/50"
                    />
                </div>
            )}
        </div>
    );
};
