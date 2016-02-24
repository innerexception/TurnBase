export default {
    Units: {
        DefaultPositions: [
            {
                region: 'FR',
                units: [{type: 'infantry', number: 3, owner: 'FR', region: 'FR'}]
            },
            {
                region: 'DE',
                units: [{type: 'infantry', number: 5, owner: 'DE', region: 'DE'}]
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
        Arrow: {
            polygonPoints: "902.25049,222.98633 233.17773,222.98633 233.17773,364.71875 0,182.35938 233.17773,0 233.17773,141.73242 902.25049,141.73242 902.25049,222.98633 "
        }
    }
}