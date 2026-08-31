"use client";

export function PublicArt({
  src,
  fallbackSrc,
  alt,
  className,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  return (
    // Static public art; PNG is primary, SVG/icon are fallbacks when GitHub has no binary.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={(event) => {
        const current = event.currentTarget.getAttribute("src");
        if (current === "/icon.svg") {
          return;
        }
        if (current === fallbackSrc) {
          event.currentTarget.src = "/icon.svg";
          return;
        }
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
