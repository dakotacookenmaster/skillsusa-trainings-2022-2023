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
        "items": ["card"]
    },
    "embedded lab": {
        "north": "hallway",
        "east": "advanced lab",
        "boss": {
            "required_action": "satisfy_profo_with_card",
            "go_while_action_incomplete": ["north", "east", "west"],
            "is_action_complete": false,
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
        if(["north", "south", "east", "west"].includes(direction)) {
            if(direction in locations[current_location]) {
                if(locations[current_location]?.boss?.is_appeased) {
                    current_location = locations[current_location][direction]
                    paint(`Current Location: ${current_location.toUpperCase()}`)
                    paint(locations[current_location].on_init)
                } else {
                    if(locations[current_location]?.boss?.go_while_action_incomplete.includes(direction)) {
                        current_location = locations[current_location][direction]
                        paint(`Current Location: ${current_location.toUpperCase()}`)
                        paint(locations[current_location].on_init)
                    } else {
                        paint(locations[current_location]?.boss?.try_to_get_away_from_boss)
                    }
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
        if(!inventory.length) {
            paint("You are a sad, sad student with nothing to your name. 😭")
        } else {
            for(let item of inventory) {
                paint(`* ${item.toUpperCase()}`)
            }
        }
    }

    static pleaseHalterman() {
        if(inventory.includes("homework")) {
            paint("Halterman snatches your homework. Yes, yes, my pretty. He writhes his hands. You may go.")
            inventory = inventory.filter(item => item !== "homework")
            locations[current_location].boss.is_appeased = true
        } else {
            paint(locations[current_location].boss.try_to_get_away_from_boss)
        }
    }

    static grabItem(item) {
        if("items" in locations[current_location]) {
            if(locations[current_location].items.includes(item)) {
                inventory.push(item)
                locations[current_location].items = locations[current_location].items.filter(item => item)
                paint(`${item.toUpperCase()} was added to your inventory!`)
            }
        } else {
            paint("That item was not found in the room.")
        }
    }

    static search() {
        if("items" in locations[current_location]) {
            paint("⭐ Items You Found ⭐")
            for(let item of locations[current_location].items) {
                paint(`* ${item.toUpperCase()}`)
            }
        } else {
            paint("You didn't find anything in this room.")
        }
    }
}

const ActionList = {
    "move": Actions.move,
    "location": Actions.locator,
    "inventory": Actions.getInventory,
    "please_halterman": Actions.pleaseHalterman,
    "talk": () => { ActionList[locations[current_location].boss.required_action]() },
    "yoink": Actions.grabItem,
    "search": Actions.search
}

const execute_command = (command) => {
    const [commandKey, ...rest] = command.split(" ")
    if(commandKey in ActionList) {
        ActionList[commandKey](...rest)
    } else {
        paint("That is not a valid command!")
    }
}

const button = document.getElementById("commandButton")
button.addEventListener("click", () => {
    const command = document.getElementById("command").value.toLowerCase()
    execute_command(command)
})

const input = document.querySelector("input")
input.addEventListener("keydown", (event) => {
    if(event.key === "Enter") {
        const command = document.getElementById("command").value.toLowerCase()
        execute_command(command)
    }
})

document.querySelector("textarea").value = ""
paint(locations[current_location].on_init)

