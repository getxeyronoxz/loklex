import Image from "next/image";

/* The firm's own emblem, used exactly as supplied — nothing recreated,
   nothing added. The square asset carries its own field, so it is cropped
   to the emblem circle. */

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/loklex-logo.png"
      alt="Loklex — Lokeswaraiah Legal Associates LLP"
      width={size}
      height={size}
      priority
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
