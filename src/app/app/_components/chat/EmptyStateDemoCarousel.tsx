"use client";

import { useEffect, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const EMPTY_STATE_DEMOS = [
  {
    title: "Plan work faster",
    description: "Turn ideas into tasks and actions.",
  },
  {
    title: "Connect apps",
    description: "Pull context from docs and calendars.",
  },
  {
    title: "Research clearly",
    description: "Compare sources and summarize next steps.",
  },
  {
    title: "Resume chats",
    description: "Continue with clean context.",
  },
];

export function EmptyStateDemoCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;

    const syncCurrentSlide = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    syncCurrentSlide();
    api.on("select", syncCurrentSlide);
    api.on("reInit", syncCurrentSlide);

    return () => {
      api.off("select", syncCurrentSlide);
      api.off("reInit", syncCurrentSlide);
    };
  }, [api]);

  return (
    <div className="mt-auto flex w-full max-w-lg flex-col items-center gap-3 pt-10">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {EMPTY_STATE_DEMOS.map((demo) => (
            <CarouselItem key={demo.title} className="pl-3">
              <div className="flex min-h-28 items-center justify-between gap-4 overflow-hidden rounded-xl bg-zinc-100/80 px-5 py-4 dark:bg-zinc-900/70">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {demo.title}
                  </h2>
                  <p className="mt-1 max-w-64 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                    {demo.description}
                  </p>
                </div>

                <DemoPreview />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center gap-2">
        {EMPTY_STATE_DEMOS.map((demo, index) => (
          <button
            key={demo.title}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "size-2 rounded-full transition-colors",
              index === currentSlide
                ? "bg-zinc-500 dark:bg-zinc-400"
                : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            )}
            aria-label={`Show ${demo.title}`}
            aria-current={index === currentSlide ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function DemoPreview() {
  return (
    <div className="hidden h-20 w-36 shrink-0 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm sm:block dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-2 flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-red-400" />
        <span className="size-1.5 rounded-full bg-yellow-400" />
        <span className="size-1.5 rounded-full bg-green-400" />
      </div>
      <div className="space-y-1.5">
        <div className="h-2 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="rounded-md border border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-1.5 flex items-center justify-between">
            <div className="h-1.5 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="size-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
