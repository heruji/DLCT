function xpath(str) {return document.evaluate(
	str,
	document,
	null,
	XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
	null
);}

var links = [];
var result;
var name, amount, series;
var allCaptions = xpath('//caption');

for(var i = 0; i < allCaptions.snapshotLength; ++i) {
	name = allCaptions.snapshotItem(i).innerText;
	if(name.indexOf('CT Series') == -1) continue;
	result = xpath(
		'//caption[text()="'
		+ name
		+ '"]/following-sibling::tbody[1]/tr[1]/td[1]/a'
	);
	amount = result.snapshotLength;
	if(!amount) continue;
	result = result.snapshotItem(0).getElementsByTagName('img');
	if(!(result.length) || !(result[0].src)) continue;
	result = result[0].src.match(/\\ser(\d+)&/);
	if(!result) continue;
	series = result[1];
	links.push({'name': name, 'amount': amount, 'series': series});
}

if(links.length) {
	chrome.runtime.sendMessage({'links': links, 'fg': true, 'bg': false});
}
