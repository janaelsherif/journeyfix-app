"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";
import {
  getBasicPriceChfClient,
  getAdvancedPriceChfClient,
  getModuleAddonPriceChfClient,
  getBundleL2PlusOneModulePrices,
  getBundleL2PlusBothModulesPrices,
} from "@/lib/pricing";
import {
  NEXILON_COMP_ROWS,
  type FiveCell,
  type CompRow,
} from "@/lib/pricing-nexilon-comparison";
import nexilonDe from "@/lib/nexilon-pricing-de";
import nexilonEn from "@/lib/nexilon-pricing-en";
import type { Language } from "@/lib/translations";

/** All pricing CTAs → placeholder until Stripe checkout is integrated. */
const PRICING_PAYMENT_SOON_HREF = "/payment-soon" as const;

type NexilonPack = typeof nexilonDe;

function packFor(lang: Language): NexilonPack {
  return (lang === "en" ? nexilonEn : nexilonDe) as NexilonPack;
}

function tpl(s: string, vars: Record<string, string | number>) {
  let out = s;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}



function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width={13} height={13} viewBox="0 0 16 16" fill="none" aria-hidden>
      <polyline points="2 8 6 12 14 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} width={13} height={13} viewBox="0 0 16 16" fill="none" aria-hidden>
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CellIcon({ v }: { v: FiveCell }) {
  if (v === "n") return <IconX className="inline text-slate-300" />;
  const cls =
    v === "y" ? "inline text-emerald-600" : "inline text-slate-700";
  return <IconCheck className={cls} />;
}

function Pill({ variant, children }: { variant: "new" | "full"; children: React.ReactNode }) {
  return (
    <span
      className={
        variant === "new"
          ? "ml-1 inline-block rounded-full bg-emerald-50 px-1.5 py-px text-[10px] font-semibold tracking-wide text-emerald-800"
          : "ml-1 inline-block rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-slate-700"
      }
    >
      {children}
    </span>
  );
}

function FeatureLine({
  children,
  variant = "y",
}: {
  children: React.ReactNode;
  variant?: "y" | "n";
}) {
  return (
    <div className="flex gap-3 text-xs leading-snug">
      <div className="mt-px flex shrink-0 items-start justify-center">
        {variant === "n" ? <IconX className="text-slate-300" /> : <IconCheck className="text-emerald-600" />}
      </div>
      <span className={variant === "n" ? "text-slate-400" : "text-slate-600"}>{children}</span>
    </div>
  );
}

function FeatureLineMod({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-xs leading-snug">
      <div className="mt-px shrink-0">
        <IconCheck className="text-emerald-600" />
      </div>
      <span className="text-slate-600">{children}</span>
    </div>
  );
}

function CompTableRow({
  nx,
  row,
}: {
  nx: NexilonPack;
  row: CompRow;
}) {
  const rowsLabels = nx.comp.rows as Record<string, string>;

  if (row.kind === "group") {
    const title = nx.comp.groups[row.groupKey];
    return (
      <tr className="bg-slate-100">
        <td
          className="border-b border-slate-200 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"
          colSpan={6}
        >
          {title}
        </td>
      </tr>
    );
  }

  if (row.kind === "text5") {
    const vals =
      row.textKey === "pdfPages"
        ? nx.comp.pdfPages
        : row.textKey === "leadTimes"
          ? nx.comp.leadTimes
          : [];
    const label = rowsLabels[row.key];
    return (
      <tr className="border-b border-slate-200 hover:bg-slate-50/80">
        <td className="px-5 py-3 text-left text-sm text-slate-900">{label}</td>
        {vals.map((txt, i) => (
          <td key={i} className="px-5 py-3 text-center text-sm text-slate-800">
            {txt}
          </td>
        ))}
      </tr>
    );
  }

  const label = rowsLabels[row.key];

  if (row.kind === "five") {
    return (
      <tr className="border-b border-slate-200 hover:bg-slate-50/80">
        <td className="px-5 py-3 text-left text-sm text-slate-900">{label}</td>
        {row.cells.map((c, i) => (
          <td key={i} className="px-5 py-3 text-center text-slate-600">
            <CellIcon v={c} />
          </td>
        ))}
      </tr>
    );
  }

  if (row.kind === "dash3plus2") {
    return (
      <tr className="border-b border-slate-200 hover:bg-slate-50/80">
        <td className="px-5 py-3 text-left text-sm text-slate-900">{label}</td>
        <td colSpan={3} className="px-5 py-3 text-center text-sm text-slate-400">
          —
        </td>
        <td className="px-5 py-3 text-center">
          <CellIcon v={row.b} />
        </td>
        <td className="px-5 py-3 text-center">
          <CellIcon v={row.c} />
        </td>
      </tr>
    );
  }

  /* dash4plus1 */
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/80">
      <td className="px-5 py-3 text-left text-sm text-slate-900">{label}</td>
      <td colSpan={4} className="px-5 py-3 text-center text-sm text-slate-400">
        —
      </td>
      <td className="px-5 py-3 text-center">
        <CellIcon v={row.c} />
      </td>
    </tr>
  );
}

