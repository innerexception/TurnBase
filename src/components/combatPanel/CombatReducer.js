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
    if(newCombatInfo.defenderUnits){
        if(newCombatInfo.activePlayerId === newCombatInfo.defenderUnits[0].owner){

            console.debug('defender turn started...');

            //first defender casualties & units fired at end of attacker's round
            newCombatInfo.activeUnitIndex++;
            let activeUnit = newCombatInfo.defenderUnits[newCombatInfo.activeUnitIndex];
            //If special mission type, defender don't get to fire back
            if(activeUnit && !newCombatInfo.type){
                if(!newCombatInfo.newRound){
                    console.debug('rolled defender unit '+newCombatInfo.activeUnitIndex);
                    //defender units fire with casualties added if not a new round
                    activeUnit.unitDice = rollIt(activeUnit.number - activeUnit.casualtyCount);

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
                if(newCombatInfo.type){
                    //if special mission end combat
                    //TODO: display appropriate end of mission message
                    newCombatInfo.victor = newCombatInfo.defenderUnits[0].owner;
                    return newCombatInfo;
                }
                newCombatInfo.allowRetreat = true;
                newCombatInfo.newRound = false;
                newCombatInfo.activeUnitIndex = -1;
                newCombatInfo.activePlayerId = newCombatInfo.attackerUnits[0].owner;
            }

            //If all units on a side are marked casualty, end with appropriate result
            if(allDead(newCombatInfo.attackerUnits) && allDead(newCombatInfo.defenderUnits)){
                //defender wins draws
                newCombatInfo.victor = newCombatInfo.defenderUnits[0].owner;
                return newCombatInfo;
            }
            else if(allDead(newCombatInfo.defenderUnits)){
                //attacker wins
                newCombatInfo.victor = newCombatInfo.attackerUnits[0].owner;
                return newCombatInfo;
            }
            else if(allDead(newCombatInfo.attackerUnits)){
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

                activeUnit.unitDice = rollIt(activeUnit.number - activeUnit.casualtyCount);

                if(!newCombatInfo.type){
                    //Now set defender casualties
                    activeUnit.unitDice.forEach((dieRoll) => {
                        if(dieRoll <= Constants.Units[activeUnit.type].attack){
                            newCombatInfo.defenderUnits = markLowestCostUnitASUnconfirmed(newCombatInfo.defenderUnits);
                        }
                    });
                }
                else{
                    //TODO: if this is a special mission type, roll to see how much damage or money. These hits do not cause casualties.
                    if(newCombatInfo.type === 'Strategic'){
                        //Remove opponent money
                        console.debug('Removed opponent money: '+activeUnit.unitDice);
                    }
                    if(newCombatInfo.type === 'Infrastructure'){
                        //Add damage tokens to buildings evenly
                        console.debug('Damaged opponent buildings: '+activeUnit.unitDice);
                    }
                }
            }
            else{

                console.debug('attacker turn ending...');
                //switch the defender player. roll for his first unit.
                newCombatInfo.activeUnitIndex = 0;
                newCombatInfo.activePlayerId = newCombatInfo.defenderUnits[0].owner;

                //defender units fire with casualties added if not a special mission
                if(!newCombatInfo.type){
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
        }
    }
    else{
        //Strategic bombing mission
        newCombatInfo.victor = newCombatInfo.attackerUnits[0].owner;
        newCombatInfo.message = 'Strategic bombing run removed X IPCs';
        return newCombatInfo;
    }

    return newCombatInfo;
};

const setAllUnconfirmedAsCasualties = (units) => {
    units.forEach((unit) => {
        if(unit.unconfirmedCasualtyCount){
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
    if(lowestCostUnit.unconfirmedCasualtyCount + lowestCostUnit.casualtyCount > lowestCostUnit.number) lowestCostUnit.unconfirmedCasualtyCount--;
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