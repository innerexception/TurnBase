import Constants from '../Constants.js';

export const rollTheBones = (combatInfo) => {
    return {
        type: 'ROLL_THE_BONES',
        combatInfo
    }
};

export const endCombat = () => {
    return {
        type: 'END_COMBAT'
    }
};