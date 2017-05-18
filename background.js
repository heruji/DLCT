const STATUS_READY = 0;
const STATUS_BUSY = 1;

const METHOD_DL_START = 0;
const METHOD_DL_STOP = 1;
const METHOD_DL_QUERY = 2;

const URL_PREFIX = 'http://192.168.231.2/GetJiveImage?series=\\ser';
const FILE_EXT = '.jpg';

function prefixInteger(num, n) {
	return (Array(n).join(0) + num).slice(-n);
}

var status = STATUS_READY;
var queue = [];

function downloader(downloadItem) {
	if(status == STATUS_BUSY) {
		queue.push(downloadItem);
		return;
	}
	status = STATUS_BUSY;
	var count = 1;
	(function loop() {
		chrome.downloads.download({
			url: URL_PREFIX + downloadItem.series + '&image=img'
				+ prefixInteger(count, 5) + '&size=f',
			filename: downloadItem.path + '\\img'
					+ prefixInteger(count, 5) + FILE_EXT,
			conflictAction: 'overwrite',
			saveAs: false
		});
		if(count < downloadItem.amount) {
			++count;
			window.setTimeout(loop, downloadItem.interval);
		}
		else {
			if(queue.length) {
				downloadItem = queue.shift();
				count = 1;
				window.setTimeout(loop, downloadItem.interval);
			}
			else {
				status = STATUS_READY;
			}
		}
	})();
}

chrome.runtime.onMessage.addListener(function(msg) {
	if(msg.bg) {
		switch(msg.method) {
			case METHOD_DL_START:
				downloader(msg.downloadItem);
				break;
			case METHOD_DL_STOP:
			case METHOD_DL_QUERY:
			default:
		}
	}
});
