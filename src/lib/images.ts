export const ASSET_HERO = '/images/hero_jewellery_model_1794034444574.jpg';
export const ASSET_EARRINGS = '/images/cat_earrings_showcase_1794034445053.jpg';
export const ASSET_NECKLACES = '/images/cat_necklaces_showcase_1794034445747.jpg';
export const ASSET_BRACELETS = '/images/cat_bracelets_showcase_1794034446075.jpg';
export const ASSET_CAMPAIGN = '/images/campaign_editorial_banner_1794034446542.jpg';

export const HERO_SIZES = '(min-width: 1280px) 584px, (min-width: 1024px) calc(50vw - 56px), (min-width: 544px) 512px, calc(100vw - 32px)';

const imageDimensions = new Map([
  [ASSET_HERO, { width: 1376, height: 768 }],
  [ASSET_CAMPAIGN, { width: 1376, height: 768 }],
  [ASSET_EARRINGS, { width: 1024, height: 1024 }],
  [ASSET_NECKLACES, { width: 1024, height: 1024 }],
  [ASSET_BRACELETS, { width: 1024, height: 1024 }],
]);

export function getImageSource(src?: string) {
  if (!src) return { src: undefined, dimensions: undefined };
  const localSrc = src.replace(/^\/src\/assets\/images\//, '/images/');
  const dimensions = imageDimensions.get(localSrc);
  return dimensions ? { src: localSrc, dimensions } : { src, dimensions };
}

function imageCdnUrl(src: string, width: number) {
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=avif&q=80`;
}

export function responsiveImage(src: string, thumbnail = false) {
  const widths = thumbnail ? [160, 400, 800, 1200] : [400, 800, 1200];
  return {
    src: imageCdnUrl(src, thumbnail ? 160 : 800),
    srcSet: widths.map(width => `${imageCdnUrl(src, width)} ${width}w`).join(', '),
  };
}
