"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        router.push("/admin/albums");
        router.refresh();
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl"
            >
                <div className="flex justify-center">
                    <Image
                        src="/logo/jejak putih 1.svg"
                        alt="Jejak Photo"
                        width={300}
                        height={60}
                        priority
                    />
                </div>

                <h1 className="mb-8 text-center text-xl font-bold">
                    Admin Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="mb-4 w-full rounded-xl border p-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="mb-6 w-full rounded-xl border p-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full rounded-xl bg-[#03412C] py-4 text-white">
                    Login
                </button>
            </form>
        </main>
    );
}