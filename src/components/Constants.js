export default {
    Units: {
        DefaultPositions: [
            {
                //region: 'CentralFrance',
                units: [{type: 'infantry', number: 3, owner: 'FR', region: 'CentralFrance'}]
            },
            {
                //region: 'WesternGermany',
                units: [{type: 'infantry', number: 5, owner: 'DE', region: 'WesternGermany'}]
            }
        ],
        infantry: {
            width: 20,
            height: 40,
            attack: 1,
            defend: 2,
            move: 1,
            cost: 3,
            svgName: 'infantry.svg'
        },
        tank: {
            width: 30,
            height: 30,
            attack: 3,
            defend: 3,
            move: 2,
            cost: 5,
            svgName: 'tank.svg'
        },
        unitStack: {
            d: ''
        }
    },
    UI: {
    }
}