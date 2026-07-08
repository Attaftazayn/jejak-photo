import { Photo } from "@/types/photo";

export function createWhatsappMessage(
    photos: Photo[],
    albumTitle: string = "Active Album"
) {
    const total = photos.reduce((sum, item) => sum + item.price, 0);
    const photoList = photos.map(p => `#${p.number}`).join("\n");

    const text = `Album:\n${albumTitle}\n\nSelected Photos:\n\n${photoList}\n\nTotal Photos:\n${photos.length}\n\nEstimated Total:\nRp ${total.toLocaleString("id-ID")}\n\nHello, I would like to order the selected photos above.`;

    return `https://wa.me/6281233456095?text=${encodeURIComponent(text)}`;
}