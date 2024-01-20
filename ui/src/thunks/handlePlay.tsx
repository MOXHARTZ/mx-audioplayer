import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNui } from '../utils/fetchNui';
import { Song } from '@/fake-api/song';
import { isEnvBrowser } from '@/utils/misc';

export const handlePlay = createAsyncThunk<
  { response: false | number; position: number },
  {
    position: number;
    volume: number;
    soundData: Song;
  },
  { rejectValue: boolean }
>('boombox/handlePlay',
  async (data, { rejectWithValue }) => {
    try {
      if (isEnvBrowser()) {
        return {
          response: 1,
          position: data.position
        }
      }
      const url = data.soundData.url;
      if (!url) {
        return rejectWithValue(false);
      }
      const response = await fetchNui<false | number>('play', {
        soundData: data.soundData,
        volume: data.volume
      });

      if (response === false) {
        return rejectWithValue(response);
      }
      return {
        response,
        position: data.position
      }
    } catch (error) {
      return rejectWithValue(false);
    }
  })