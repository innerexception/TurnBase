import { connect } from 'react-redux'
import { rollTheBones, endCombat, retreat, noRetreat } from './CombatActions.js';
import { nextCombat } from '../map/MapActions.js';
import CombatPanel from './CombatPanel.jsx'

const mapStateToProps = (state) => {
    let combatInfo = state.combatReducer.combatInfo ? state.combatReducer.combatInfo : state.mapReducer.viewState.combatInfo;
    return {
        combatInfo
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onRollClick: (combatInfo) => {
            dispatch(rollTheBones(combatInfo));
        },
        onNextCombatClick: (combatInfo) => {
            dispatch(endCombat());
            dispatch(nextCombat(combatInfo));
        },
        onRetreatClick: () => {
            dispatch(retreat());
        },
        noRetreatClick: () => {
            dispatch(noRetreat());
        }
    }
};

const CombatStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CombatPanel);

export default CombatStateContainer;