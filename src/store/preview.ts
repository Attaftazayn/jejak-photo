import { create } from "zustand";
import { Photo } from "@/types/photo";

interface PreviewStore {
    photo: Photo | null;
    open: boolean;

    openPreview: (photo: Photo) => void;
    closePreview: () => void;
}

export const usePreview = create<PreviewStore>((set) => ({
    photo: null,
    open: false,

    openPreview: (photo) =>
        set({
            photo,
            open: true,
        }),

    closePreview: () =>
        set({
            open: false,
            photo: null,
        }),
}));