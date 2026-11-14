import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { DEFAULT_LOCATION } from '../data/businesses';

type Coords = { latitude: number; longitude: number };

export type UserLocation = {
  coords: Coords;
  /** 'loading' until the first fix; 'fallback' when permission is denied or location fails. */
  status: 'loading' | 'live' | 'fallback';
};

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({ coords: DEFAULT_LOCATION, status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('denied');
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) {
          setLocation({
            coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
            status: 'live',
          });
        }
      } catch {
        if (!cancelled) setLocation({ coords: DEFAULT_LOCATION, status: 'fallback' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
