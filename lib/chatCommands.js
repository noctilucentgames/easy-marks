const format = require('./format.js')

module.exports = function chatCommands(dispatch){
    var chatCommands = new Map()
    var chatCommandsVar = new Map()

    this.add = function(command, func){
        commands = [].concat(command)
        commands.forEach(function(cmd){
            if(cmd.slice(-1) != "*"){
                chatCommands.set(cmd, func)
            } else {
                chatCommandsVar.set(cmd.slice(0, -2), func)
            }
            
        })
    }
    
    const chatHook = event => {
        let command = format.stripTags(event.message).toLowerCase();
        if (command.startsWith('!')){
            command = command.slice(1);
            if(chatCommands.has(command)){
                (chatCommands.get(command))()
                return false
            } else {
                chatCommandsVar.forEach(function(value, key, map){
                    if (command.indexOf(key) == 0){
                        cmd = event.message.replace("!"+key+" ", '')
                        if(cmd == "") {
                            value()
                        } else {
                            value(cmd)
                        }
                        return false
                    }
                })
            }
        }
    }
    dispatch.hook('C_CHAT', 1, chatHook)
	dispatch.hook('C_WHISPER', 1, chatHook)
}