import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Ícone da tela inicial do iPhone (o iOS não aceita SVG). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#30D158',
          color: '#FFFFFF',
          fontSize: 128,
          fontWeight: 800,
        }}
      >
        $
      </div>
    ),
    size,
  );
}
