import Image from "next/image";

export default function HowItWorks() {
  return (
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
  );
}
