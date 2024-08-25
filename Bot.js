const mc = require("mineflayer")
const fs = require("fs")
const readline = require('readline');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


function runBot(username) {
    var mineCont = false

    console.log("starting up:", username)
    const bot = mc.createBot({
        host: "hypixel.net",
        port: 25565,
        username: username,
        version: "1.20",
        auth: "microsoft",
    });

    async function dig() {
        if (!mineCont) return;
        // find block to harvest
        block = bot.blockAt(bot.entity.position.offset(2, 1, 0))
        block2 = bot.blockAt(bot.entity.position.offset(3, 1, 0))
        block3 = bot.blockAt(bot.entity.position.offset(4, 1, 0))
        block4 = bot.blockAt(bot.entity.position.offset(5, 1, 0))
        
        if (block3 == null) {
            console.log("bug")
        } else if (block3.name === "coal_block" || block4.name === "coal_block") {
            await sleep(500)
            bot.clearControlStates()
            bot.setControlState("forward", true)
            await sleep(1000)
            bot.setControlState("left", true)
            bot.setControlState("forward", false)
        } else if (block3.name === "lapis_block" || block4.name === "lapis_block") {
            await sleep(500)
            bot.clearControlStates()
            bot.setControlState("forward", true)
            await sleep(1000)
            bot.setControlState("right", true)
            bot.setControlState("forward", false)
        } else if (block3.name === "sponge" || block4.name === "sponge") {
            bot.chat("/warp garden")
            bot.clearControlStates()
            bot.setControlState("right", true)
            await sleep(500)
            console.log("finished one row")
        }

        if (!block || block.name == "coal_block" || block.name == "lapis_block" || block2.name == "coal_block" || block2.name == "lapis_block") {
            await sleep(100);
        } else {
            try {
                bot.dig(block, "ignore", "raycast"); // 2nd param: true to 'snap at block' or 'ignore' to just not turn head
                await sleep(1)
                bot.dig(block2, "ignore", "raycast"); // 2nd param: true to 'snap at block' or 'ignore' to just not turn head
            } finally {
                await sleep(75);
            } 
        }
        dig()
    }

    bot.on("login", () => {
        let botSocket = bot._client.socket;
        console.log("[Event] logged in on", bot.username)
    })

    bot.on("messagestr", async (messagestr) => {
        if (messagestr.includes("❤") || messagestr.includes("teleport to the plot!") || messagestr.includes("joined SkyBlock.") || messagestr.includes("FOLLOW")) {
            return
        } else if (messagestr.includes("Welcome to Hypixel SkyBlock!")) {
            bot._client.chat("/warp garden")
            await sleep(1000)
            console.log("triggered - STARTING SUGARCANE FARM")
            bot.setControlState("right", true)
            mineCont = true;
            dig()
        } else if (messagestr.includes("resetall")) {
            console.log("triggered - stopping all")
            bot.clearControlStates()
            mineCont = false;
        } else if (messagestr.includes("sugarRight")) {             // sugar farm
            console.log("triggered - STARTING SUGARCANE FARM")
            bot.setControlState("right", true)
            mineCont = true;
            dig()
        } else if (messagestr.includes("countSugar")) {
            var enchSugarCount = 0
            var enchCaneCount = 0

            bot.inventory.slots.forEach(element => {
                if (element == null) {} else if (element.nbt.value.hasOwnProperty("Enchantments")) {
                    if (element.name == "sugar_cane") {
                        enchCaneCount = enchCaneCount + element.count
                    } else if (element.name == "sugar") {
                        enchSugarCount = enchSugarCount + element.count
                    }
                }
            });

            console.log("[", bot.username, "] harvested so far: ", enchCaneCount, " ench. Sugar Canes ", enchSugarCount, " ench. Sugar ")
            return
        }
        console.log(bot.username, ">", messagestr)
    })

    bot.on("spawn", () => {
        bot.activateItem();
    })

    bot.once("windowOpen", (window) => {
        console.log("[Event:] Window Open", window.title["translate"])

        bot.clickWindow(12, 0, 0)
    })

    bot.on("end", () => {
        console.log("[Event:] disconnected")
        return
    })
}



async function run() {

    console.log("starting up...")

    const accFileStream = fs.createReadStream(process.argv[2]);

    var accountlist = []

    const rl1 = readline.createInterface({
        input: accFileStream,
        crlfDelay: Infinity
    }) 

    rl1.on("line", (line) => {
        accountlist.push(line)
    })

    await sleep(5000)

    accountlist.forEach(function (user, index) {
        setTimeout(function () {
            runBot(user);
        }, index * 10000);
    });
}

run()