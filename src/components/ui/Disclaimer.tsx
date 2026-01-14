import React from 'react';
import { Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-secondary/30 border border-border rounded-lg p-4 flex items-start gap-3 text-sm">
      <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <p className="text-muted-foreground">
        <strong className="text-foreground">Disclaimer:</strong> Streams are provided by third-party services. 
        We do not host or control the content. This platform only displays publicly available metadata 
        and serves as a content discovery index.
      </p>
    </div>
  );
}

export function FooterDisclaimer() {
  return (
    <p className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto">
      AniCrew is a content discovery platform. All media streams are provided by third-party services. 
      We do not host, upload, or distribute any video content. All metadata is sourced from publicly available APIs.
    </p>
  );
}
