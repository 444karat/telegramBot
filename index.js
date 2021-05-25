const telega = require('node-telegram-bot-api');
const mongo = require('mongoose');

const token ='1792324692:AAFM4igtzMR-FShNm_Al3xZc9F5_osafvss';
const db_url = "mongodb+srv://user:VeM6Yzsg9jHz2ma1@cluster0.rvkon.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const bot = new telega(token, {polling : true});
const button_game ={
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Камень' , callback_data: '1'} , {text: "Ножницы", callback_data: '2'}, {text: 'Бумага', callback_data: '3'}]
        ]
    })
};
const UserScheme = new mongo.Schema({
    id: {type: Number, unique: true},
    win: {type: Number, unique: false, default : 0},
    lose:{type: Number, unique: false,default : 0},
    draw:{type: Number, unique: false, default : 0}
},{versionKey: false} );
const UsersDB = mongo.model("User", UserScheme);
const keyMap = new Map([
    ['1', "Камень"],
    ['2', "Ножницы"],
    ['3', "Бумага"]
]);
let chats  = {};
let WLD = {};
function O() {
    this.win = 0;
    this.lose = 0;
    this.def = 0;
}

async function logicGame(idChat, flag) {
    let choose = Math.floor(Math.random() * 3) + 1;
    chats[idChat] = choose;
    if (flag){
        await bot.sendMessage(idChat, "выбирай камень, бумагу или ножницы",button_game);
    }
}

async function start() {
    try
    {
        await mongo.connect(db_url, {useNewUrlParser: true ,  useUnifiedTopology: true});
    }
    catch (e) {
        console.log(e);
    }


    bot.setMyCommands(
        [
            {command: '/start', description: "Правила + приветтствие"},
            {command: '/game', description:  "Начало игры"},
            {command: '/result', description: "Результат"}
        ]
    );
    bot.addListener("message", async mes => {
        const idChat = mes.chat.id;

        var rez = new O();
        if ( mes.text == "/start"){


            WLD[idChat] = rez;
            await  bot.sendMessage(idChat,"привет,игра : Камень, ножницы, бумага\n" +
            "Правила:\n" +
            "Бумага побеждает камень \n" +
            "Ножницы побеждают бумагу \n" +
            "Камень побеждает ножницы  \n to start press over here /game" );

            //if (UsersDB.findOne({id: idChat}))
        }
        else if ( mes.text == "/game"){
            await logicGame(idChat, true);
        }
        else if( mes.text == "/result"){
           /* console.log(UsersDB.findOne({id:idChat}, function (err, doc){
                console.log(doc);
            }));*/
            await bot.sendMessage(idChat, `win: ${WLD[idChat].win} lose:${WLD[idChat].lose} draw: ${WLD[idChat].def}`);

        }
        else{
            await bot.sendMessage(idChat, "?");
        }
    } );

    bot.addListener('callback_query',async mes=> {
        const idChat = mes.message.chat.id;
        const data = mes.data;


        logicGame(idChat, false);
        await bot.sendMessage(idChat, `u: ${keyMap.get(data)} bot: ${keyMap.get(String(chats[idChat]))}` );

        rez = WLD[idChat];
        console.log(idChat , rez);

        if (data == chats[idChat]){
           // await UsersDB.updateOne({id:idChat}, {$inc: {draw: 1}});

            rez.def++;
            WLD[idChat] = rez;
            await bot.sendMessage(idChat, "Ничья", button_game);
        }
        if( (data == 1 && chats[idChat] == 2) || (data == 2 && chats[idChat] == 3) || (data == 3 && chats[idChat] == 1)){
            //await UsersDB.updateOne({id:idChat}, {$inc: {win: 1}});
            rez.win++;
            WLD[idChat] =  rez;
            await bot.sendMessage(idChat, "Победа" , button_game);
        }
        if( (data == 1 && chats[idChat] == 3) || (data == 2 && chats[idChat]) == 1 || (data == 3 && chats[idChat] == 2)){
           // await UsersDB.updateOne({id:idChat}, {$inc: {lose: 1}});
            rez.lose++;
            WLD[idChat] = rez;
            await bot.sendMessage(idChat, "Проиграл", button_game);
        }
    })
}

start();