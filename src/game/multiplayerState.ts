export interface PresenceSyncPlayer {
  id: string;
  name?: string;
  x: number;
  z: number;
  rot: number;
  updatedAt: number;
  seq?: number;
  presenceStamp?: number;
}

const PRESENCE_MISSING_GRACE_MS = 2500;

/**
 * Reconcile Supabase Presence snapshots with recent movement broadcasts.
 * A stale snapshot must not rewind a newer position or keep departed peers
 * visible forever.
 */
export function reconcilePresencePlayers<T extends PresenceSyncPlayer>(
  previousPlayers: T[],
  presenceState: Record<string, unknown[]>,
  selfId: string,
  now: number,
): T[] {
  const previousById = new Map(previousPlayers.map((player) => [player.id, player]));
  const nextById = new Map<string, T>();

  for (const [presenceKey, rawEntries] of Object.entries(presenceState)) {
    for (const rawEntry of rawEntries ?? []) {
      if (!rawEntry || typeof rawEntry !== "object") continue;
      const meta = rawEntry as Partial<T>;
      const id = typeof meta.id === "string" && meta.id ? meta.id : presenceKey;
      if (!id || id === selfId) continue;

      const previous = previousById.get(id);
      const receivedSeq = Number.isFinite(meta.seq) ? Number(meta.seq) : 0;
      if (previous && Number(previous.seq ?? 0) > receivedSeq) {
        nextById.set(id, previous);
        continue;
      }

      const x = Number.isFinite(meta.x) ? Number(meta.x) : (previous?.x ?? 0);
      const z = Number.isFinite(meta.z) ? Number(meta.z) : (previous?.z ?? 21);
      const rot = Number.isFinite(meta.rot) ? Number(meta.rot) : (previous?.rot ?? Math.PI);
      const sourceStamp = Number.isFinite(meta.updatedAt) ? Number(meta.updatedAt) : undefined;
      const stateChanged =
        !previous ||
        receivedSeq !== Number(previous.seq ?? 0) ||
        x !== previous.x ||
        z !== previous.z ||
        rot !== previous.rot ||
        sourceStamp !== previous.presenceStamp;

      if (previous && !stateChanged && now - previous.updatedAt > PRESENCE_MISSING_GRACE_MS) {
        continue;
      }

      nextById.set(id, {
        ...previous,
        ...meta,
        id,
        name: typeof meta.name === "string" && meta.name.trim() ? meta.name.slice(0, 24) : "Bạn học",
        x,
        z,
        rot,
        updatedAt: stateChanged ? now : previous.updatedAt,
        seq: receivedSeq,
        presenceStamp: sourceStamp,
      } as unknown as T);
    }
  }

  for (const previous of previousPlayers) {
    if (previous.id === selfId || nextById.has(previous.id)) continue;
    if (now - previous.updatedAt <= PRESENCE_MISSING_GRACE_MS) {
      nextById.set(previous.id, previous);
    }
  }

  return [...nextById.values()];
}
