
export const updateRegionsCombatEnd = (regions, combatInfo) => {
    let newRegions = Array.from(regions);

    let winnerId = combatInfo.victor;
    let regionId;
    if(!combatInfo.type){
        regionId = combatInfo.defenderUnits[0].owner === winnerId ? combatInfo.defenderUnits[0].region : combatInfo.attackerUnits[0].region;
    }

    newRegions.forEach((region) => {
        if(region.attributes.id === regionId) region.attributes.defaultOwner = winnerId;
    });

    return newRegions;
};