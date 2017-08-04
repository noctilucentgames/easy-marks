module.exports = function message(dispatch, name, color) {
	var n = '<font' + ((typeof(color) !== 'undefined') ? (' color="' + color + '"') : '') + '>[' + name + ']</font> : '
	
	this.error = function (m) {
		this.message('<font color="#FF0000">ERROR: </font><font>' + m + '</font>');
		console.log(name + ' ERROR: ' + m);
	}

	this.notify = function (m, style) {
		var ms = '<font>' + m + '</font>'
		dispatch.toClient('S_CUSTOM_STYLE_SYSTEM_MESSAGE', 1, {
			style : style,
			message : ms
		})
	}

	this.message = function (m) {
		var ms = '<font>' + m + '</font>'
		console.log(n+ms)
		dispatch.toClient('S_CHAT', 1, {
			channel: 24,
			authorID: 0,
			unk1: 0,
			gm: 0,
			unk2: 0,
			authorName: '',
			message: n + ms
		});
	}
}