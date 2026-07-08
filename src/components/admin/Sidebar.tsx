"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FolderOpen, LogOut } from "lucide-react";
import Image from "next/image";

const menus = [
    {
        title: "Albums",
        href: "/admin/albums",
        icon: FolderOpen,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    async function logout() {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <aside className="fixed left-0 top-0 z-20 flex h-screen w-72 flex-col bg-[#03412C] text-white">

            <div className="mt-4 flex justify-center">
                <Image
                    src="/logo/jejak putih 2 (1).svg"
                    alt="Jejak Photo"
                    width={300}
                    height={60}
                    priority
                />
            </div>

            <nav className="px-4 py-8">
                {menus.map((menu) => {
                    const Icon = menu.icon;
                    const active =
                        pathname === menu.href ||
                        pathname.startsWith(menu.href + "/");
                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`mb-2 flex items-center gap-4 rounded-xl px-5 py-4 transition ${active
                                ? "bg-white text-[#03412C]"
                                : "hover:bg-white/10"
                                }`}
                        >
                            <Icon size={22} />
                            {menu.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto p-4">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-4 rounded-xl px-5 py-4 hover:bg-white/10"
                >
                    <LogOut size={22} />
                    Logout
                </button>
            </div>

        </aside>
    );
}