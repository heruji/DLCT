const DEFAULT_INTERVAL = 500;
const MIN_INTERVAL = 200;
const MAX_INTERVAL = 2000;

const FOLDER_BOX_ID = 'folder';
const INTERVAL_BOX_ID = 'interval';
const LINKS_TABLE_ID = 'links';
const EMPTY_ROW_ID = 'empty';

const METHOD_LINK_GET = 0;
const METHOD_LINK_SETALL = 1;
const METHOD_LINK_LENGTH = 2;

const METHOD_DL_START = 0;
const METHOD_DL_STOP = 1;
const METHOD_DL_QUERY = 2;

var getElem = function(id) {
	return document.getElementById(id);
}

var crtElem = function(elem) {
	return document.createElement(elem);
}

var fnLinks = (function() {
	var links = [];
	return function(method, param) {
		switch(method) {
			case METHOD_LINK_GET:
				return links[param];
			case METHOD_LINK_SETALL:
				links = param;
				return;
			case METHOD_LINK_LENGTH:
				return links.length;
			default:
		}
	};
})();

function filterFolderName(str) {
	return str.split(/[\\\/:*?\"<>|]/).join('').trim();
}

function getPath(fname) {
	var fname1 = getElem(FOLDER_BOX_ID).value;
	if(!fname1) return fname;
	return filterFolderName(fname1) + '\\' + fname;
}

function getInterval() {
	var interval = parseInt(getElem(INTERVAL_BOX_ID).value);
	if(isNaN(interval)) {
		return DEFAULT_INTERVAL;
	}
	if(interval < MIN_INTERVAL) {
		return MIN_INTERVAL;
	}
	if(interval > MAX_INTERVAL) {
		return MAX_INTERVAL;
	}
	return interval;
}

function btnHandler(e) {
	var index = parseInt(e.target.id);
	var item = fnLinks(METHOD_LINK_GET, index);
	var path = getPath(item.name);
	var interval = getInterval();
	chrome.runtime.sendMessage({
		'method': METHOD_DL_START,
		'downloadItem': {
			'series': item.series,
			'amount': item.amount,
			'path': path,
			'interval': interval
		},
		'fg': false,
		'bg': true
	});
}

function createButton(index) {
	var btn = crtElem('button');
	btn.id = '' + index;
	btn.innerText = 'Download';
	btn.onclick = btnHandler;
	return btn;
}

chrome.runtime.onMessage.addListener(function(msg) {
	if(msg.fg && msg.links.length) {
		fnLinks(METHOD_LINK_SETALL, msg.links);
		var row, col0, col1;
		row = getElem(EMPTY_ROW_ID);
		row.parentNode.removeChild(row);
		for(var i = 0, l = fnLinks(METHOD_LINK_LENGTH); i < l; ++i) {
			row = crtElem('tr');
			col0 = crtElem('td');
			col1 = crtElem('td');
			col0.innerText = fnLinks(METHOD_LINK_GET, i).name;
			col1.appendChild(createButton(i));
			row.appendChild(col0);
			row.appendChild(col1);
			getElem(LINKS_TABLE_ID).appendChild(row);
		}
	}
});

window.onload = function() {
	var folderBox = getElem(FOLDER_BOX_ID);
	var intervalBox = getElem(INTERVAL_BOX_ID);
	folderBox.onchange = function() {
		chrome.storage.local.set({'fname': folderBox.value});
	};
	intervalBox.onchange = function() {
		chrome.storage.local.set({'interval': intervalBox.value});
	};
	chrome.storage.local.get(['fname', 'interval'], function(result) {
		if(result.fname) folderBox.value = result.fname;
		if(result.interval) intervalBox.value = result.interval;
	});
	chrome.tabs.executeScript({file: 'csSendLinks.js', allFrames: true});
};
