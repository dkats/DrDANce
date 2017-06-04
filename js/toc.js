var ToC = "<nav role='navigation' class='ToC'><ul>";

var el, title, link;
$("h1").each(function() {
	console.log(".");
	el = $(this);
	title = el.text();
 	// link = "#" + el.attr("id");

 	// <li onclick="document.getElementById('dance').scrollIntoView();window.scrollBy(0, -48);">Dance</li>
 	ToC += "<li onclick=\"document.getElementById('" + el.attr("id") + "').scrollIntoView();window.scrollBy(0, -48);\">" + title + "</li>";
});

ToC += "</ul></nav>"

$(ToC).insertBefore("article");

console.log(ToC);