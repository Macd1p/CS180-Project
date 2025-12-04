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
            Powered by People, Not Sensors
          </h2>
          <p className="mb-3 text-sm text-gray-600 md:text-base">
            FindMySpot isn't just a map—it's a living network of drivers.
            Connect with spot hunters, build your reputation, and turn parking into a team sport.
          </p>
          <p className="mb-6 text-sm text-gray-600 md:text-base">
            Post available spots to earn community trust, discover hidden gems
            shared by locals, and help your neighbors save time.
          </p>

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
