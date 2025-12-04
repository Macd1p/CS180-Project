import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full min-h-[80vh] overflow-hidden bg-black text-white"
    >
      {/* Background image - NO extra opacity */}
      <Image
        src="/images/hero-parking.jpg"
        alt="City street with parked cars"
        fill
        priority
        className="object-cover"
      />

      {/* Softer gradient overlay: dark on left for text, clear on right */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex max-w-6xl flex-col justify-center gap-6 px-4 py-20 md:py-28">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          The Social Network for Parking.
        </h1>
        <p className="max-w-xl text-base text-gray-200 md:text-lg">
          Join a community of drivers helping each other. Share real-time spots,
          connect with locals, and stop circling the block alone.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/parking"
            className="rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-green-400"
          >
            Browse Parking Post
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
