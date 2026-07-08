import {
    Camera,
    ImageIcon,
    ShieldCheck,
    MessageCircle,
} from "lucide-react";

const features = [
    {
        icon: Camera,
        title: "Professional Photography",
        description:
            "Every match is captured using high-quality cameras by experienced sports photographers.",
    },
    {
        icon: ImageIcon,
        title: "Original Resolution",
        description:
            "Receive your purchased photos in full resolution without watermark.",
    },
    {
        icon: ShieldCheck,
        title: "Secure Purchase",
        description:
            "Simple and trusted ordering process directly through WhatsApp.",
    },
    {
        icon: MessageCircle,
        title: "Fast Delivery",
        description:
            "Photos are delivered digitally after payment confirmation.",
    },
];

export default function FeatureSection() {
    return (
        <section className="bg-[#FAFAFA] py-28">
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}

                <div className="mb-16 text-center">

                    <span className="text-sm font-semibold uppercase tracking-[4px] text-[#03412C]">
                        Why Choose Us
                    </span>

                    <h2 className="mt-4 text-4xl font-bold text-gray-900">
                        Designed For Tennis Players
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
                        We don't just take photos. We preserve every serve,
                        every rally, and every winning moment on the court.
                    </p>

                </div>

                {/* Cards */}

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

                    {features.map((item, index) => {

                        const Icon = item.icon;

                        return (

                            <div
                                key={index}
                                className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#03412C] hover:shadow-xl"
                            >

                                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#03412C]/10 text-[#03412C]">

                                    <Icon size={32} />

                                </div>

                                <h3 className="mb-4 text-xl font-semibold text-gray-900">

                                    {item.title}

                                </h3>

                                <p className="leading-7 text-gray-500">

                                    {item.description}

                                </p>

                            </div>

                        );

                    })}

                </div>

            </div>
        </section>
    );
}