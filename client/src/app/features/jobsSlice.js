import { createSlice } from "@reduxjs/toolkit";

const jobsSlice = createSlice({
    name: 'jobs',
    initialState: {
        feed: [],
        loading: false,
        error: null,
    },
    reducers: {
        setJobs: (state, action) => {
            state.feed = action.payload;
            state.loading = false;
            state.error = null;
        },
        addJobs: (state, action) => {
            state.feed = [...state.feed, ...action.payload];
            state.loading = false;
        },
        removeJob: (state, action) => {
            state.feed = state.feed.filter(job => job._id !== action.payload);
        },
        setJobsLoading: (state, action) => {
            state.loading = action.payload;
        },
        setJobsError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    }
});

export const { setJobs, addJobs, removeJob, setJobsLoading, setJobsError } = jobsSlice.actions;
export default jobsSlice.reducer;
