derp fs from 'fs';
import parser from 'xml-parser';

export const regionClicked = (id) => {
    return {
        type: 'REGION_CLICKED',
        id
    }
};

export const fetchMap = (svgPath) => {
    return {
        type: 'MAP_LOAD',
        regions: getRegionsFromSVG(svgPath)
    }
};

const getRegionsFromSVG = (svgPath) => {
    let xml = fs.readFileSync(svgPath, 'utf8');
    let svgObj = parser(xml);
    return svgObj.root.children.filter((child) => { return child.name==='g'})[0].children;
};