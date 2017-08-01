const MARK_ID = 151643
const shop = [
    {name: "mwa", id: 447, price: 1},
    {name: "ccb",  id: 70000, price: 12},
    {name: "vsemi",  id: 154525, price: 14},
    {name: "semi", id: 399, price: 18}
]

module.exports = function easyMarks(dispatch) {

    const msg = new (require('../../cat_utils/message.js'))(dispatch, 'easyMarks', '#3f7efc')
    const ploc = new (require('../../cat_utils/playerLocation.js'))(dispatch)
    const chat = new (require('../../cat_utils/chatCommands.js'))(dispatch)
    const inv = new (require('../../cat_utils/inventory.js'))(dispatch)
    const item = new (require('../../cat_utils/useItem.js'))(dispatch, ploc)
    const format = require('../../cat_utils/format.js')
    chat.add(['mark *'], convert)

    function convert(item) {
        if (typeof(item) == 'undefined') msg.error('no argument given')
        else {
            var found = false
            shop.forEach(function(i){
                if (i.name == format.stripTags(item)){
                    startConvertion(i)
                    found = true
                }
            })
            if (!found) msg.error('Invalid argument: ' + item)
        }
    }

    function startConvertion(item){
        calculate(item)
            .then(useMark)
            .then(addToBasket)
            .then(waitForInventory)
            .then(confirmBasket)
            .catch(e => msg.error(e.message))
    }

    function calculate(item) {
        return new Promise((resolve, reject) => {
            amount = Math.floor(inv.getAmount(MARK_ID) / item.price)
            if (amount > 0) {
                conv = { item: item.id, amount: amount }
                resolve(conv)
            } else {
                reject(new Error('Not enough marks to convert'))
            }
        })
    }
    function useMark(conv) {
        return new Promise((resolve, reject) => {
            const contractRequestHook = dispatch.hookOnce('S_REQUEST_CONTRACT', 1, event => {
                if (event.type == 20) {
                    resolve({ conv: conv, contract: event.id })
                    return false
                } else reject(new Error('wrong event type'))
            })
            const sellListHook = dispatch.hookOnce('S_MEDAL_STORE_SELL_LIST', 1, event => {
                return false
            })
            setTimeout(() => {
                if (sellListHook) dispatch.unhook(sellListHook)
                if (contractRequestHook) dispatch.unhook(contractRequestHook)
                reject(new Error('useMark request timed out'))
            }, 5000)
            item.use(MARK_ID)
        })
    }
    function addToBasket(r) {
        return new Promise((resolve, reject) => {
            const medalStoreHook = dispatch.hookOnce('S_MEDAL_STORE_BASKET', 1, event => {
                resolve(r.contract)
                return false
            })
            setTimeout(() => {
                if (medalStoreHook) dispatch.unhook(medalStoreHook)
                reject(new Error('addToBasket request timed out'))
            }, 5000)
            dispatch.toServer('C_MEDAL_STORE_BUY_ADD_BASKET', 1, {
                ownerId: ploc.getCid(),
                contractId: r.contract,
                itemId: r.conv.item,
                amount: r.conv.amount
            })
        })
    }
    function waitForInventory(contract) {
        return new Promise((resolve, reject) => {
            const inventoryHook = dispatch.hook('S_INVEN', 5, event => {
                if (!event.more) {
                    resolve(contract)
                    dispatch.unhook(inventoryHook)
                }
                return false
            })
            setTimeout(() => {
                if (inventoryHook) dispatch.unhook(inventoryHook)
                reject(new Error('waitForInventory request timed out'))
            }, 5000)
        })
    }
    function confirmBasket(contract) {
        return new Promise((resolve, reject) => {
            const acceptContractHook = dispatch.hookOnce('S_ACCEPT_CONTRACT', 1, event => {
                if (event.id == contract) {
                    msg.message('Completed transformation.');
                    resolve()
                    return false
                }
                reject(new Error('wrong contract'))
            })
            setTimeout(() => {
                if (acceptContractHook) dispatch.unhook(acceptContractHook)
                reject(new Error('confirmBasket request timed out'))
            }, 5000)
            dispatch.toServer('C_MEDAL_STORE_COMMIT', 1, {
                ownerId: ploc.getCid(),
                contractId: contract
            })
        })
    }
}