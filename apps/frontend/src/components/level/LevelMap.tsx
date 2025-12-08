// ... imports
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlay } from "@/hooks/usePlay";
import { LevelTile } from "./LevelTile";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LevelMap() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { progress, initialize, loading } = usePlay(currentUser);

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (loading && !progress) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-black/50" />
            </div>
        );
    }

    const totalDays = progress?.totalDays || 13;
    const currentDay = progress?.currentDay || 1;
    const DAYS_PER_ROW = 4;

    // chunk days
    const dayRows: number[][] = [];
    let currentChunk: number[] = [];
    for (let d = 1; d <= totalDays; d++) {
        currentChunk.push(d);
        if (currentChunk.length === DAYS_PER_ROW) {
            dayRows.push(currentChunk);
            currentChunk = [];
        }
    }
    if (currentChunk.length > 0) dayRows.push(currentChunk);

    const getDayStatus = (day: number) => {
        if (!progress) return "locked";
        if (day < currentDay) return "completed";
        if (day === currentDay) return "current";
        return "locked";
    };

    const handleDayClick = (day: number) => {
        navigate(`/play?day=${day}`);
    };

    return (
        <div className="w-full flex justify-center py-0 pb-40 overflow-visible">
            <motion.div
                initial={{ opacity: 0, rotateX: 45, rotateZ: -10 }}
                animate={{ opacity: 1, rotateX: 45, rotateZ: -10 }}
                transition={{ duration: 1 }}
                className="transform-style-3d bg-transparent"
                style={{ perspective: "1000px" }}
            >
                {/* 
                   We use inline-flex column so the container shrinks to fit the widest row. 
                   This ensures 'justify-end' aligns perfectly with 'justify-start' relative to the edges.
                */}
                <div className="inline-flex flex-col">
                    {dayRows.map((chunk, rowIndex) => {
                        const isEvenRow = rowIndex % 2 === 0;
                        // Row 0 (Even): L -> R. Render D1..D4.
                        // Row 1 (Odd): R -> L. Render D8..D5 (reversed chunk). 
                        const displayDays = isEvenRow ? chunk : [...chunk].reverse();

                        return (
                            <div key={rowIndex} className="flex flex-col relative w-full">
                                {/* ROW CONTENT */}
                                <div className={cn(
                                    "flex items-center",
                                    isEvenRow ? "justify-start" : "justify-end"
                                )}>
                                    {displayDays.map((day, i) => (
                                        <div key={`tile-${day}`} className="flex items-center">
                                            <LevelTile
                                                node={{ id: `day-${day}`, type: 'DAY', day }}
                                                status={getDayStatus(day)}
                                                onClick={() => handleDayClick(day)}
                                                index={day}
                                                isEvenRow={isEvenRow}
                                            />
                                            {/* Spacer Arrow - Only between days in the row */}
                                            {i < displayDays.length - 1 && (
                                                <LevelTile
                                                    node={{ id: `path-${day}`, type: 'PATH' }}
                                                    status="locked"
                                                    index={0}
                                                    isEvenRow={isEvenRow}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* TURN CONNECTOR (Between Rows) */}
                                {rowIndex < dayRows.length - 1 && (
                                    <div className={cn(
                                        "flex w-full",
                                        // If Even Row (L->R), ends Right -> Turn on Right.
                                        // If Odd Row (R->L), ends Left -> Turn on Left.
                                        isEvenRow ? "justify-end" : "justify-start"
                                    )}>
                                        <LevelTile
                                            node={{ id: `turn-${rowIndex}`, type: 'TURN' }}
                                            status="locked"
                                            index={0}
                                            isEvenRow={isEvenRow}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
// Helper for simple class names
function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ");
}

