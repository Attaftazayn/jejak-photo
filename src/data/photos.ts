export const photos = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    image: `https://picsum.photos/600/800?random=${i}`,
    number: `IMG_${1000 + i}`,
    price: 15000,
}));