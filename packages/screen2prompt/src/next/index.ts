'use client';
import dynamic from 'next/dynamic';

export const Screen2Prompt = dynamic(
  () => import('screen2prompt/react').then((m) => ({ default: m.Screen2Prompt })),
  { ssr: false }
);
