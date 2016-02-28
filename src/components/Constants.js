export default {
    Units: {
        DefaultPositions: [
            {
                //region: 'CentralFrance',
                units: [{type: 'infantry', number: 3, owner: 'FR', region: 'CentralFrance'}]
            },
            {
                //region: 'WesternGermany',
                units: [{type: 'tank', number: 5, owner: 'DE', region: 'WesternGermany'}]
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
        fighter: {
            width: 30,
            height: 20,
            attack: 3,
            defend: 4,
            move: 4,
            cost: 8,
            svgName: 'fighter.svg'
        },
        bomber: {
            width:40,
            height: 30,
            attack: 6,
            defend: 1,
            move: 6,
            cost: 12,
            svgName: 'bomber.svg'
        },
        artillery: {
            width: 20,
            height: 10,
            attack: 2,
            defend: 2,
            move: 1,
            cost: 6,
            svgName: 'artillery.svg'
        },
        mechinfantry: {
            width: 30,
            height: 20,
            attack: 1,
            defend: 2,
            move: 2,
            cost: 4,
            svgName: 'mechinfantry.svg'
        },
        destroyer: {
            width: 40,
            height: 20,
            attack: 2,
            defend: 2,
            move: 3,
            cost: 8,
            svgName: 'destroyer.svg'
        },
        cruiser: {
            width: 50,
            height: 30,
            attack: 3,
            defend: 3,
            cost: 12,
            svgName: 'cruiser.svg'
        },
        battleship: {
            width: 60,
            height: 40,
            attack: 4,
            defend: 4,
            cost: 20,
            svgName: 'battleship.svg'
        },
        transport: {
            width: 50,
            height: 20,
            attack: 0,
            defend: 1,
            cost: 8,
            svgName: 'transport.svg'
        },
        submarine: {
            width: 30,
            height: 10,
            attack: 2,
            defend: 2,
            cost: 8,
            svgName: 'submarine.svg'
        }
    },
    UI: {
    }
}