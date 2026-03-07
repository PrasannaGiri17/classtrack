import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Crop, Check, RefreshCw } from 'lucide-react';
import { getCroppedImg } from '../Utils/cropImage';

import PortalPopup from './PortalPopup';

const PhotoCropModal = ({ isOpen, image, onClose, onDone, onChange }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleDone = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onDone(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <PortalPopup isOpen={isOpen} onClose={onClose} zIndex="z-[10100]">
            <div className="bg-white dark:bg-[#0b1220] w-[95%] max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Crop size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Crop Profile Image</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Adjust your photo for the best look</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Container */}
                <div className="relative h-[400px] bg-slate-100 dark:bg-slate-900/50 m-4 rounded-[32px] overflow-hidden">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 1:1 Square crop
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        classes={{
                            containerClassName: "rounded-[32px] overflow-hidden"
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-8 pb-8 pt-4 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Zoom Level</span>
                            <span className="text-emerald-500">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            onClick={onChange}
                            className="flex-1 h-16 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-200 text-xs font-black uppercase tracking-widest rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg active:scale-95 group"
                        >
                            <RefreshCw size={18} className="transition-transform group-hover:rotate-180 duration-500" />
                            Change Photo
                        </button>
                        <button
                            onClick={handleDone}
                            className="flex-2 h-16 px-10 flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 group"
                        >
                            <Check size={18} className="transition-transform group-hover:scale-125 duration-300" />
                            Done & Perfect
                        </button>
                    </div>
                </div>
            </div>
        </PortalPopup>
    );
};

export default PhotoCropModal;
