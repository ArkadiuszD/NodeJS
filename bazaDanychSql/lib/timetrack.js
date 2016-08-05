var qs = require ('querystring');
exports.sendHtml = function(res, html) { 
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

exports.parseRecivedData = function(req,cb){
	var body = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk){
		body+=chunk
	});
	req.on('end', function(){
		var data= qs.parse(body);
		cb(data);
	});
};

exports.actionForm = function(id,path,label){
	var html = '<form method="POST" action = "'+path+'">'+
	'<input type="hidden" name="id" value="' +id+ '">'+
	'<input type="submit" value="' +label+ '/">'+
	'</form>';
	return html;
};

exports.add = function (db,req,res) {
	exports.parseRecivedData(req,function(work){
		db.query(
			"INSERT INTO work (hours, date,description)"+
			"VALUES(?,?,?)",
			[work.hours, work.date,work.description],
			function(err){
				if(err) throw err;
				exports.show(db,res);
			}
			);
	});
};

exports.delete = function (db,req,res) {
	exports.parseRecivedData(req,function(work){
		db.query(
			"DELETE FROM work WHERE id=?",		
			[work.id],
			function(err){
				if(err) throw err;
				exports.show(db,res);
			}
			);
	});
};

exports.archive = function (db,req,res) {
	exports.parseRecivedData(req,function(work){
		db.query(
			"UPDATE work SET archived=1 WHERE id = ?",
			[work.id],
			function(err){
				if(err) throw err;
				exports.show(db,res);
			}
			);
	});
};

exports.show = function(db,res,showArchived){
	var query = "SELECT * FROM work WHERE archived=? ORDER BY date DESC";
	
	var archivedValue = (showArchived) ? 1: 0;
	db.query(
		query,
		[archivedValue],
		function(err,rows){
			if(err) throw err;
			html = (showArchived)
			? ''
			: '<a href="/archived"> Zarchiwizowane </a><br />';
			html+= exports.workHitlistHtml(rows);
			html += exports.workFormatHtml();
			exports.sendHtml(res, html);
		}
		);
};

exports.showArchived= function(db,res){
	exports.show(db,res,true);
};

exports.workHitlistHtml = function (rows){
	var html = '<table>';
	for (var i in rows){
		html +='<tr>';
		html +='<td>' + rows[i].date +'</td>';
		html +='<td>' + rows[i].hours +'</td>';
		html +='<td>' + rows[i].description +'</td>';
		if(!rows[i].archived){
			html +='<td>' + exports.workArchiveForm(rows[i].id) +'</td>';
		}
		html +='<td>' + exports.workDeleteForm(rows[i].id) +'</td>';
		html +='</tr>';
	}
	html +='</table>';
	return html;
};

exports.workFormatHtml = function(){
	var html = '<form method="POST" action = "/">'+
	'<p> DATA (RRRR-MM-DD): <input type="text" name="date"></p>'+
	'<p> Liczba godzin <input type="text" name="hours"></p>'+
	'<p> Opis <textarea  name="description"></textarea></p>'+
	'<input type="submit" value="Dodaj">'+
	'</form>';
	return html;
};

exports.workArchiveForm = function(id){
	return exports.actionForm(id, '/archive', 'Archiwizuj');
};

exports.workDeleteForm = function(id){
	return exports.actionForm(id, '/delete', 'Usuń');
};