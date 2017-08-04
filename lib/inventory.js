module.exports = function inventory(dispatch, notifyInventory){
    var buildInventory = null,
        inventory = null
    
    this.getInventory = () => { return inventory }
    
    dispatch.hook('S_INVEN', 5, event => {
            if (event.first) buildInventory = []
            else if (!buildInventory) return
            for (let item of event.items) buildInventory.push(item);
            if (!event.more) {
                inventory = buildInventory
                buildInventory = null;
                if (typeof(notifyInventory) !== 'undefined' && notifyInventory !== null) notifyInventory()
            }
    });

    this.getAmount = (id) => {
        for (let item of inventory) {
            if (item.slot < 40) continue; // First 40 slots are reserved for equipment, etc.
            if (item.item == id) return item.amount
        }
        return 0;
    }
}