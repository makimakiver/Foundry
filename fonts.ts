// app/fonts.ts
import localFont from 'next/font/local';

export const alliance = localFont({
  src: [
    { path: './fonts/Alliance-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Alliance-Extrabold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-alliance',
  display: 'swap',
});
