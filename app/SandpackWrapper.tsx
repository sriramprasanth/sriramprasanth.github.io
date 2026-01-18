'use client';

import dynamic from 'next/dynamic';

const SandpackDemo = dynamic(() => import('./SandpackDemo'), {
  ssr: false,
});

export default function SandpackWrapper({ files, template }: { files: any, template: any }) {
  return <SandpackDemo files={files} template={template} />;
}
