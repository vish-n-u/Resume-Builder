import { createSlice } from "@reduxjs/toolkit";

const applicationsSlice = createSlice({
    name: 'applications',
    initialState: {
        list: [],
        currentApplication: null,
        loading: false,
    },
    reducers: {
        setApplications: (state, action) => {
            state.list = action.payload;
            state.loading = false;
        },
        setCurrentApplication: (state, action) => {
            state.currentApplication = action.payload;
        },
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        },
        setApplicationsLoading: (state, action) => {
            state.loading = action.payload;
        },
        updateApplicationStatus: (state, action) => {
            const { id, status } = action.payload;
            const app = state.list.find(a => a._id === id);
            if (app) app.status = status;
        },
    }
});

export const {
    setApplications,
    setCurrentApplication,
    clearCurrentApplication,
    setApplicationsLoading,
    updateApplicationStatus,
} = applicationsSlice.actions;
export default applicationsSlice.reducer;
