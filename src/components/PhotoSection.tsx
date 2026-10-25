import React, { useRef, useState } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2, X, Eye } from 'lucide-react';
import { PhotoItem } from '../utils/reportLogic';

interface PhotoSectionProps {
  photos: PhotoItem[];
  onAddPhotos: (newPhotos: PhotoItem[]) => void;
  onRemovePhoto: (id: string) => void;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({
  photos,
  onAddPhotos,
  onRemovePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const loadedPhotos: PhotoItem[] = [];
    let processed = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedPhotos.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url: event.target.result as string,
            name: file.name,
          });
        }
        processed++;
        if (processed === files.length) {
          onAddPhotos(loadedPhotos);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
            <ImageIcon className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Foto Kegiatan</h2>
            <p className="text-xs text-rose-300/60">Dokumentasi booth, antrean, atau hasil print</p>
          </div>
        </div>
        <div>
          <span className="px-3 py-1 bg-rose-950/80 text-rose-300 font-extrabold text-xs rounded-full border border-rose-700/40">
            {photos.length} Foto
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/30 bg-[#160206]/60 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 mb-4 group"
      >
        <div className="w-11 h-11 rounded-2xl bg-rose-900/50 group-hover:bg-rose-800 text-rose-300 flex items-center justify-center border border-rose-500/30 transition shadow-inner">
          <UploadCloud className="w-5 h-5 text-rose-200" />
        </div>
        <p className="text-xs font-bold text-white">
          Klik untuk unggah foto kegiatan
        </p>
        <p className="text-[11px] text-rose-300/60">
          Bisa pilih banyak foto (JPG, PNG, WEBP)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Photo Thumbnails Grid */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {photos.length === 0 ? (
          <div className="py-6 text-center text-rose-300/50 text-xs border border-dashed border-rose-500/20 rounded-2xl bg-[#160206]/50">
            Belum ada dokumentasi foto yang diunggah.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto max-h-56 pr-1">
            {photos.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-rose-500/25 bg-[#160206] aspect-square shadow-md"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-[#0f0205]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(item);
                    }}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs shadow-sm transition cursor-pointer"
                    title="Lihat ukuran penuh"
                    aria-label={`Lihat foto ${item.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(item.id);
                    }}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs shadow-sm transition cursor-pointer"
                    title="Hapus foto"
                    aria-label={`Hapus foto ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-[#0a0103]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full glass-maroon-card rounded-3xl overflow-hidden shadow-2xl p-3 border border-rose-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 text-white border-b border-rose-500/20 mb-2">
              <span className="text-xs font-bold text-rose-200 truncate max-w-xs">{selectedPhoto.name}</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl border border-rose-500/30 transition cursor-pointer"
                aria-label="Tutup preview foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden p-2">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
