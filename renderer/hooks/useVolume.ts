import { useCallback, useEffect, useState } from 'react';
import EventEmitter from 'eventemitter3';

type VolumeState = {
  volume: number;
  muted: boolean;
};

const VOLUME_KEY = 'meridian_volume';
const MUTED_KEY = 'meridian_muted';

let volumeCache: VolumeState | null = null;
let isLoadingVolume = false;
const volumeListener = new EventEmitter();

enum VolumeEvent {
  __SET_VOLUME__ = 'SET_VOLUME',
  __SET_VOLUME_RSP__ = 'SET_VOLUME_RSP',
}

export const useVolume = () => {
  const [volume, setVolume] = useState<number>(volumeCache?.volume || 1);
  const [muted, setMuted] = useState<boolean>(volumeCache?.muted || false);

  const getVolume = useCallback(async () => {
    const handler = (newState: VolumeState) => {
      volumeCache = newState;
      volumeListener.emit(VolumeEvent.__SET_VOLUME__, newState);
    };

    if (volumeCache) {
      volumeListener.emit(VolumeEvent.__SET_VOLUME__, volumeCache);
    } else if (isLoadingVolume) {
      volumeListener.once(VolumeEvent.__SET_VOLUME_RSP__, handler);
    } else {
      isLoadingVolume = true;
      try {
        const savedVolume = localStorage.getItem(VOLUME_KEY);
        const savedMuted = localStorage.getItem(MUTED_KEY);
        const finalState = {
          volume: savedVolume ? parseFloat(savedVolume) : 1,
          muted: savedMuted ? savedMuted === 'true' : false
        };
        
        handler(finalState);
        volumeListener.emit(VolumeEvent.__SET_VOLUME_RSP__, finalState);
      } catch (error) {
        console.error('Failed to load volume settings:', error);
        handler({ volume: 1, muted: false });
        volumeListener.emit(VolumeEvent.__SET_VOLUME_RSP__, { volume: 1, muted: false });
      } finally {
        isLoadingVolume = false;
      }
    }
  }, []);

  const saveVolume = useCallback(async (newVolume: number) => {
    try {
      localStorage.setItem(VOLUME_KEY, newVolume.toString());
      volumeCache = { ...volumeCache!, volume: newVolume };
      volumeListener.emit(VolumeEvent.__SET_VOLUME__, volumeCache);
      setVolume(newVolume);
    } catch (error) {
      console.error('Failed to save volume:', error);
    }
  }, []);

  const saveMuted = useCallback(async (newMuted: boolean) => {
    try {
      localStorage.setItem(MUTED_KEY, newMuted.toString());
      volumeCache = { ...volumeCache!, muted: newMuted };
      volumeListener.emit(VolumeEvent.__SET_VOLUME__, volumeCache);
      setMuted(newMuted);
    } catch (error) {
      console.error('Failed to save muted state:', error);
    }
  }, []);

  useEffect(() => {
    const handler = (newState: VolumeState) => {
      setVolume(newState.volume);
      setMuted(newState.muted);
    };

    volumeListener.on(VolumeEvent.__SET_VOLUME__, handler);
    getVolume();

    return () => {
      volumeListener.off(VolumeEvent.__SET_VOLUME__, handler);
    };
  }, [getVolume]);

  return { volume, muted, saveVolume, saveMuted };
};

export default useVolume;
