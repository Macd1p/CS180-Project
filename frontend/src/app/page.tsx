// app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <>
      {/* HERO */}
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
            Find your perfect spot.
          </h1>
          <p className="max-w-xl text-base text-gray-200 md:text-lg">
            Easily share and find parking availability in real-time with a
            community-driven platform built for busy campuses and cities.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/parking"
              className="rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-green-400"
            >
              Browse parking
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

      {/* ABOUT */}
      <section id="about" className="bg-white">
        <div className="mx-auto max-w-6xl grid gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          {/* Left: text */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-green-600">
              PARKING MADE EASY
            </p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Find your perfect spot effortlessly
            </h2>
            <p className="mb-3 text-sm text-gray-600 md:text-base">
              FindMySpot connects drivers with real-time, community-sourced
              parking spots near campuses, events, and busy streets.
            </p>
            <p className="mb-6 text-sm text-gray-600 md:text-base">
              Post available spots with photos and details, discover hidden gems
              shared by others, and cut down on circling the block. Our simple
              interface makes it fast to share, search, and park.
            </p>
            <a
              href="#contact"
              className="text-sm font-semibold text-green-700 underline-offset-4 hover:underline"
            >
              Get in touch
            </a>
          </div>

          {/* Right: nicely sized image */}
          <div className="flex justify-center">
            <Image
              src="/images/find-my-spot-about.jpg"
              alt="Row of parked cars along a city street"
              width={520}
              height={340}
              className="w-full max-w-md rounded-3xl object-cover shadow"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="w-full border-t bg-gray-50 py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-green-600">
            FIND YOUR PERFECT SPOT
          </p>
          <h2 className="mb-8 text-3xl font-bold md:text-4xl">
            Easily share and discover parking
          </h2>

          {/* narrower grid so cards don't stretch full width */}
          <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-2">
            {/* CARD COMPONENT PATTERN */}
            <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/images/how-step1.jpg"
                  alt="Sign up screen on a laptop"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-5 pb-5 pt-4">
                <h3 className="text-base font-semibold">
                  Step 1: Create your account
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Sign up in seconds to start sharing or browsing parking spots
                  in your area.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/images/how-step2.jpg"
                  alt="Person taking a photo of a parking spot"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-5 pb-5 pt-4">
                <h3 className="text-base font-semibold">
                  Step 2: Post your parking spot
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Snap a photo, set time & details, and share your spot with the
                  community.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/images/how-step3.jpg"
                  alt="Parking map and filters interface"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-5 pb-5 pt-4">
                <h3 className="text-base font-semibold">
                  Step 3: Search & filter
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Filter by distance, price, and amenities to instantly find the
                  right spot.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/images/how-step4.jpg"
                  alt="Friends using a parking app together"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-5 pb-5 pt-4">
                <h3 className="text-base font-semibold">
                  Step 4: Engage with the community
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Rate spots, follow trusted posters, and help others spend less
                  time circling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT (form only, no map) */}
      <section id="contact" className="bg-white py-16 md:py-24 border-t">
        <div className="mx-auto max-w-4xl px-4">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-green-600">
            GET IN TOUCH
          </p>
          <h2 className="mb-2 text-3xl font-bold">
            Contact the Team
          </h2>
          <p className="mb-8 text-sm text-gray-600 md:text-base">
            Have feedback, want to test the app, or interested in collaborating?
            Drop us a message and we&apos;ll get back to you.
          </p>

          <form className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="email@website.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Message
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Tell us how you imagine using FindMySpot..."
                required
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <input
                id="consent"
                type="checkbox"
                className="h-3 w-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                required
              />
              <label htmlFor="consent">
                I allow this website to store my submission so the team can
                respond to my inquiry.
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-fit items-center justify-center rounded-md bg-green-500 px-6 py-2.5 text-xs font-semibold text-gray-900 shadow hover:bg-green-400"
            >
              Submit
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
