const locations = {
    "hsc 1307": {
        "south": "hallway",
        "items": ["homework"],
        "on_init": "Dr. Halterman looks sternly at you. \n 'Where is your homework?' he asks. You quiver. You must find it soon.",
        "boss": {
            "required_action": "please_halterman",
            "go_while_action_incomplete": [],
            "is_appeased": false,
            "try_to_get_away_from_boss": "Dr. Halterman scowls. 'Not so fast. Where's your homework?'"
        },
    },
    "hallway": {
        "east": "bathroom",
        "west": "outside",
        "north": "hsc 1307",
        "south": "embedded lab",
        "on_init": "You wipe the sweat from your brow. You've reached safety from Dr. Halterman."
    },
    "bathroom": {
        "west": "hallway",
        "on_init": "You bump into Dakota who is looking for his keys...oh wait...he doesn't have any. 🚙",
        "items": ["card"]
    },
    "embedded lab": {
        "north": "hallway",
        "east": "advanced lab",
        "on_init": "A wild ProfO appears! He demands that you recharge your card before you can enter the Advanced Lab.",
        "boss": {
            "required_action": "satisfy_profo_with_card",
            "go_while_action_incomplete": ["north"],
            "is_appeased": false,
            "try_to_get_away_from_boss": "ProfO kindly remarks, 'Go out and charge your card.'"
        }
    },
    "outside": {
        "east": "hallway",
        "on_init": "'I'd better charge my card,' I think to myself.",
        "boss": {
            "required_action": "charge_card",
            "go_while_action_incomplete": ["east"],
            "is_appeased": false,
            "try_to_get_away_from_boss": "",
        }
    },
    "advanced lab": {
        "on_init": "Congratulations! You won the game!",
        "boss": {
            "required_action": "restart_game",
            "go_while_action_incomplete": [],
            "is_appeased": false,
            "try_to_get_away_from_boss": "Interact to restart.",
        }
    }
}

let current_location = "hsc 1307"
let inventory = []

const paint = (data) => {
    const surface = document.querySelector("textarea")
    surface.value += data + "\n"
    surface.scrollTop = surface.scrollHeight - surface.clientHeight
}

class Actions {
    static move(direction) {
        if (["north", "south", "east", "west"].includes(direction)) {
            if (direction in locations[current_location]) {
                if (locations[current_location].boss) {
                    if (locations[current_location].boss.is_appeased) {
                        current_location = locations[current_location][direction]
                        paint(`Current Location: ${current_location.toUpperCase()}`)
                        paint(locations[current_location].on_init)
                    } else {
                        if (locations[current_location].boss.go_while_action_incomplete.includes(direction)) {
                            current_location = locations[current_location][direction]
                            paint(`Current Location: ${current_location.toUpperCase()}`)
                            paint(locations[current_location].on_init)
                        } else {
                            paint(locations[current_location].boss.try_to_get_away_from_boss)
                        }
                    }
                } else {
                    current_location = locations[current_location][direction]
                    paint(`Current Location: ${current_location.toUpperCase()}`)
                    paint(locations[current_location].on_init)
                }

            } else {
                paint("That direction is blocked. 🥺")
            }
        } else {
            paint("That is an invalid direction!")
        }
    }

    static locator() {
        paint(`Current Location: ${current_location.toUpperCase()}`)
    }

    static getInventory() {
        paint("📦 Current Inventory 📦")
        if (!inventory.length) {
            paint("You are a sad, sad student with nothing to your name. 😭")
        } else {
            for (let item of inventory) {
                paint(`* ${item.toUpperCase()}`)
            }
        }
    }

    static pleaseHalterman() {
        if (inventory.includes("homework")) {
            paint("Halterman snatches your homework. Yes, yes, my pretty. He writhes his hands. You may go.")
            inventory = inventory.filter(item => item !== "homework")
            locations[current_location].boss.is_appeased = true
        } else {
            paint(locations[current_location].boss.try_to_get_away_from_boss)
        }
    }

    static grabItem(item) {
        if ("items" in locations[current_location]) {
            if (locations[current_location].items.includes(item)) {
                inventory.push(item)
                locations[current_location].items = locations[current_location].items.filter(i => i !== item)
                paint(`${item.toUpperCase()} was added to your inventory!`)
            }
        } else {
            paint("That item was not found in the room.")
        }
    }

    static search() {
        if ("items" in locations[current_location]) {
            paint("⭐ Items You Found ⭐")
            for (let item of locations[current_location].items) {
                paint(`* ${item.toUpperCase()}`)
            }
        } else {
            paint("You didn't find anything in this room.")
        }
    }

    static chargeCard() {
        if(inventory.includes("card")) {
            inventory = inventory.filter(i => i !== "card")
            inventory.push("charged card")
            locations[current_location].boss.is_appeased = true
            paint("Yay! You charged your card. 🟢")
        } else if (inventory.includes("charged card")) {
            paint("You've already charged your card, DUMMY.")
        } else {
            paint("Oh no! You don't have your card on you!")
        }
    }

    static satisfyProfO() {
        if(inventory.includes("charged card")) {
            locations[current_location].boss.is_appeased = true
            paint("ProfO grins at you and is willing to let you move on.")
        } else {
            paint("Oh no! It doesn't look like you've got a charged card.")
        }
    }

    static restart() {
        window.location.reload()
    }
}

const ActionList = {
    "move": Actions.move,
    "location": Actions.locator,
    "inventory": Actions.getInventory,
    "please_halterman": Actions.pleaseHalterman,
    "charge_card": Actions.chargeCard,
    "restart_game": Actions.restart,
    "satisfy_profo_with_card": Actions.satisfyProfO,
    "talk": () => { ActionList[locations[current_location].boss.required_action]() },
    "interact": () => { ActionList["talk"]() },
    "yoink": Actions.grabItem,
    "search": Actions.search
}

const execute_command = (command) => {
    const [commandKey, ...rest] = command.split(" ")
    if (commandKey in ActionList) {
        ActionList[commandKey](...rest)
    } else {
        paint("That is not a valid command!")
    }
}

const grab_command = () => {
    const command = document.getElementById("command")
    const value = command.value.toLowerCase()
    execute_command(value)
    command.value = ""
}

const button = document.getElementById("commandButton")
button.addEventListener("click", () => {
    grab_command()
})

const input = document.querySelector("input")
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        grab_command()
    }
})

document.querySelector("textarea").value = ""
paint(locations[current_location].on_init)

