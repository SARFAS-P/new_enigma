import { motion } from "framer-motion";
import { Lock, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapNode {
    id: string;
    type: 'DAY' | 'PATH' | 'TURN';
    day?: number;
}

interface LevelTileProps {
    node: MapNode;
    status: "locked" | "current" | "completed";
    onClick?: () => void;
    index: number;
    isEvenRow: boolean;
}

export function LevelTile({ node, status, onClick, index, isEvenRow }: LevelTileProps) {
    // Styles based on the specific design image provided (Connected 3D Path)
    const isDay = node.type === 'DAY';
    const isTurn = node.type === 'TURN';
    const isPath = node.type === 'PATH';

    // Reference style: Days are Black, Paths are Cream.
    // If locked day, maybe Dark Gray? Or Black with Opacity?
    // Let's try: Day = Black/Dark, Path = Cream.
    const isDayTile = isDay;

    // Dimensions
    const w = "w-24 sm:w-32";
    const h = "h-16 sm:h-20";

    return (
        <div
            className={cn(
                "relative mx-0 my-0 z-10 transform-style-3d group transition-transform duration-300 ease-out",
                w, h,
                // Apply Skew for the ribbon parallelogram look
                "transform -skew-x-[20deg]",
                // Lift current/unlocked
                status === "current" && isDay && "-translate-y-4",
                isDay && status !== "locked" && "hover:-translate-y-6 hover:z-20 cursor-pointer"
            )}
            onClick={!isTurn && !isPath && status !== "locked" ? onClick : undefined}
        >
            {/* SHADOW / BOTTOM OFFSET */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 translate-x-3 translate-y-3 transition-all duration-300",
                    status === "current" && "translate-x-5 translate-y-7 blur-md bg-black/20",
                    isDay && status !== "locked" && "group-hover:translate-x-6 group-hover:translate-y-8 group-hover:blur-md group-hover:bg-black/20"
                )}
                style={{ zIndex: -1 }}
            />

            {/* MAIN FACE */}
            <div className={cn(
                "absolute inset-0 border-[1px] border-black flex items-center justify-center transition-colors duration-300",
                // Day Tiles: Black bg, White text. Path Tiles: Cream bg, Black text.
                isDayTile
                    ? "bg-black text-white"
                    : "bg-[#FDF6E3] text-black"
            )}>
                {/* Un-skew content to keep it upright */}
                <div className="transform skew-x-[20deg] flex items-center justify-center w-full h-full">
                    {isDay && (
                        <div className="flex flex-col items-center">
                            <span className={cn("font-orbitron font-bold text-lg uppercase tracking-widest", isDayTile ? "text-white" : "text-black")}>
                                DAY {node.day}
                            </span>
                            {/* Lock icon logic */}
                            {status === "locked" && <Lock className="w-4 h-4 text-white/40 mt-1" />}
                            {status === "completed" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shadow-[0_0_5px_theme(colors.green.400)]" />}
                        </div>
                    )}

                    {isPath && (
                        <ArrowRight
                            className={cn(
                                "w-6 h-6 text-black",
                                !isEvenRow && "rotate-180"
                            )}
                            strokeWidth={3}
                        />
                    )}

                    {isTurn && (
                        <ArrowDown className="w-6 h-6 text-black" strokeWidth={3} />
                    )}
                </div>
            </div>

            {/* THICKNESS (RIGHT FACE) - Adjusted to match skew */}
            <div className="absolute right-0 top-0 h-full w-2 bg-black/30 origin-right skew-y-[45deg] pointer-events-none translate-x-[0.5px]" />
            <div className="absolute bottom-0 left-0 w-full h-2 bg-black/30 origin-bottom skew-x-[45deg] pointer-events-none translate-y-[-0.5px]" />

        </div>
    );
}
