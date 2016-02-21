import fetch from 'isomorphic-fetch';
import parser from 'xml-parser';

export const regionClicked = (id) => {
    return {
        type: 'REGION_CLICKED',
        id
    }
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
    if(text){
        let svgObj = parser(text);
        return svgObj.root.children.filter((child) => {
            return child.name === 'g'
        })[0].children;
    }
};
