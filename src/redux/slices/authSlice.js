import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api.js'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('token', data.token)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData)
    localStorage.setItem('token', data.token)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return rejectWithValue('No token')
    const { data } = await api.get('/auth/me')
    return data.user
  } catch (err) {
    const status = err.response?.status
    const message = err.response?.data?.message || 'Session expired'
    if (status === 401 || /invalid token|token expired|session expired/i.test(String(message))) {
      localStorage.removeItem('token')
    }
    return rejectWithValue(message)
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', profileData)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed')
  }
})

export const addAddress = createAsyncThunk('auth/addAddress', async (addressData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users/addresses', addressData)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add address')
  }
})

export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ addressId, addressData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/addresses/${addressId}`, addressData)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update address')
  }
})

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/users/addresses/${addressId}`)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address')
  }
})

export const setDefaultAddress = createAsyncThunk('auth/setDefaultAddress', async (addressId, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/addresses/${addressId}/default`)
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to set default address')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.error = null
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(loadUser.pending, (state) => { state.loading = true })
      .addCase(loadUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(loadUser.rejected, (state) => { state.loading = false; state.user = null })

      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(addAddress.pending, (state) => { state.loading = true; state.error = null })
      .addCase(addAddress.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(addAddress.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(updateAddress.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateAddress.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(updateAddress.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(deleteAddress.pending, (state) => { state.loading = true; state.error = null })
      .addCase(deleteAddress.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(deleteAddress.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(setDefaultAddress.pending, (state) => { state.loading = true; state.error = null })
      .addCase(setDefaultAddress.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
      .addCase(setDefaultAddress.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
