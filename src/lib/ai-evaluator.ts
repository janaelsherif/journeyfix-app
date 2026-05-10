/**
 * AI-powered evaluation engine
 * Uses Anthropic Claude for use case evaluation, status-shift analysis, and 5-angle enhancement
 */

import Anthropic from "@anthropic-ai/sdk";
import { buildUseCaseEvaluationPrompt, buildStatusShiftAnalysisPrompt, buildFiveAngleAnalysisPrompt } from "./prompts";
import { buildCritiqueAnalysisPrompt } from "./critique-prompt";

export interface UseCaseEvaluation {
  useCaseId: string;
  useCaseName: string;
  completionPossible: boolean;
  timeToCompleteSeconds: number;
  clickDepth: number;
  frictionPoints: string[];
  severity: "critical" | "high" | "medium" | "low";
  conversionImpact: "high" | "medium" | "low";
  score: number;
  evidence: string;
  briefRemedy: string;
  detailedRemedy?: string;
}

export interface CrawlResult {
  url: string;
  text: string;
  metadata: { h1Tags: string[]; h2Tags: string[]; wordCount: number };
  contact: { phoneNumbers: string[]; emails: string[]; hasContactForm: boolean; hasMap: boolean };
  performance: { loadTimeMs?: number; hasHttps: boolean };
  structure: { hasBookingButton: boolean; hasPrivacyPolicy: boolean };
}

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export async function evaluateUseCase(
  useCaseId: string,
  useCaseName: string,
  profession: string,
  canton: string,
  crawlData: CrawlResult,
  lang: "de" | "en" = "de"
): Promise<UseCaseEvaluation> {
  const client = getAnthropicClient();
  if (!client) {
    // Return mock data when no API key
    return {
      useCaseId,
      useCaseName,
      completionPossible: true,
      timeToCompleteSeconds: 5,
      clickDepth: 1,
      frictionPoints: [],
      severity: "medium",
      conversionImpact: "medium",
      score: 75,
      evidence: "API key not configured - using placeholder",
      briefRemedy: "Configure ANTHROPIC_API_KEY for full analysis",
    };
  }

  const crawledData = JSON.stringify(
    {
      text: crawlData.text.substring(0, 4000),
      contact: crawlData.contact,
      structure: crawlData.structure,
      metadata: crawlData.metadata,
    },
    null,
    2
  );

  const prompt = buildUseCaseEvaluationPrompt(
    useCaseName,
    profession,
    canton,
    crawledData,
    lang
  );

  const runEvaluation = async (): Promise<UseCaseEvaluation> => {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1536,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in response");
    }

    // Parse JSON from response (handle markdown code blocks, text before/after)
    let jsonStr = textContent.text;
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const braceStart = jsonStr.indexOf("{");
      if (braceStart >= 0) {
        let depth = 0;
        let end = -1;
        for (let i = braceStart; i < jsonStr.length; i++) {
          if (jsonStr[i] === "{") depth++;
          else if (jsonStr[i] === "}") {
            depth--;
            if (depth === 0) {
              end = i + 1;
              break;
            }
          }
        }
        if (end > 0) jsonStr = jsonStr.slice(braceStart, end);
      }
    }
    jsonStr = jsonStr.trim().replace(/,\s*([}\]])/g, "$1");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON parse failed for use case", useCaseId, "raw preview:", jsonStr.slice(0, 500));
      throw parseErr instanceof Error ? parseErr : new Error("Invalid JSON in response");
    }

    return {
      useCaseId,
      useCaseName,
      completionPossible: parsed.completion_possible === true || parsed.completion_possible === false ? parsed.completion_possible : true,
      timeToCompleteSeconds: typeof parsed.time_to_complete_seconds === "number" ? parsed.time_to_complete_seconds : 0,
      clickDepth: typeof parsed.click_depth === "number" ? parsed.click_depth : 0,
      frictionPoints: Array.isArray(parsed.friction_points) ? (parsed.friction_points as string[]) : [],
      severity: (["critical", "high", "medium", "low"].includes(String(parsed.severity)) ? String(parsed.severity) : "medium") as UseCaseEvaluation["severity"],
      conversionImpact: (["high", "medium", "low"].includes(String(parsed.conversion_impact)) ? String(parsed.conversion_impact) : "medium") as UseCaseEvaluation["conversionImpact"],
      score: Math.min(100, Math.max(0, typeof parsed.score === "number" ? parsed.score : 75)),
      evidence: typeof parsed.evidence === "string" ? parsed.evidence : "",
      briefRemedy: typeof parsed.brief_remedy === "string" ? parsed.brief_remedy : "",
      detailedRemedy: typeof parsed.detailed_remedy === "string" ? parsed.detailed_remedy : undefined,
    };
  };

  const fallbackRemedy = lang === "de" ? "Diese Bewertung konnte nicht abgeschlossen werden. Bitte starten Sie eine neue Pruefung." : "This evaluation could not be completed. Please run a new scan.";

  try {
    return await runEvaluation();
  } catch (error) {
    console.error("AI evaluation error for", useCaseId, useCaseName, error);
    try {
      return await runEvaluation();
    } catch (retryError) {
      console.error("AI evaluation retry failed for", useCaseId, retryError);
      return {
        useCaseId,
        useCaseName,
        completionPossible: true,
        timeToCompleteSeconds: 0,
        clickDepth: 0,
        frictionPoints: [lang === "de" ? "Analyse fehlgeschlagen" : "Analysis failed"],
        severity: "medium",
        conversionImpact: "medium",
        score: 50,
        evidence: lang === "de" ? "Bewertung konnte nicht durchgefuehrt werden." : "Evaluation could not be completed.",
        briefRemedy: fallbackRemedy,
      };
    }
  }
}

