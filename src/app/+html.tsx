import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Coquille HTML de l'export web statique (PWA hébergée sous /picogros/).
 * Les chemins absolus doivent inclure le baseUrl configuré dans app.json.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <title>PicoGros</title>
        <meta name="theme-color" content="#0C071D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PicoGros" />
        <link rel="manifest" href="/picogros/manifest.json" />
        <link rel="apple-touch-icon" href="/picogros/apple-touch-icon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'html,body{background:#0C071D}' }} />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/picogros/sw.js')})}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
