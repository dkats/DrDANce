// https://www.w3schools.com/howto/howto_js_sort_list.asp

function sortList(list_id) {
	var list, i, switching, b, shouldSwitch;
	list = document.getElementById(list_id);
	switching = true;
	while (switching) {
		switching = false;
		b = list.getElementsByTagName("li");
		for (i = 0; i < (b.length - 1); i++) {
			shouldSwitch = false;
			if (b[i].innerText.toLowerCase() > b[i + 1].innerText.toLowerCase()) {
				shouldSwitch= true;
				break;
			}
		}
		if (shouldSwitch) {
			b[i].parentNode.insertBefore(b[i + 1], b[i]);
			switching = true;
		}
	}
}