export async function runStatusShiftAnalysis(
  pageText: string,
  practiceType?: string,
  region?: string,
  pageType?: string,
  lang: "de" | "en" = "de"
): Promise<string> {
  const client = getAnthropicClient();
  if (!client) {
    return "## Status-Shift Analysis\n\nConfigure ANTHROPIC_API_KEY to enable copy analysis.";
  }

  const prompt = buildStatusShiftAnalysisPrompt(pageText, practiceType, region, pageType, lang);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1536,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent && textContent.type === "text" ? textContent.text : "";
}

export async function runFiveAngleAnalysis(
  pageText: string,
  practiceType?: string,
  region?: string,
  pageType?: string,
  lang: "de" | "en" = "de"
): Promise<string> {
  const client = getAnthropicClient();
  if (!client) {
    return "## 5-Angle Analysis\n\nConfigure ANTHROPIC_API_KEY to enable conversion enhancement analysis.";
  }

  const prompt = buildFiveAngleAnalysisPrompt(pageText, practiceType, region, pageType, lang);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1536,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent && textContent.type === "text" ? textContent.text : "";
}

/** No extra API call — keeps free scans under ~1 min. */
export function buildFreeScanCritiqueStub(
  evaluations: UseCaseEvaluation[],
  lang: "de" | "en",
  websiteUrl: string
): string {
  const avg =
    evaluations.length > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length)
      : 0;
  const lowest = [...evaluations].sort((a, b) => a.score - b.score)[0];
  if (lang === "en") {
    return [
      "## Strategy snapshot",
      "",
      `Average journey score across checked scenarios: **${avg}/100**.`,
      lowest
        ? `Weakest area: **${lowest.useCaseName}** (${lowest.score}/100).`
        : "",
      `Site: ${websiteUrl}`,
      "",
      "_Full strategic critique is abbreviated in fast mode; use the sections above for priorities._",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    "## Strategie (Kurz)",
    "",
    `Durchschnittlicher Journey-Score (geprüfte Szenarien): **${avg}/100**.`,
    lowest
      ? `Schwächster Bereich: **${lowest.useCaseName}** (${lowest.score}/100).`
      : "",
    `Website: ${websiteUrl}`,
    "",
    "_Im Schnellmodus gekürzt; Details siehe Use Cases und Analysen oben._",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function runCritiqueAnalysis(params: {
  websiteUrl: string;
  profession: string;
  canton: string;
  city?: string;
  pageText: string;
  useCaseResults: UseCaseEvaluation[];
  statusShiftAnalysis: string;
  fiveAngleAnalysis: string;
  lang?: "de" | "en";
}): Promise<string> {
  const client = getAnthropicClient();
  if (!client) {
    return "## Kritik & Massnahmenplan\n\nKonfigurieren Sie ANTHROPIC_API_KEY für die strategische Gesamtanalyse.";
  }

  const useCaseSummary = params.useCaseResults
    .map((r) => `${r.useCaseName}: ${r.score}/100 (${r.severity})`)
    .join("; ");
  const statusShiftSummary = params.statusShiftAnalysis.substring(0, 800);
  const fiveAngleSummary = params.fiveAngleAnalysis.substring(0, 800);

  const professionLabels: Record<string, string> = {
    DENTIST: "Zahnarztpraxis",
    LAWYER: "Anwaltskanzlei",
    VET: "Tierarztpraxis",
    TAX_ADVISOR: "Steuerberatung / Treuhand",
    PHYSIOTHERAPIST: "Physiotherapiepraxis",
    DOCTOR_GENERAL: "Arztpraxis (Allgemeinmedizin)",
    PSYCHOLOGIST: "Psychologiepraxis",
    ACCOUNTANT: "Buchhaltung / Treuhand",
    OTHER: "Fachpraxis / Dienstleister",
  };
  const businessType = professionLabels[params.profession] || params.profession;

  const prompt = buildCritiqueAnalysisPrompt({
    websiteUrl: params.websiteUrl,
    marketRegion: `${params.city ? params.city + ", " : ""}${params.canton}, Schweiz`,
    siteLanguage: params.lang === "en" ? "English" : "Deutsch (Standard), Schweizer Hochdeutsch",
    businessType,
    pageText: params.pageText.substring(0, 6000),
    useCaseSummary: useCaseSummary || (params.lang === "en" ? "No data" : "Keine Daten"),
    statusShiftSummary: statusShiftSummary || (params.lang === "en" ? "No data" : "Keine Daten"),
    fiveAngleSummary: fiveAngleSummary || (params.lang === "en" ? "No data" : "Keine Daten"),
    outputLang: params.lang ?? "de",
  });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8192,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent && textContent.type === "text" ? textContent.text : "";
}
