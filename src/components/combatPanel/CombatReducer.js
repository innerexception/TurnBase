import Constants from '../Constants.js';

const combatReducer = (state = {}, action) => {
    switch (action.type) {
        case 'ROLL_THE_BONES':
            console.log('rolled');
            return { ...state, combatInfo: updateCombatInfo(action.combatInfo) };
        case 'END_COMBAT':
            return { ...state, combatInfo: null };
        case 'NO_RETREAT':
            state.combatInfo.newRound = true;
            return { ...state, combatInfo: updateCombatInfo(state.combatInfo) };
        case 'RETREAT':
            state.combatInfo.retreated = true;
            return { ...state, combatInfo: updateCombatInfo(state.combatInfo) };
        default:
            return state
    }
};

const updateCombatInfo = (combatInfo) => {
    let newCombatInfo = {...combatInfo};
    newCombatInfo.combatTransition = false;
    newCombatInfo.allowRetreat = false;

    if(!newCombatInfo.activePlayerId) newCombatInfo.activePlayerId = newCombatInfo.attackerUnits[0].owner;

    if(newCombatInfo.retreated){
        newCombatInfo.victor = newCombatInfo.defenderUnits[0].owner;
        return newCombatInfo;
    }

    //If defender's turn, fire, remove casualties, and check victory
    if(newCombatInfo.activePlayerId === newCombatInfo.defenderUnits[0].owner){

        console.debug('defender turn started...');

        //first defender casualties & units fired at end of attacker's round
        newCombatInfo.activeUnitIndex++;
        let activeUnit = newCombatInfo.defenderUnits[newCombatInfo.activeUnitIndex];
        if(activeUnit){
            if(!newCombatInfo.newRound){
                console.debug('rolled defender unit '+newCombatInfo.activeUnitIndex);
                //defender units fire with casualties added if not a new round
                activeUnit.unitDice = rollIt(activeUnit.number - (activeUnit.casualtyCount + activeUnit.unconfirmedCasualtyCount));

                //Set attacker casualties
                activeUnit.unitDice.forEach((dieRoll) => {
                    if(dieRoll <= Constants.Units[activeUnit.type].attack){
                        newCombatInfo.attackerUnits = markLowestCostUnitASUnconfirmed(newCombatInfo.attackerUnits);
                    }
                });
            }
            else{
                console.debug('new round, first defender unit was already rolled.');
            }
        }
        else{
            console.debug('defender turn ended.');
            //switch the active player &
            //allow retreat
            console.debug('clearing all casualties...');
            //remove attacker & defender casualties
            setAllUnconfirmedAsCasualties(newCombatInfo.defenderUnits);
            setAllUnconfirmedAsCasualties(newCombatInfo.attackerUnits);
            newCombatInfo.allowRetreat = true;
            newCombatInfo.newRound = false;
            newCombatInfo.activeUnitIndex = -1;
            newCombatInfo.activePlayerId = newCombatInfo.attackerUnits[0].owner;
        }

        //If all units on a side are marked casualty, end with appropriate result
        if(allDead(newCombatInfo.defenderUnits)){
            //attacker wins
            newCombatInfo.victor = newCombatInfo.attackerUnits[0].owner;
            return newCombatInfo;
        }
        if(allDead(newCombatInfo.attackerUnits)){
            //defender wins
            newCombatInfo.victor = newCombatInfo.defenderUnits[0].owner;
            return newCombatInfo;
        }
    }
    else{
        //Otherwise attacker's turn. Attacker never has casualties, units are removed by defender immediately when hit. Units Fire, and set defender casualties (do not remove them)

        if(typeof newCombatInfo.activeUnitIndex === 'undefined') newCombatInfo.activeUnitIndex = -1;

        newCombatInfo.activeUnitIndex++;
        //Roll for the next unit type if any, otherwise switch the active player
        let activeUnit = newCombatInfo.attackerUnits[newCombatInfo.activeUnitIndex];
        if(activeUnit){
            console.debug('attacker fires unit '+newCombatInfo.activeUnitIndex);

            activeUnit.unitDice = rollIt(activeUnit.number - (activeUnit.casualtyCount ? activeUnit.casualtyCount : 0));

            //Now set defender casualties
            activeUnit.unitDice.forEach((dieRoll) => {
                if(dieRoll <= Constants.Units[activeUnit.type].attack){
                    newCombatInfo.defenderUnits = markLowestCostUnitASUnconfirmed(newCombatInfo.defenderUnits);
                }
            });
        }
        else{

            console.debug('attacker turn ending...');
            //switch the defender player. roll for his first unit.
            newCombatInfo.activeUnitIndex = 0;
            newCombatInfo.activePlayerId = newCombatInfo.defenderUnits[0].owner;

            //defender units fire with casualties added
            console.debug('rolled for first defender unit at end of round and set casualties...');
            activeUnit = newCombatInfo.defenderUnits[newCombatInfo.activeUnitIndex];
            activeUnit.unitDice = rollIt(activeUnit.number - Math.max(0, ((activeUnit.casualtyCount ? activeUnit.casualtyCount : 0) - (activeUnit.unconfirmedCasualtyCount ? activeUnit.unconfirmedCasualtyCount : 0))));

            console.debug('set attacker casualties...');
            //Set attacker casualties
            activeUnit.unitDice.forEach((dieRoll) => {
                if(dieRoll <= Constants.Units[activeUnit.type].attack){
                    newCombatInfo.attackerUnits = markLowestCostUnitASUnconfirmed(newCombatInfo.attackerUnits);
                }
            });
        }
    }

    return newCombatInfo;
};

const setAllUnconfirmedAsCasualties = (units) => {
    units.forEach((unit) => {
        if(unit.unconfirmedCasualtyCount){
            if(!unit.casualtyCount) unit.casualtyCount = 0;
            unit.casualtyCount += unit.unconfirmedCasualtyCount;
            unit.unconfirmedCasualtyCount = 0;
        }
    });
    return units;
};

const markLowestCostUnitASUnconfirmed = (units) => {
    let newUnits = units.filter((unit) => {return unit.casualtyCount<unit.number});
    let lowestCostUnit = newUnits[0];
    newUnits.forEach((unit) => {
        if(Constants.Units[unit.type].cost < Constants.Units[lowestCostUnit.type].cost) lowestCostUnit = unit;
    });
    if(!lowestCostUnit.unconfirmedCasualtyCount) lowestCostUnit.unconfirmedCasualtyCount=0;
    lowestCostUnit.unconfirmedCasualtyCount++;
    return newUnits;
};

const rollIt = (numDice) => {
    let rolls = [];
    for(var i=0; i< numDice; i++){
        rolls.push(Math.floor(Math.random()*6+1));
    }
    return rolls;
};

const allDead = (units) => {
    return (units.filter((unit) => {
        return unit.casualtyCount >= unit.number;
    }).length === units.length);
};

export default combatReducer;