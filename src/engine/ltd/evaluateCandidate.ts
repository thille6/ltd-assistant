import type { PrematchEvaluation, PrematchOdds } from '../../domain/match/types'
import { MODEL_VERSION, type ModelSettings } from '../../domain/settings/types'
import { toIsoNow } from '../../utils/dates'
import { clamp, roundTo, toPercent } from '../../utils/numbers'
import { normalizeOneXTwo, normalizeOverUnder } from '../odds/normalization'

export function calculateLtdScore(drawProbability: number, over25Probability: number, favoriteProbability: number): number {
  const drawComponent = clamp((0.4 - drawProbability) / 0.4, 0, 1)
  const overComponent = clamp(over25Probability / 0.56, 0, 1)
  const favoriteComponent = favoriteProbability < 0.58
    ? clamp(favoriteProbability / 0.58, 0, 1)
    : favoriteProbability > 0.8
      ? clamp(1 - (favoriteProbability - 0.8) / 0.2, 0, 1)
      : 1

  return roundTo((drawComponent * 0.4 + overComponent * 0.35 + favoriteComponent * 0.25) * 100, 2)
}

export function classifyCandidate(score: number): PrematchEvaluation['classification'] {
  if (score >= 80) {
    return 'strong'
  }

  if (score >= 70) {
    return 'possible'
  }

  if (score >= 60) {
    return 'watch'
  }

  return 'reject'
}

export function evaluatePrematch(odds: PrematchOdds, settings: ModelSettings): PrematchEvaluation {
  const oneXTwo = normalizeOneXTwo(odds)
  const overUnder = normalizeOverUnder(odds)
  const favoriteProbability = Math.max(oneXTwo.home, oneXTwo.away)
  const ltdScore = calculateLtdScore(oneXTwo.draw, overUnder.over25, favoriteProbability)
  const classification = classifyCandidate(ltdScore)

  const passedRules: string[] = []
  const failedRules: string[] = []
  const warnings: string[] = []

  if (oneXTwo.draw <= settings.maxDrawProbability) {
    passedRules.push(`Draw-sannolikheten ${toPercent(oneXTwo.draw)} ligger inom gränsen.`)
  } else {
    failedRules.push(`Draw-sannolikheten ${toPercent(oneXTwo.draw)} är högre än tillåtet.`)
  }

  if (overUnder.over25 >= settings.minOver25Probability) {
    passedRules.push(`Över 2,5-sannolikheten ${toPercent(overUnder.over25)} stödjer ett LTD-scenario.`)
  } else {
    failedRules.push(`Över 2,5-sannolikheten ${toPercent(overUnder.over25)} är för låg.`)
  }

  if (favoriteProbability >= settings.minFavoriteProbability && favoriteProbability <= settings.maxFavoriteProbability) {
    passedRules.push(`Favoritstyrkan ${toPercent(favoriteProbability)} ligger inom det önskade intervallet.`)
  } else {
    failedRules.push(`Favoritstyrkan ${toPercent(favoriteProbability)} ligger utanför det önskade intervallet.`)
  }

  if (oneXTwo.overround > 0.08 || overUnder.overround > 0.08) {
    warnings.push('Marknadsmarginalen är relativt hög, vilket kan göra analysen mindre robust.')
  }

  if (ltdScore < settings.minCandidateScore) {
    warnings.push('Matchen når inte minsta score för möjlig kandidat.')
  }

  const summary = classification === 'reject'
    ? 'Matchen bör avstås eftersom flera centrala prematchvillkor inte är uppfyllda.'
    : classification === 'watch'
      ? 'Matchen kan bevakas men når inte upp till tydlig kandidatnivå ännu.'
      : classification === 'possible'
        ? 'Matchen uppfyller grundkraven och är en möjlig LTD-kandidat.'
        : 'Matchen är en stark LTD-kandidat med tydligt stöd i prematchdatan.'

  return {
    oneXTwo,
    overUnder,
    favoriteProbability,
    ltdScore,
    classification,
    passedRules,
    failedRules,
    warnings,
    summary,
    modelVersion: MODEL_VERSION,
    evaluatedAt: toIsoNow(),
  }
}
