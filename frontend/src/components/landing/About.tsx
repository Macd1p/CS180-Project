import Image from "next/image";

export default function About() {
  return (
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
  );
}
