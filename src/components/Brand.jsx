"use client";

import Image from "next/image";

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1.5">
        <Image src="/images/logo.png" alt="" width={32} height={32} priority className="h-full w-full object-contain" />
      </span>
      <div className="text-left">
        <p className="text-sm font-semibold tracking-tight text-white">Lock-In</p>
        <p className="-mt-0.5 text-xs text-zinc-500">Pomodoro</p>
      </div>
    </div>
  );
}
