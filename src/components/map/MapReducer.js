const mapReducer = (state = {}, action) => {
    switch (action.type) {
        case 'REGION_CLICKED':
            let regions = state.regions.map((region) => {
                region.attributes.id === action.id ? region.selected = true : region.selected = false;
                return region;
            });
            console.log('clicked on '+action.id);
            return {
                regions
            };
        case 'MAP_LOAD':
            return { regions: action.regions };
        default:
            return state
    }
};

export default mapReducer;