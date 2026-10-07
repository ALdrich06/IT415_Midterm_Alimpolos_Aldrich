import Image from "next/image";

export default function KioskBrand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/kiosk/kiosk-logo.png"
        alt=""
        width={1280}
        height={1280}
        sizes={compact ? "48px" : "(max-width: 639px) 64px, 80px"}
        className={compact ? "h-12 w-12 object-contain" : "h-16 w-16 object-contain sm:h-20 sm:w-20"}
        priority
      />
      <div>
        {compact ? (
          <p className="text-sm font-bold tracking-wide text-maroon-700">Brew &amp; Bite</p>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-maroon-900">Brew &amp; Bite Kiosk</h1>
            <p className="text-maroon-700/80">Tap a product to add it to your order.</p>
          </>
        )}
      </div>
    </div>
  );
}
