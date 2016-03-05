import Constants from '../Constants.js';

const combatReducer = (state = {}, action) => {
    switch (action.type) {
        case 'ROLL_THE_BONES':
            console.log('rolled');
            return { ...state, combatInfo: updateCombatInfo(action.combatInfo) };
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

const updateCombatInfo = (combatInfo) => {
    let newCombatInfo = {...combatInfo};

    if(!newCombatInfo.activePlayer) newCombatInfo.activePlayer = {units: combatInfo.attackerUnits, unitTypes: getUnitTypes(combatInfo.attackerUnits), activeUnitType: getNextUnitTypeForPlayer(combatInfo.attackerUnits, '')};
    if(!newCombatInfo.inactivePlayer) newCombatInfo.inactivePlayer = {units: combatInfo.defenderUnits, unitTypes: getUnitTypes(combatInfo.defenderUnits), activeUnitType: getNextUnitTypeForPlayer(combatInfo.defenderUnits, '')};

        //If all units on a side are marked casualty, end with appropriate result
    if(allDead(newCombatInfo.inactivePlayer.units)){
        //Active player wins
        combatInfo.victor = newCombatInfo.activePlayer;
        return combatInfo;
    }
    if(allDead(newCombatInfo.activePlayer.units)){
        //Active player wins
        combatInfo.victor = newCombatInfo.inactivePlayer;
        return combatInfo;
    }

    //Take the existing die rolls and mark casualties as needed
    newCombatInfo.activePlayer.activeUnitType.unitDice.forEach((dieRoll) => {
        if(dieRoll <= Constants.Units[newCombatInfo.activePlayer.activeUnitType.type].attack){
            newCombatInfo.inactivePlayer.units = markLowestUnitAsCasualty(newCombatInfo.inactivePlayer.units);
        }
    });

    //Roll for the next unit type if any, otherwise switch the active player
    newCombatInfo.activePlayer.activeUnitType = getNextUnitTypeForPlayer(newCombatInfo.activePlayer.units, newCombatInfo.activePlayer.activeUnitType.type);
    if(newCombatInfo.activePlayer.activeUnitType){
        newCombatInfo.activePlayer.activeUnitType.unitDice = rollIt(newCombatInfo.activePlayer.activeUnitType.number);
    }
    else{
        //If a round is over, attacker will be able to retreat if wanted
        let temp = newCombatInfo.activePlayer;
        newCombatInfo.activePlayer = newCombatInfo.inactivePlayer;
        newCombatInfo.activePlayer.activeUnitType = getNextUnitTypeForPlayer(newCombatInfo.activePlayer.unitTypes, newCombatInfo.activePlayer.activeUnitType);
        newCombatInfo.inactivePlayer = temp;
    }
    return newCombatInfo;
};

const rollIt = (numDice) => {
    let rolls = [];
    for(var i=0; i< numDice; i++){
        rolls.push(Math.floor(Math.random()*6+1));
    }
    return rolls;
};

const allDead = (units) => {
    return !(units.filter((unit) => {
        return !unit.isCasualty;
    }).length > 0);
};

const getNextUnitTypeForPlayer = (unitTypes, lastUnitType) => {
    //Next lowest unit type costwise
    let unitCost = 200;
    let lowestCostUnit = unitTypes.reduce((prevUnit, currUnit) => { if(Constants.Units[currUnit.type].cost < unitCost && currUnit.type !== lastUnitType){ unitCost = Constants.Units[currUnit.type].cost; return currUnit; } else return null; });
    return lowestCostUnit && {number: lowestCostUnit.number, type: lowestCostUnit.type, unitDice: [] };
};

const markLowestUnitAsCasualty = (units) => {
    let lowestCost = 50, lowestAttackUnit;
    units.forEach((unit) => {
        if(Constants.Units[unit.type].cost < lowestCost && !(lowestAttackUnit.isCasualty)){
            lowestCost = Constants.Units[unit.type].cost;
            lowestAttackUnit = unit;
        }
    });
    lowestAttackUnit.isCasualty = true;
    return units;
};

const getUnitTypes = (units) => {
    let unitTypes = [];
    units.forEach((unit) => {
        if(unitTypes.indexOf(unit.type) === -1)unitTypes.push(unit.type);
    });
    return unitTypes;
};

export default combatReducer;