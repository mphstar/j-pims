import type { CSSProperties } from 'react';
// Centralized overlay positioning and sizing logic to match admin preview (OverlayAligned)
export type OverlayInput = {
  position_horizontal: 'left' | 'center' | 'right' | null;
  position_vertical: 'top' | 'center' | 'bottom' | null;
  object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
  width?: number | null;
  height?: number | null;
};

export type OverlayComputed = {
  containerStyle: CSSProperties;
  imgStyle: CSSProperties;
  containerClass: string;
};

export function computeOverlayLayout(overlay: OverlayInput): OverlayComputed {
  const stylePos: CSSProperties = {};
  let translateX = '0';
  let translateY = '0';

  // Horizontal
  if (overlay.position_horizontal === 'left') {
    (stylePos as any).left = '0';
    (stylePos as any).right = 'auto';
  } else if (overlay.position_horizontal === 'right') {
    (stylePos as any).right = '0';
    (stylePos as any).left = 'auto';
  } else if (overlay.position_horizontal === 'center' || overlay.position_horizontal == null) {
    (stylePos as any).left = '50%';
    (stylePos as any).right = 'auto';
    translateX = '-50%';
  }

  // Vertical
  if (overlay.position_vertical === 'top' || overlay.position_vertical == null) {
    (stylePos as any).top = '0';
    (stylePos as any).bottom = 'auto';
  } else if (overlay.position_vertical === 'bottom') {
    (stylePos as any).bottom = '0';
    (stylePos as any).top = 'auto';
  } else if (overlay.position_vertical === 'center') {
    (stylePos as any).top = '50%';
    (stylePos as any).bottom = 'auto';
    translateY = '-50%';
  }

  // Size (match admin preview): width can be 0..1 => %, 1..100 => %, >100 => px
  if (overlay.width != null) {
    const w = overlay.width as number;
    if (w > 0 && w <= 1) {
      (stylePos as any).width = `${w * 100}%`;
    } else if (w > 0 && w <= 100) {
      (stylePos as any).width = `${w}%`;
    } else if (w > 0) {
      (stylePos as any).width = `${w}px`;
    }
  }
  if (overlay.height != null && (overlay.height as number) > 0) {
    (stylePos as any).height = `${overlay.height}px`;
  }

  const containerClass = overlay.width || overlay.height ? '' : 'max-w-[240px] max-h-[240px]';

  const fit = overlay.object_fit === 'crop' ? 'cover' : (overlay.object_fit ?? 'contain');
  const widthSet = overlay.width != null && (overlay.width as number) > 0;
  const heightSet = overlay.height != null && (overlay.height as number) > 0;
  const imgStyle: CSSProperties = {
    objectFit: fit,
    width: widthSet ? '100%' : (heightSet ? 'auto' : '100%'),
    height: heightSet ? '100%' : 'auto'
  };

  return {
    containerStyle: { position: 'absolute', transform: `translate(${translateX}, ${translateY})`, ...stylePos },
    imgStyle,
    containerClass,
  };
}
