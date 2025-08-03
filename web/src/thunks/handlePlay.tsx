import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNui } from '../utils/fetchNui';
import { Song } from '@/fake-api/song';
import { isEnvBrowser } from '@/utils/misc';

interface Params {
  response: false | number;
}

interface Payload {
  position: string | number;
  volume: number;
  playlistId?: string | number;
  soundData: Song;
  updatedSoundData?: Song;
}

export const handlePlay = createAsyncThunk<
  Params,
  Payload,
  { rejectValue: false | string }
>('audioplayer/handlePlay',
  async (data, { rejectWithValue }) => {
    try {
      if (isEnvBrowser()) {
        return {
          response: 1,
          position: data.position
        }
      }
      const soundData = data.soundData;
      const response = await fetchNui<false | number | { error: string }>('play', {
        soundData,
        volume: data.volume
      });

      if (typeof response === 'object') {
        return rejectWithValue(response.error);
      }

      if (response === false) {
        return rejectWithValue(response);
      }

      return {
        response
      }
    } catch (error) {
      return rejectWithValue(false);
    }
  })