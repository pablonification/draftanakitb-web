import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'DraftAnakITB',
  description: 'Platform menfess anonymous untuk mahasiswa ITB. Kirim pesan dan opinimu secara anonim ke Twitter!',
  metadataBase: new URL('https://draftanakitb.live'),
  applicationName: 'DraftAnakITB',
  authors: [{ name: 'DraftAnakITB Team' }],
  keywords: ['menfess', 'ITB', 'mahasiswa', 'anonymous', 'twitter', 'social media'],
  
  // Open Graph
  openGraph: {
    type: 'website',
    url: 'https://draftanakitb.live',
    title: 'DraftAnakITB - Platform Menfess ITB',
    description: 'Platform menfess anonymous untuk mahasiswa ITB. Kirim pesan dan opinimu secara anonim ke Twitter!',
    siteName: 'DraftAnakITB',
    images: [
      {
        url: '/og-image.jpg', // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'DraftAnakITB Preview'
      }
    ],
    locale: 'id_ID',
  },

  // Twitter/X specific
  twitter: {
    card: 'summary_large_image',
    site: '@DraftAnakITB',
    creator: '@satpam_itb',
    title: 'DraftAnakITB - Platform Menfess ITB',
    description: 'Platform menfess anonymous untuk mahasiswa ITB. Kirim pesan dan opinimu secara anonim ke Twitter!',
    images: ['/og-image.jpg'],
  },

  // Additional social media
  other: {
    'theme-color': '#000072',
    'msapplication-TileColor': '#000072',
    'msapplication-config': '/browserconfig.xml',
    'format-detection': 'telephone=no',
    
    // WhatsApp
    'og:whatsapp:title': 'DraftAnakITB - Platform Menfess ITB',
    'og:whatsapp:description': 'Platform menfess anonymous untuk mahasiswa ITB',
    
    // LinkedIn
    'og:linkedin:company': 'DraftAnakITB',
    'og:linkedin:industry': 'Social Media',
    
    // Discord
    'og:discord:site_name': 'DraftAnakITB',
    'og:discord:image_width': '1200',
    'og:discord:image_height': '630',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000072'
      }
    ]
  },

  // Manifest
  manifest: '/site.webmanifest'
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Additional verification tags */}
        <meta name="facebook-domain-verification" content="your-fb-verification-code" />
        <meta name="google-site-verification" content="your-google-verification-code" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

