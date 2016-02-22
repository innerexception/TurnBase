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

export const mapDragEnd = (e) => {
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

export const mapZoom = (e) => {
    return {
        type: 'MAP_ZOOM',
        e
    }
};

export const fetchUnits = (units) => {
    return {
        type: 'UNIT_LOAD',
        units
    };
};

export const fetchViewState = (viewState) => {
    return {
        type: 'VIEW_STATE_CHANGED',
        viewState
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
    return {
        type: 'MAP_LOAD',
        regions: getRegionsFromSVG(text)
    }
};

const getRegionsFromSVG = (text) => {
    let svgObj = parser(text);
    return svgObj.root.children.filter((child) => {
        return child.name === 'g'
    })[0].children;
};
