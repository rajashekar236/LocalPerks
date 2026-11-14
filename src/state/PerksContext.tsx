import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Reward } from '../data/rewards';
import { pointsFor, type Receipt } from '../lib/receipt';

export type Activity =
  | { kind: 'earn'; id: string; date: number; businessId: string; businessName: string; amount: number; points: number }
  | { kind: 'redeem'; id: string; date: number; rewardId: string; title: string; points: number; code: string };

type PerksState = { balance: number; activity: Activity[]; seenReceipts: string[] };

const STORAGE_KEY = 'localperks/state/v1';
const WELCOME_BONUS = 100;

const initialState: PerksState = {
  balance: WELCOME_BONUS,
  activity: [],
  seenReceipts: [],
};

export type EarnResult = { ok: true; points: number } | { ok: false; error: string };
export type RedeemResult = { ok: true; code: string } | { ok: false; error: string };

type PerksContextValue = {
  ready: boolean;
  balance: number;
  activity: Activity[];
  lifetimePoints: number;
  earn: (receipt: Receipt) => EarnResult;
  redeem: (reward: Reward) => RedeemResult;
  reset: () => void;
};

const PerksContext = createContext<PerksContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function PerksProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PerksState>(initialState);
  const [ready, setReady] = useState(false);
  // Mirror of state so earn/redeem can validate synchronously and return a result.
  const stateRef = useRef(state);

  const commit = useCallback((next: PerksState) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Persistence is best-effort; the in-memory state stays correct.
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const saved = JSON.parse(raw) as PerksState;
        stateRef.current = saved;
        setState(saved);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const earn = useCallback(
    (receipt: Receipt): EarnResult => {
      const current = stateRef.current;
      if (current.seenReceipts.includes(receipt.receiptId)) {
        return { ok: false, error: 'You already earned points for this receipt.' };
      }
      const points = pointsFor(receipt);
      const entry: Activity = {
        kind: 'earn',
        id: makeId('earn'),
        date: Date.now(),
        businessId: receipt.business.id,
        businessName: receipt.business.name,
        amount: receipt.amount,
        points,
      };
      commit({
        balance: current.balance + points,
        activity: [entry, ...current.activity],
        seenReceipts: [...current.seenReceipts, receipt.receiptId],
      });
      return { ok: true, points };
    },
    [commit],
  );

  const redeem = useCallback(
    (reward: Reward): RedeemResult => {
      const current = stateRef.current;
      if (current.balance < reward.cost) {
        return { ok: false, error: `You need ${reward.cost - current.balance} more points.` };
      }
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const entry: Activity = {
        kind: 'redeem',
        id: makeId('redeem'),
        date: Date.now(),
        rewardId: reward.id,
        title: reward.title,
        points: reward.cost,
        code,
      };
      commit({ ...current, balance: current.balance - reward.cost, activity: [entry, ...current.activity] });
      return { ok: true, code };
    },
    [commit],
  );

  const reset = useCallback(() => commit(initialState), [commit]);

  const value = useMemo<PerksContextValue>(
    () => ({
      ready,
      balance: state.balance,
      activity: state.activity,
      lifetimePoints:
        WELCOME_BONUS + state.activity.reduce((sum, a) => (a.kind === 'earn' ? sum + a.points : sum), 0),
      earn,
      redeem,
      reset,
    }),
    [ready, state, earn, redeem, reset],
  );

  return <PerksContext.Provider value={value}>{children}</PerksContext.Provider>;
}

export function usePerks() {
  const ctx = useContext(PerksContext);
  if (!ctx) throw new Error('usePerks must be used inside <PerksProvider>');
  return ctx;
}
