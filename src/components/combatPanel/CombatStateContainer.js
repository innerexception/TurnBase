import { connect } from 'react-redux'
import { rollTheBones } from './CombatActions.js';
import CombatPanel from './CombatPanel.jsx'

const mapStateToProps = (state) => {
    return {
        combatInfo: state.combatReducer.combatInfo ? state.combatReducer.combatInfo : state.mapReducer.viewState.combatInfo,
        startDiceRoll: state.combatReducer.startDiceRoll,
        dice: state.combatReducer.dice
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onRollClick: (combatInfo) => {
            dispatch(rollTheBones(combatInfo));
        }
    }
};

const CombatStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CombatPanel);

export default CombatStateContainer;