export default function PricingNexilonClient() {
  const { language, t } = useLanguage();
  const nx = packFor(language);
  const basicChf = getBasicPriceChfClient();
  const advancedChf = getAdvancedPriceChfClient();
  const modChf = getModuleAddonPriceChfClient();
  const b1 = getBundleL2PlusOneModulePrices(advancedChf, modChf);
  const b3 = getBundleL2PlusBothModulesPrices(advancedChf, modChf);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-slate-800">
            JourneyFix.ch
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Beta</span>
          </Link>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href={PRICING_PAYMENT_SOON_HREF} className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              {t.pricingNavScan}
            </Link>
            <Link
              href={PRICING_PAYMENT_SOON_HREF}
              className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:inline-flex"
            >
              {t.ctaStartAnalysis}
            </Link>
            <Link href="/" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              {t.pricingNavHome}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pb-16 pt-12 text-center md:pb-20 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-600">
            {nx.hero.tag}
          </div>
          <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {nx.hero.h1a}
            <br />
            <span className="text-slate-700">{nx.hero.h1bEm}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-slate-600">
            {nx.hero.sub}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            {nx.trust.map((line) => (
              <div key={line} className="flex items-center gap-2">
                <IconCheck className="shrink-0 text-emerald-600" />
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ladder */}
      <section className="px-4 pb-16" id="stufen">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.ladder.eye}</span>
            <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
              {nx.ladder.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:mx-0">{nx.ladder.desc}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Free */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="border-b border-slate-200 px-6 pb-6 pt-10">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.free.stufe}</div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.free.name}</div>
                <p className="min-h-[3.2em] text-xs leading-snug text-slate-600">{nx.free.desc}</p>
                <div className="mt-6">
                  <div className="text-3xl font-bold tracking-tight text-slate-900">{nx.free.price}</div>
                  <div className="mt-1 text-xs text-slate-400">{nx.free.period}</div>
                </div>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl border border-slate-300 bg-white py-3 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  {nx.free.cta}
                </Link>
              </div>
              <div className="px-6 pb-6 pt-6">
                <div className="mb-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.free.fgGet}
                  </div>
                  <div className="space-y-2">
                    <FeatureLine>{nx.free.li1}</FeatureLine>
                    <FeatureLine>{nx.free.li2}</FeatureLine>
                    <FeatureLine>{nx.free.li3}</FeatureLine>
                    <FeatureLine>{nx.free.li4}</FeatureLine>
                    <FeatureLine variant="n">{nx.free.liNo}</FeatureLine>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.free.fgDel}
                  </div>
                  <FeatureLine>{nx.free.delLi}</FeatureLine>
                </div>
              </div>
            </div>

            {/* Basic */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="border-b border-slate-200 px-6 pb-6 pt-10">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
                  {tpl(nx.basic.stufeTpl, { price: basicChf })}
                </div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.basic.name}</div>
                <p className="min-h-[3.2em] text-xs leading-snug text-slate-600">{nx.basic.desc}</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{basicChf}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.basic.periodMain}</div>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl border border-slate-300 bg-white py-3 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  {nx.basic.cta}
                </Link>
              </div>
              <div className="px-6 pb-6 pt-6">
                <div className="mb-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.basic.fgPlus}
                  </div>
                  <div className="space-y-2">
                    {nx.basic.bLi.map((line: string, i: number) => (
                      <FeatureLine key={i}>{line}</FeatureLine>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.basic.fgDel}
                  </div>
                  <FeatureLine>{nx.basic.delLi}</FeatureLine>
                </div>
              </div>
            </div>

            {/* Advanced — recommended */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-md transition hover:shadow-lg">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {nx.advanced.badge}
              </div>
              <div className="border-b border-slate-200 px-6 pb-6 pt-10">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
                  {tpl(nx.advanced.stufeTpl, { price: advancedChf })}
                </div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.advanced.name}</div>
                <p className="min-h-[3.2em] text-xs leading-snug text-slate-600">{nx.advanced.desc}</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{advancedChf}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.advanced.periodMain}</div>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {nx.advanced.cta}
                </Link>
              </div>
              <div className="px-6 pb-6 pt-6">
                <div className="mb-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.advanced.fgPlus}
                  </div>
                  <div className="space-y-2">
                    {nx.advanced.bLi.map((line: string, i: number) => (
                      <FeatureLine key={i}>
                        <>
                          <span className="font-medium text-slate-900">{line}</span>
                          {i === 0 && <Pill variant="full">{nx.advanced.pillFull}</Pill>}
                          {i === 3 && <Pill variant="new">{nx.advanced.pillNew}</Pill>}
                        </>
                      </FeatureLine>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.advanced.fgDel}
                  </div>
                  <FeatureLine>{nx.advanced.delLi}</FeatureLine>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-0 border-t border-slate-200" />

      {/* Modules B & C */}
      <section className="px-4 py-16" id="module">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
              {tpl(nx.modSection.eyeTpl, { price: modChf })}
            </span>
            <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
              {nx.modSection.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:mx-0">{nx.modSection.desc}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Mod B */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
                {nx.modB.badge}
              </div>
              <div className="border-b border-slate-200 px-6 pb-6 pt-6">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.modB.tier}</div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.modB.name}</div>
                <p className="text-xs leading-snug text-slate-600">{nx.modB.desc}</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{modChf}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.modB.periodSub}</div>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {nx.modB.cta}
                </Link>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.modB.fg1}
                  </div>
                  <div className="space-y-2">
                    {nx.modB.fg1li.map((x: string, i: number) => (
                      <FeatureLineMod key={i}>
                        {x.includes("Vollständig") || x.includes("Fully rewritten") ? (
                          <strong className="font-medium text-slate-900">{x}</strong>
                        ) : (
                          x
                        )}
                      </FeatureLineMod>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.modB.fg2}
                  </div>
                  <div className="space-y-2">
                    {nx.modB.fg2li.map((x: string, i: number) => (
                      <FeatureLineMod key={i}>
                        {x.includes("3–5") || x.includes("4–7") ? <strong className="font-medium text-slate-900">{x}</strong> : x}
                      </FeatureLineMod>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.modB.fgDel}
                  </div>
                  <FeatureLineMod>{nx.modB.fgDelli}</FeatureLineMod>
                </div>
              </div>
            </div>

            {/* Mod C */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
                {nx.modC.badge}
              </div>
              <div className="border-b border-slate-200 px-6 pb-6 pt-6">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.modC.tier}</div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.modC.name}</div>
                <p className="text-xs leading-snug text-slate-600">{nx.modC.desc}</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{modChf}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.modC.periodSub}</div>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {nx.modC.cta}
                </Link>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.modC.fg1}
                  </div>
                  <div className="space-y-2">
                    {nx.modC.fg1li.map((x: string, i: number) => (
                      <FeatureLineMod key={i}>
                        {x}
                      </FeatureLineMod>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.modC.fg2}
                  </div>
                  <div className="space-y-2">
                    {nx.modC.fg2li.map((x: string, i: number) => (
                      <FeatureLineMod key={i}>
                        {x.includes("5-teilige") ||
                        x.includes("Roadmap") ||
                        x.includes("«Massnahme") ||
                        x.includes("Swiss Mode") ? (
                          <strong className="font-medium text-slate-900">{x}</strong>
                        ) : (
                          x
                        )}
                      </FeatureLineMod>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.modC.fgDel}
                  </div>
                  <FeatureLineMod>{nx.modC.fgDelli}</FeatureLineMod>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-0 border-t border-slate-200" />

      {/* Bundles */}
      <section className="px-4 py-16" id="pakete">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
              {nx.bundleSection.eye}
            </span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
              {nx.bundleSection.titleLine1}
              <br />
              {nx.bundleSection.titleLine2}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:mx-0">{nx.bundleSection.desc}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Bundle 1 */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
                {nx.bundle1.badge}
              </div>
              <div className="border-b border-slate-200 px-6 pb-6 pt-6">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.bundle1.stufe}</div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.bundle1.name}</div>
                <p className="text-xs leading-snug text-slate-600">{nx.bundle1.desc}</p>
                <div className="mt-6 text-xs text-slate-400 line-through">{tpl(nx.bundle1.wasTpl, { price: b1.was })}</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{b1.now}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.bundle1.period}</div>
                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                  {tpl(nx.bundle1.saveTpl, { save: b1.save })}
                </span>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {nx.bundle1.cta}
                </Link>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.bundle1.fgInc}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nx.bundle1.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.bundle1.fgIdeal}
                  </div>
                  <div className="space-y-2">
                    {nx.bundle1.idealLi.map((line: string, i: number) => (
                      <FeatureLine key={i}>{line}</FeatureLine>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle 2 */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-700">
                {nx.bundle2.badge}
              </div>
              <div className="border-b border-slate-200 px-6 pb-6 pt-6">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.bundle2.stufe}</div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.bundle2.name}</div>
                <p className="text-xs leading-snug text-slate-600">{nx.bundle2.desc}</p>
                <div className="mt-6 text-xs text-slate-400 line-through">{tpl(nx.bundle2.wasTpl, { price: b1.was })}</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{b1.now}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.bundle2.period}</div>
                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                  {tpl(nx.bundle2.saveTpl, { save: b1.save })}
                </span>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {nx.bundle2.cta}
                </Link>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.bundle2.fgInc}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nx.bundle2.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.bundle2.fgIdeal}
                  </div>
                  <div className="space-y-2">
                    {nx.bundle2.idealLi.map((line: string, i: number) => (
                      <FeatureLine key={i}>{line}</FeatureLine>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle 3 — highlighted */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-md transition hover:shadow-lg">
              <div className="border-b border-slate-200 bg-slate-900 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
                {nx.bundle3.badge}
              </div>
              <div className="border-b border-slate-200 px-6 pb-6 pt-6">
                <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.bundle3.stufe}</div>
                <div className="mb-3 text-xl font-semibold text-slate-900">{nx.bundle3.name}</div>
                <p className="text-xs leading-snug text-slate-600">{nx.bundle3.desc}</p>
                <div className="mt-6 text-xs text-slate-400 line-through">{tpl(nx.bundle3.wasTpl, { price: b3.was })}</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2 leading-none">
                  <span className="text-sm font-medium text-slate-500">CHF</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-900">{b3.now}.–</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{nx.bundle3.period}</div>
                <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                  {tpl(nx.bundle3.saveTpl, { save: b3.save })}
                </span>
                <Link
                  href={PRICING_PAYMENT_SOON_HREF}
                  className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {nx.bundle3.cta}
                </Link>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.bundle3.fgInc}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nx.bundle3.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 after:h-px after:flex-1 after:bg-slate-200">
                    {nx.bundle3.fgIdeal}
                  </div>
                  <div className="space-y-2">
                    {nx.bundle3.idealLi.map((line: string, i: number) => (
                      <FeatureLine key={i}>{line}</FeatureLine>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-0 border-t border-slate-200" />

      {/* Comparison */}
      <section className="px-4 py-16" id="vergleich">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center md:text-left">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">{nx.comp.eye}</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{nx.comp.title}</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[920px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="min-w-[200px] bg-slate-800 px-5 py-4 text-left font-semibold text-slate-100" />
                  <th className="bg-slate-800 px-3 py-4 text-center font-semibold leading-tight text-slate-100">
                    {nx.comp.thFree}
                    <span className="mt-1 block text-sm font-bold text-white">{nx.comp.thFreePrice}</span>
                  </th>
                  <th className="bg-slate-800 px-3 py-4 text-center font-semibold leading-tight text-slate-100">
                    {nx.comp.thBasicTpl}
                    <span className="mt-1 block text-sm font-bold text-white">
                      {tpl(nx.comp.thBasicPriceTpl, { price: basicChf })}
                    </span>
                  </th>
                  <th className="bg-slate-800 px-3 py-4 text-center font-semibold leading-tight text-slate-100">
                    {nx.comp.thAdvTpl}
                    <span className="mt-1 block text-sm font-bold text-white">
                      {tpl(nx.comp.thAdvPriceTpl, { price: advancedChf })}
                    </span>
                  </th>
                  <th className="bg-slate-800 px-3 py-4 text-center font-semibold leading-tight text-slate-100">
                    {nx.comp.thModB}
                    <span className="mt-1 block text-sm font-bold text-white">{tpl(nx.comp.thModBTpl, { price: modChf })}</span>
                  </th>
                  <th className="bg-slate-800 px-3 py-4 text-center font-semibold leading-tight text-slate-100">
                    {nx.comp.thModC}
                    <span className="mt-1 block text-sm font-bold text-white">{tpl(nx.comp.thModCTpl, { price: modChf })}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {NEXILON_COMP_ROWS.map((row, i) => (
                  <CompTableRow key={`comp-${i}`} nx={nx} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className="border-0 border-t border-slate-200" />

      {/* Info */}
      <section className="px-4 py-16" id="hinweise">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
          {nx.info.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 text-xl" aria-hidden>
                {card.ico}
              </div>
              <div className="mb-2 text-sm font-semibold text-slate-900">{card.title}</div>
              <p className="text-xs leading-relaxed text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <EmailCaptureWidget source="journeyfix_pricing" variant="panel" />

      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
        <div className="mx-auto max-w-6xl">
          <p>{nx.foot}</p>
          <p className="mt-3">
            <Link href={PRICING_PAYMENT_SOON_HREF} className="font-semibold text-slate-900 hover:underline">
              {t.pricingStartAnalysis}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
