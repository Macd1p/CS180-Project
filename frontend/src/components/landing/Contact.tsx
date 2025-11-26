export default function Contact() {
  return (
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
  );
}
