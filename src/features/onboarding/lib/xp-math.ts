import {
  PLAYER_CLASS_FALLBACK,
  type PlayerClassMeta,
} from "@/features/profile/lib/player-class";

/**
 * Level thresholds returned by /xp/config.
 * levelThresholds[i] = XP required to reach level i+1.
 */
export type LevelConfig = {
  levelThresholds: number[];
};

/**
 * Full XP math config: level thresholds + player classes.
 */
export type XpConfig = LevelConfig & {
  playerClasses: PlayerClassMeta[];
};

export type RevealSegment = {
  targetClass: PlayerClassMeta;
  fromXp: number;
  toXp: number;
  pauseAfter: boolean;
};

export type XpMath = ReturnType<typeof createXpMath>;

export function createXpMath(config: XpConfig) {
  const t = config.levelThresholds;

  function xpForLevel(n: number): number {
    return t[n - 1] ?? 0;
  }

  function getLevel(xp: number): number {
    let level = 1;
    for (let i = 0; i < t.length; i++) {
      if (t[i] <= xp) level = i + 1;
      else break;
    }
    return level;
  }

  function getXpProgress(xp: number): {
    level: number;
    xpInLevel: number;
    xpNeeded: number;
    percent: number;
  } {
    const level = getLevel(xp);
    const xpFloor = level === 1 ? 0 : xpForLevel(level);
    const xpNext = xpForLevel(level + 1);
    const span = xpNext - xpFloor;
    const xpInLevel = xp - xpFloor;
    const percent =
      span <= 0
        ? 100
        : Math.max(0, Math.min(100, Math.round((xpInLevel / span) * 100)));
    return { level, xpInLevel, xpNeeded: span, percent };
  }

  function getPlayerClassForLevel(level: number): PlayerClassMeta {
    let current = config.playerClasses[0] ?? PLAYER_CLASS_FALLBACK;
    for (const cls of config.playerClasses) {
      if (level >= cls.requiredLevel) current = cls;
    }
    return current;
  }

  function buildRevealSegments(targetXp: number, startXp = 0): RevealSegment[] {
    if (targetXp <= startXp) return [];

    const finalLevel = getLevel(targetXp);
    const finalClass = getPlayerClassForLevel(finalLevel);

    const passedTiers = config.playerClasses.filter(
      (c) => c.requiredLevel <= finalLevel && c.slug !== finalClass.slug,
    );

    const segments: RevealSegment[] = [];
    let fromXp = startXp;

    for (const cls of passedTiers) {
      const nextTier = config.playerClasses.find((c) => c.tier === cls.tier + 1);
      const toXp = nextTier ? xpForLevel(nextTier.requiredLevel) : targetXp;
      // Skip tier if the user already passed it before this sync
      if (toXp <= startXp) continue;
      segments.push({ targetClass: cls, fromXp, toXp, pauseAfter: true });
      fromXp = toXp;
    }

    if (fromXp < targetXp || segments.length === 0) {
      segments.push({ targetClass: finalClass, fromXp, toXp: targetXp, pauseAfter: false });
    }

    return segments;
  }

  function getSegmentBarProgress(
    segment: RevealSegment,
    animatedXp: number,
  ): {
    level: number;
    xpInLevel: number;
    xpNeeded: number;
    percent: number;
  } {
    const span = segment.toXp - segment.fromXp;
    const xpInLevel = Math.max(0, Math.min(span, animatedXp - segment.fromXp));
    const percent = span <= 0 ? 100 : Math.round((xpInLevel / span) * 100);

    return {
      level: segment.pauseAfter
        ? segment.targetClass.requiredLevel
        : getLevel(Math.max(segment.fromXp, animatedXp)),
      xpInLevel,
      xpNeeded: span,
      percent: Math.min(100, Math.max(0, percent)),
    };
  }

  return {
    getLevel,
    getXpProgress,
    getPlayerClassForLevel,
    buildRevealSegments,
    getSegmentBarProgress,
  };
}
