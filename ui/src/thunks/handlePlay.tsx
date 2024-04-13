import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNui } from '../utils/fetchNui';
import { Song } from '@/fake-api/song';
import { isEnvBrowser, YOUTUBE_URL } from '@/utils/misc';

interface Params {
  response: false | number;
  position: number | string;
  playlistId?: string | number;
  updatedSoundData?: Song;
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
  { rejectValue: boolean }
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
      let url = soundData.url;
      if (!url) {
        const response = await fetchNui<{ videoId: string }[]>('searchQuery', { query: `${soundData.title} - ${soundData.artist}` })
        if (!response) return rejectWithValue(false);
        url = `${YOUTUBE_URL}${response[0].videoId}`;
      }
      const updatedSoundData = {
        ...soundData,
        url
      }
      const response = await fetchNui<false | number>('play', {
        soundData: updatedSoundData,
        volume: data.volume
      });

      if (response === false) {
        return rejectWithValue(response);
      }
      return {
        response,
        position: data.position,
        playlistId: data.playlistId,
        updatedSoundData: !soundData.url ? updatedSoundData : undefined
      }
    } catch (error) {
      return rejectWithValue(false);
    }
  })