import { LevelMap } from "../components/level/LevelMap";
import { motion } from "framer-motion";

export default function LevelMapPage() {
    return (
        <div className="min-h-screen bg-[#FDF6E3] relative overflow-hidden pt-16">
            {/* Vertical Stripes Background */}
            <div className="absolute inset-0 z-0 flex justify-between pointer-events-none opacity-20">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-[4%] h-full bg-black/5" />
                ))}
            </div>

            <div className="relative z-10 w-full">
                {/* Header Section */}
                <div className="w-full bg-black py-4 md:py-6 mb-0 shadow-lg">
                    <div className="container mx-auto px-6">
                        <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron tracking-widest uppercase">
                            Levels
                        </h1>
                    </div>
                </div>

                {/* Map Section */}
                <div className="container mx-auto px-4 pb-20 pt-4">
                    <LevelMap />
                </div>
            </div>
        </div>
    );
}
