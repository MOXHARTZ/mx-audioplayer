import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import Main from './Main';
import ContextMenuSlice from './contextMenu';

const store = configureStore({
    reducer: {
        Main,
        ContextMenuSlice
    }
})

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof store.getState>;

export default store;