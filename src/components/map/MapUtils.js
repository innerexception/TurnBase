import Constants from '../Constants.js';

let Utils = {

    getPathBoundingRectById: (pathId) => {
        let pathEl = d3.select('path#'+pathId)[0][0];
        return pathEl && pathEl.getBoundingClientRect();
    },

    getNextActivePhase: (phaseName) => {
        let index = Constants.UI.Phases.indexOf(phaseName)+1;
        if(index >= Constants.UI.Phases.length) index = 0;
        return Constants.UI.Phases[index];
    },

    getValidMove: (originRegionId, targetRegionId, unitInfo, adjacencyMap, unitPath, activePhase, units, playerTeam) => {
        // for unit move value, get adjacent regions of origin and return true if target region is one of them.

        let isValid = false;

        if(targetRegionId && (originRegionId !== targetRegionId) && targetRegionId !== unitInfo.region){

            isValid = adjacencyMap.filter((adjObject) => { return targetRegionId === adjObject.name; }).length > 0;

            if(activePhase === 'Combat'){
                //Must drop on a region with units from the other team in it
                //TODO: OR an empty enemy region
                let targetRegionUnitsOtherTeam = units.filter((unit) => {
                    return unit.region === targetRegionId && Constants.Players[unit.owner].team !== playerTeam;
                });
                isValid = targetRegionUnitsOtherTeam.length > 0;
                if(!isValid) console.debug('combat phase, moves only into spaces with enemies');
            }

            if(activePhase === 'Move'){
                //Must drop on a region with no units from the other team
                //TODO: AND not an enemy region
                let targetRegionUnitsOtherTeam = units.filter((unit) => {
                    return unit.region === targetRegionId && Constants.Players[unit.owner].team !== playerTeam;
                });
                isValid = targetRegionUnitsOtherTeam.length === 0;
                if(!isValid) console.debug('move phase, moves only into spaces with no enemies');
            }

            if(unitPath.length-1 > Constants.Units[unitInfo.type].move) isValid = false;

            //TODO: land units can never move on water and vv

            //TODO: A transport unit could be a valid move target

            //TODO: Air units must end their move on a friendly region (allow backtracking)
        }

        return isValid;
    },

    updateUnitPath: (newState, e) => {
        //TODO: elementsFromPoint is hot but only supported on the latest FF/Chrome. Need cross-browser solution...
        let possibleNewRegion = document.elementsFromPoint(e.clientX, e.clientY).filter((element) => {
            return element.classList.contains('turnbase-region');
        })[0].attributes.id.textContent;

        //If we entered a new region, save the last region.
        if(newState.regionOver !== possibleNewRegion){
            newState.lastRegionOver = newState.regionOver;
            console.log('calculating adjacency from center of: '+newState.lastRegionOver);
            newState.regionOver = possibleNewRegion;

            //Determine number of region moves so far
            if(!newState.unitPath) newState.unitPath = [newState.regionOver];
            else{
                //If you backtracked, remove last region in path
                if(newState.unitPath[newState.unitPath.length-2] === possibleNewRegion){
                    console.log('removed ' +newState.unitPath[newState.unitPath.length-1]+ ' from unit path');
                    newState.unitPath.splice(newState.unitPath.length-1, 1);
                }
                else{
                    //Check if region exists in path, region can only be in path once.
                    let duplicate = newState.unitPath.filter((path) => {
                        return path === possibleNewRegion;
                    });
                    if(duplicate.length === 0){
                        newState.unitPath.push(possibleNewRegion);
                        console.log('added ' +possibleNewRegion+ ' to unit path');
                    }
                    else{
                        console.log('possibleNewRegion was already found in path!');
                    }

                }
            }
            console.debug('new path is: '+newState.unitPath);

        }

        return newState;
    }
};

export default Utils;