import Link from "next/link";

export default function Page() {
  return (
    <>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Demo only — static data
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Find parking near your destination
            </h1>

            <p className="mb-6 max-w-prose text-gray-600">
              Browse garages and lots, compare prices and amenities, and pick
              what fits your trip.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/parking"
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-900"
              >
                Browse parking
              </Link>
              <Link
                href="/learn-more"
                className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Learn more
              </Link>
            </div>

            {/* Quick bullets */}
            <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
              <li>• Compare price/hour, distance & rating</li>
              <li>• Amenities: EV, covered, 24/7 (demo)</li>
              <li>• Clean, responsive UI</li>
              <li>• Map & real data coming later</li>
            </ul>
          </div>

          {/* Map/preview placeholder */}
          <div className="relative h-64 w-full rounded-3xl border border-gray-200 bg-white shadow md:h-[420px]">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-100" />
              ))}
            </div>
            <div className="absolute left-4 top-4 rounded-lg bg-black/85 px-2 py-1 text-xs text-white">
              Map preview (placeholder)
            </div>
          </div>
        </div>
      </section>

      {/* Mini “why us” section */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-2xl font-bold">Why FindMySpot?</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Search anywhere</h3>
            <p className="mt-1 text-sm text-gray-600">
              Start with a city or landmark and see nearby options.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Compare quickly</h3>
            <p className="mt-1 text-sm text-gray-600">
              Price/hour, distance and simple ratings at a glance.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Easy to extend</h3>
            <p className="mt-1 text-sm text-gray-600">
              Add map tiles, filters and real data when you’re ready.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
