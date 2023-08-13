import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { CURRENT_USER_KEY, USER_LOCALSTORAGE_KEY } from 'shared/const/localstorage';
import { loaderActions } from 'shared/ui/PageLoader';
import { Notification } from 'shared/ui/Notifications/lib/Notification';
import { LoginFormType } from 'widgets/LoginForm/models/types/loginSchema';
import { authProviderActions } from 'app/providers/AuthProvider';
import { io } from 'socket.io-client';
// import socket from 'shared/ui/Socket/Socket';

const socket = io('http://localhost:7001');

export const AuthProviderService = createAsyncThunk<LoginFormType>(
    'auth',
    async (data, thunkAPI) => {
        try {
            thunkAPI.dispatch(loaderActions.onOffLoader(true));
            const response = await axios.get(`${process.env.API_URL}/api/refresh`, {
                withCredentials: true,
            });
            await localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(response.data.accessToken));
            await localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
            await thunkAPI.dispatch(authProviderActions.setUser(response.data.user));
            await thunkAPI.dispatch(loaderActions.onOffLoader(false));
            socket.connect();

            return response.data;
        } catch (e) {
            thunkAPI.dispatch(loaderActions.onOffLoader(false));
            return thunkAPI.rejectWithValue('error');
        }
    },
);

export const LogoutService = createAsyncThunk(
    'logout',
    async (data, thunkAPI) => {
        try {
            thunkAPI.dispatch(loaderActions.onOffLoader(true));
            const response = await axios.post(
                `${process.env.API_URL}/api/logout`,
                {},
                {
                    withCredentials: true,
                },
            );
            await localStorage.removeItem(CURRENT_USER_KEY);
            await localStorage.removeItem(USER_LOCALSTORAGE_KEY);
            thunkAPI.dispatch(loaderActions.onOffLoader(false));
            new Notification().showSuccess('User successfully logout!');
            return response.data;
        } catch (e) {
            new Notification().showError(e.message);
            thunkAPI.dispatch(loaderActions.onOffLoader(false));
            return thunkAPI.rejectWithValue('error');
        }
    },
);
