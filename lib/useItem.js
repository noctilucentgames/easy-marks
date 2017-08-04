module.exports = function useItem(dispatch, ploc){
    this.use = (item) => {
        loc = ploc.getLocation()
        dispatch.toServer('C_USE_ITEM', 1, {
            ownerId: ploc.getCid(),
            item: item,
            id: 0,
            unk1: 0,
            unk2: 0,
            unk3: 0,
            unk4: 1,
            unk5: 0,
            unk6: 0,
            unk7: 0,
            x: loc.x,
            y: loc.y,
            z: loc.z,
            w: loc.w,
            unk8: 0,
            unk9: 0,
            unk10: 0,
            unk11: 1
        });
    }
}