import { createSlice } from "@reduxjs/toolkit";

const jobsSlice = createSlice({
    name: 'jobs',
    initialState: {
        feed: [],
        loading: false,
        error: null,
        filters: {
            keyword: '',
            location: '',
            type: '', // '' | 'remote' | 'onsite'
        },
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
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
    }
});

export const { setJobs, addJobs, removeJob, setJobsLoading, setJobsError, setFilters } = jobsSlice.actions;
export default jobsSlice.reducer;
