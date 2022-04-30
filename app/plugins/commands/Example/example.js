'use strict';
export const config = {
    name: "Example",
    nsfw: ["exampleName"], //exampleName is the name of the command
    description: {
        "about": "About the whole module",
        "commands": {
            "exampleName": "About the example command",//exampleName is the name of the command
            "anotherExampleName": "About the another example command"
        }
    },
    usage: {
        "exampleName": "Example usage",//exampleName is the name of the command
        "anotherExampleName": "Another example usage"
    },//Description of how to use the module
    credits: "Anonymous",//Credits to the author of the module
    permissions: [0,1,2],
    //just a regular member, your permissions are 0
    //a group admin, your permissions are 1
    //a bot admin, your permissions are 2
    //if you are both group admin and bot admin, your permission will be [1,2]
    options: {},
    map: {
        "exampleName": exampleFunction, //exampleName is the name of the command, exampleFunction is the name of the function assigned to the command
        "anotherExampleName": anotherExampleFunction
    },
    dependencies: [//dependencies required to run the module
        "dependency",
        "anotherDependency"
    ],
    cooldown: {
        "exampleName": 5,//exampleName is the name of the command, 5 is the cooldown in seconds
        "anotherExampleName": 5
    }
}

export function onLoad({db}) {
    //code here what you want to do when loading the module
}

async function exampleFunction({api, event, args, db, controllers, userPermission}) {
    //code here
}

function anotherExampleFunction({api, event, args, db, controllers, userPermission}) {
    //code here
}
