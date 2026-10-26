import React, { useRef, useState } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2, X, Eye } from 'lucide-react';
import { PhotoItem } from '../utils/reportLogic';
import { compressImageFile } from '../utils/imageCompressor';

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
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressing(true);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    try {
      const compressionPromises = files.map(async (file) => {
        // Compress and resize image automatically to max 600px width with 0.6 quality
        const compressedUrl = await compressImageFile(file, 600, 0.6);
        return {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: compressedUrl || '',
          name: file.name,
          timestamp: timeStr,
        };
      });

      const loadedPhotos = await Promise.all(compressionPromises);
      const validPhotos = loadedPhotos.filter((p) => Boolean(p.url));
      if (validPhotos.length > 0) {
        onAddPhotos(validPhotos);
      }
    } catch (err) {
      console.error('Failed to compress photos:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
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
          {isCompressing ? 'Sedang mengompres & optimasi foto...' : 'Klik untuk unggah foto kegiatan'}
        </p>
        <p className="text-[11px] text-rose-300/60">
          {isCompressing ? 'Menyesuaikan resolusi agar berkas PDF ringan...' : 'Bisa pilih banyak foto (JPG, PNG, WEBP)'}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 overflow-y-auto max-h-60 pr-1">
            {photos.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group relative rounded-2xl overflow-hidden border border-rose-500/30 hover:border-rose-400 bg-[#160206] aspect-square shadow-md cursor-pointer transition-all active:scale-95"
                title="Klik untuk melihat foto lebih besar"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />

                {/* Bottom title & timestamp bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1.5 flex items-center justify-between text-[10px] text-white pointer-events-none">
                  <span className="truncate max-w-[65%] font-medium">
                    #{idx + 1} {item.name}
                  </span>
                  <span className="text-[9px] text-rose-300 font-bold shrink-0 bg-black/40 px-1 rounded">
                    {item.timestamp || 'Foto'}
                  </span>
                </div>

                {/* Top Actions: Eye (Lihat) & Trash (Hapus) */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(item);
                    }}
                    className="p-1.5 bg-black/70 hover:bg-white text-white hover:text-slate-900 rounded-lg text-xs shadow transition cursor-pointer backdrop-blur-sm"
                    title="Lihat foto penuh"
                    aria-label={`Lihat foto ${item.name}`}
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(item.id);
                    }}
                    className="p-1.5 bg-rose-950/80 hover:bg-rose-600 text-rose-200 hover:text-white rounded-lg text-xs shadow transition cursor-pointer border border-rose-500/30 backdrop-blur-sm"
                    title="Hapus foto"
                    aria-label={`Hapus foto ${item.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
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
          className="fixed inset-0 bg-[#0a0103]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-3xl w-full glass-maroon-card rounded-3xl overflow-hidden shadow-2xl p-4 border border-rose-500/40 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
              <div className="truncate pr-3">
                <span className="text-sm font-extrabold text-white truncate block">
                  {selectedPhoto.name}
                </span>
                <span className="text-[11px] text-rose-300/70">
                  Waktu: {selectedPhoto.timestamp || 'Dokumentasi Kegiatan'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onRemovePhoto(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }}
                  className="p-2 bg-rose-950/80 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl border border-rose-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Hapus foto ini"
                >
                  <Trash2 className="w-4 h-4 text-rose-300" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition cursor-pointer"
                  aria-label="Tutup preview foto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image View */}
            <div className="max-h-[75vh] flex items-center justify-center bg-black/80 rounded-2xl overflow-hidden p-2 border border-rose-950">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
