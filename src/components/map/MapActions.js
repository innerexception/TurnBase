import fetch from 'isomorphic-fetch';
import parser from 'xml-parser';
import Constants from '../Constants.js';

export const regionClicked = (id) => {
    return {
        type: 'REGION_CLICKED',
        id
    }
};

export const unitClicked = (unitInfo) => {
    return {
        type: 'UNIT_CLICKED',
        unitInfo
    }
};

export const nextCombat = (combatInfo) => {
    return {
        type: 'NEXT_COMBAT',
        combatInfo
    }
};

export const unitStackClicked = (region) => {
    return {
        type: 'UNIT_STACK_CLICKED',
        region
    }
};

export const mapDragged = (e) => {
    return {
        type: 'MAP_DRAGGED',
        e
    }
};

export const mapDragEnd = () => {
    return {
        type: 'MAP_DRAG_END'
    }
};

export const mapDragStart = (e) => {
    return {
        type: 'MAP_DRAG_START',
        e
    }
};

export const unitDragStart = (e, unitInfo) => {
    e.stopPropagation();
    return {
        type: 'UNIT_DRAG_START',
        e,
        unitInfo
    }
};

export const unitDragEnd = (e) => {
    return {
        type: 'UNIT_DRAG_END'
    }
};

export const moveCancel = (unitInfo) => {
    return {
        type: 'UNIT_MOVE_CANCELLED',
        unitInfo
    }
};

export const chipOver = (unitInfo) => {
    return {
        type: 'CHIP_MOUSE_OVER',
        unitInfo
    }
};

export const sendOneUnitToOrigin = (unitInfo) => {
    return {
        type: 'SEND_UNIT_TO_ORIGIN',
        unitInfo
    }
};

export const endPhase = (phaseName) => {
    return {
        type: 'END_PHASE',
        phaseName
    }
};

export const highlightNextRegion = () => {
    return {
        type: 'HIGHLIGHT_NEXT_REGION'
    }
};

export const unitMove = (e) => {
    return {
        type: 'UNIT_MOVE',
        e
    }
};

export const mapZoom = (e) => {
    return {
        type: 'MAP_ZOOM',
        e
    }
};

export const fetchUnits = (units, centroidMap, regions) => {
    return (dispatch) => {
        let fetchArray = [];
        let typesFetched = new Map();
        units.forEach((unitInfo) => {
            if(!typesFetched.get(unitInfo.type)) fetchArray.push(fetch('./res/svg/units/de/'+Constants.Units[unitInfo.type].svgName));
            typesFetched.set(unitInfo.type, true);
        });
        return Promise.all(fetchArray).then((responseArray) => {
            let textFetches = [];
            responseArray.forEach((response) => {
                textFetches.push(response.text());
            });
            Promise.all(textFetches).then((textResponseArray) => {
               dispatch(fetchedUnits(units, textResponseArray, centroidMap, regions));
            });
        });
    }
};

export const fetchUnitPaths = (unitPathMap) => {
    return {
        type: 'UNIT_PATH_MAP',
        unitPathMap
    }
};

export const fetchedUnits = (regionUnits, textResponseArray, centroidMap, regions) => {
    return {
        type: 'UNIT_LOAD',
        units: getUnitPathsFromResponse(regionUnits, textResponseArray),
        regions: updateRegionsWithCentroids(regions, centroidMap),
        centroidMap
    };
};

export const fetchViewState = (viewState) => {
    return {
        type: 'VIEW_STATE_CHANGED',
        viewState
    };
};

export const fetchPlayerState = (playerInfo) => {
    return {
        type: 'PLAYER_INFO_LOAD',
        playerInfo
    };
};

export const fetchMap = (svgPath) => {
    return (dispatch) => {
        return fetch(svgPath)
            .then((response) =>
                {response.text().then((text) =>
                    { dispatch(mapFetched(text)) })});
    }
};

export const mapFetched = (text) => {
    let regions = getRegionPathsFromSVG(text);
    return {
        type: 'MAP_LOAD',
        regions: getRegionAdjacencyMap(text, regions)
    }
};

const updateRegionsWithCentroids = (regions, centroidMap) => {
    regions.forEach((region) => {
        region.bbox = centroidMap.get(region.attributes.id);
    });
    return regions;
};

const getUnitPathsFromResponse = (units, textArray) => {
    textArray.forEach((svgText) => {
        let svgObj = parser(svgText);
        let unitName = svgObj.root.children.filter((child) => {
            return child.name === 'title'
        })[0].content;
        let unitPaths = svgObj.root.children.filter((child) => {
            return child.name === 'g'
        })[0].children;
        units.forEach((unit) => { if(unit.type === unitName) unit.paths = unitPaths });
    });
    return units;
};

const getRegionPathsFromSVG = (text) => {
    let svgObj = parser(text);
    let paths = [];
    svgObj.root.children.filter((child) => {
        return child.name === 'g'
    }).forEach((childCollection) => { paths = paths.concat(childCollection.children);});
    return paths;
};

const getRegionAdjacencyMap = (text, regions) => {

    let regionPaths = getRegionPathsFromSVG(text);

    let svgObj = parser(text);
    let adjacencyInfo = svgObj.root.children.filter((child) => {
        return child.name === 'defs'
    })[0].children.filter((child) => { return child.name === 'adjacency'})[0].children;

    regionPaths.forEach((regionPath) => {
        let adjInfo = adjacencyInfo.filter((info) => { return info.name === regionPath.attributes.id})[0];
        if(adjInfo){
            regions.forEach((region)=> { if(region.attributes.id === regionPath.attributes.id) region.adjacencyMap = adjInfo.children;});
        }
    });
    return regions;
};