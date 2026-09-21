import Link from "next/link";

export const metadata = {
  title: "Give — Brainerd Baptist Church",
  description:
    "Give generously to Brainerd Baptist Church. Your gifts fund gospel ministry locally and around the world.",
};

const FUNDS = [
  {
    name: "General Fund",
    desc: "Supports the week-to-week ministry of Brainerd Baptist — worship, discipleship, staff, and facilities.",
    primary: true,
  },
  {
    name: "Missions Fund",
    desc: "Directly supports our global and local missionary partners and church-planting efforts.",
    primary: false,
  },
  {
    name: "Building Fund",
    desc: "Designated gifts toward future facility needs and improvements.",
    primary: false,
  },
];

export default function GivePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Generosity</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-800 text-fg mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Give
          </h1>
          <p className="font-serif italic text-fg-muted text-lg leading-relaxed max-w-xl mx-auto">
            &ldquo;Each one must give as he has decided in his heart, not reluctantly or under compulsion,
            for God loves a cheerful giver.&rdquo;
          </p>
          <p className="text-fg-muted text-xs mt-2 tracking-wide">— 2 Corinthians 9:7</p>
        </div>
      </div>

      {/* Giving options */}
      <section className="pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-condensed font-800 text-fg text-2xl mb-6">Ways to Give</h2>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {FUNDS.map((f) => (
              <div
                key={f.name}
                className={`glass rounded-2xl p-6 ${f.primary ? "border border-brand-cyan/30" : ""}`}
              >
                {f.primary && (
                  <p className="eyebrow mb-2 text-xs">Primary</p>
                )}
                <h3 className="font-condensed font-800 text-fg text-xl mb-2">{f.name}</h3>
                <p className="text-fg-muted text-sm leading-relaxed mb-5">{f.desc}</p>
                <a
                  href="https://app.securegive.com/brainerdbaptist/auth/login/sms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center font-condensed font-700 tracking-wide uppercase text-sm py-2.5 rounded-full transition-colors ${
                    f.primary
                      ? "bg-brand-cyan hover:bg-brand-cyan-light text-brand-navy"
                      : "border border-white/20 hover:border-white/40 text-fg glass"
                  }`}
                >
                  Give Online
                </a>
              </div>
            ))}
          </div>

          {/* Other methods */}
          <div className="glass-md rounded-2xl p-8">
            <h3 className="font-condensed font-800 text-fg text-xl mb-5">Other Ways to Give</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="font-semibold text-fg mb-1">In Person</p>
                <p className="text-fg-muted text-sm">
                  Offering plates are passed during each Sunday service. Checks can be made payable to
                  &ldquo;Brainerd Baptist Church.&rdquo;
                </p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="font-semibold text-fg mb-1">Mail a Check</p>
                <p className="text-fg-muted text-sm">
                  300 Brookfield Ave<br />Chattanooga, TN 37411
                </p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="font-semibold text-fg mb-1">Recurring Gifts</p>
                <p className="text-fg-muted text-sm">
                  Set up automatic giving through our online portal — weekly, bi-weekly, or monthly.
                </p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="font-semibold text-fg mb-1">Stock & Non-Cash</p>
                <p className="text-fg-muted text-sm">
                  For gifts of stock, real estate, or other non-cash assets, please{" "}
                  <Link href="/connect" className="text-accent-text hover:underline underline underline-offset-2">
                    contact us
                  </Link>{" "}
                  directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stewardship note */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-fg-muted text-sm leading-relaxed">
            Brainerd Baptist Church is a 501(c)(3) nonprofit organization. All gifts are
            tax-deductible to the extent permitted by law. Annual giving statements are
            available through our online portal.
          </p>
        </div>
      </section>
    </div>
  );
}
