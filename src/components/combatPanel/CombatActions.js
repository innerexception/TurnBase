import Constants from '../Constants.js';

export const unitClicked = (unitInfo) => {
    return {
        type: 'UNIT_CLICKED',
        unitInfo
    }
};