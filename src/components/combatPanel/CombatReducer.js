
const combatReducer = (state = {}, action) => {
    switch (action.type) {
        case 'ROLL_THE_BONES':
            return { ...state, startDiceRoll:true, dice:null };
        case 'ROLLED_THE_BONES':
            return { ...state, dice: action.dice };
        case 'REMOVE_CASUALTIES':
            return { ...state, units: updateUnits(action.casualties, state.attackerUnits, state.defenderUnits) };
        default:
            return state
    }
};

const updateUnits = (casualtyUnits, attackerUnits, defenderUnits) => {

};

export default combatReducer;