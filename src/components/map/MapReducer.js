const mapReducer = (state, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            return state.regions.map((region) => {
                region.id === action.id ? region.selected = true : region.selected = false;
            });
        case 'MAP_LOAD':
            state.regions = action.regions;
            return state;
        default:
            return state
    }
};

export default mapReducer;