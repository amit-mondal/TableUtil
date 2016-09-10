function TableUtil(selector, data, functions) {
	this.data = data;
	this.functions = opt(functions, {});
	this.table;
	this.setUpTable(selector, this.data, this.functions);
}

TableUtil.prototype.read = function() {
	if (!check(this.data.read, 'The "read" property is required to call this method!')) {
		return;
	}
	return this.readTable(this.table, this.data.read);
}
	
//only methods above here should be called by user

TableUtil.prototype.setUpTable = function(selector, data, functions) {
	var target = $(selector);
	if (target.length) {
		this.table = target;
		var table = target;		
		if (exists(data.delete)) {
			this.setUpDelete(table, data.delete, functions);
		}
		if (exists(data.add)) {
			this.setUpAdd(table, data.add, functions);
		}
		if (data.order) {
			this.setUpSort(table, functions);
		}
	}
	else {
		throw "No target table found"
	}
}	

TableUtil.prototype.setUpDelete = function(table, deleteData, functions) {
    if (table.find(".custom-table-delete-button").length) {
		return;
	}	
	var header = table.find("thead tr");
	header.append('<th class="text-right"> Actions </th>');
	var rows = table.find("tbody tr");
	$.each(rows, function(index, value) {
		var td = $('<td class="text-right"><button class="btn btn-danger custom-table-delete-button">Delete</button></td>');
		$(value).append(td);
	});
	$(table).on("click", ".custom-table-delete-button", function(e) {
		var target = $(e.target);
		var minRows = opt(deleteData.minRows, 0);
		var numRows = $(table).find("tbody tr").length
		if (numRows - 1 < minRows) {
			alert("You need at least " + minRows + " " + (minRows > 1 ? "rows" : "row") + " in this table!");
		}
		else {
			var hasConfirmed = true;
			if (typeof deleteData.confirmMessage !== "undefined") {
				hasConfirmed = confirm(deleteData.confirmMessage)
			}
			if (hasConfirmed) {
				target.parent().parent().remove();
			}
		}
		if (typeof functions.onDelete === "function") {
			functions.onDelete(e);
		}
		else if (typeof functions.onDelete !== "undefined") {
			throw "onDelete must be a function";
		}
	});
}

TableUtil.prototype.setUpAdd = function(table, addData, functions) {	
	if (!check(addData.buttonSelector, "add.buttonSelector is a required property!")) {
		return
	}
	var rowString	
	if (exists(addData.rowString)) {
   		rowString = addData.rowString
	}
	else if (exists(addData.reuse)) {
		var rowClone = $(table).find("tbody tr").last().clone();
		if (exists(functions.beforeAddReuse)) {
			rowClone = opt(functions.beforeAddReuse(rowClone), rowClone);
		}
		rowString = rowClone.prop("outerHTML");
	}

	if (!rowString) {
		throw "add.reuse or add.rowString is a required property!";
		return false;
	}
	
	var addButton = $(addData.buttonSelector);
	addButton.click(function(e) {
		var beforeResult = true
		if (exists(functions.beforeAdd) && typeof functions.beforeAdd === "function") {
			var beforeResult = functions.beforeAdd(e)
		}
		if (beforeResult) {
			$(table).append(rowString);
		}
		if (typeof functions.onAdd === "function") {
			functions.onAdd(e);
		}
		else if (exists(functions.onAdd)) {
			throw "functions.onAdd must be a function!";
		}		
	});

}

TableUtil.prototype.readTable = function(table, readData) {
	var rows = $(table).find("tbody tr");
	var result = [];
	$.each(rows, function(index, row) {
		var rowDict = {}
		var tds = $(row).find("td");
		for (var i = 0;i<readData.length;i++) {
			var datum = readData[i];
			var td = tds[i];
			if (!check(datum.selector, "read.selector is a required property!") || !check(datum.name, "read.name is a required property!")) {
				result = false;
				return false;
			}
			var elem = $(td).find(datum.selector);
			if (exists(datum.property)) {
				rowDict[datum.name] = elem.prop(datum.property);
			}
			else {
				rowDict[datum.name] = elem.val();
			}
		}
		if (result) {
			result.push(rowDict)
		}
		else return result;
	});
	return JSON.stringify(result);
}

TableUtil.prototype.setUpSort = function(table, functions) {
	createCSSSelector(".custom-table-sortable-placeholder", "display: table-row; width: 500%;");
	$(table).sortable({
		items: 'tr',
		revert: true,
		container: 'parent',
		forcePlaceholderSize: true,
		placeholder: 'custom-table-sortable-placeholder',
		helper: function(e, ui) {
			ui.children().each(function() {
				$(this).width($(this).width());
			});
			return ui;
		},
		axis: 'y',
		start: functions.onSortStart,
		opacity: 1,
		beforeStop: functions.onSortFinish
	});
} 

/*
  utility functions
*/

function exists(e) {
	return typeof e !== 'undefined';
}

function opt(val, alt) {
	return exists(val) ? val : alt;
}

function check(val, err) {
	if (!exists(val)) {
		throw err
		return false;
	}
	return true;
}

function createCSSSelector (selector, style) {
  if (!document.styleSheets) return;
  if (document.getElementsByTagName('head').length == 0) return;

  var styleSheet,mediaType;

  if (document.styleSheets.length > 0) {
    for (var i = 0, l = document.styleSheets.length; i < l; i++) {
      if (document.styleSheets[i].disabled) 
        continue;
      var media = document.styleSheets[i].media;
      mediaType = typeof media;

      if (mediaType === 'string') {
        if (media === '' || (media.indexOf('screen') !== -1)) {
          styleSheet = document.styleSheets[i];
        }
      }
      else if (mediaType=='object') {
        if (media.mediaText === '' || (media.mediaText.indexOf('screen') !== -1)) {
          styleSheet = document.styleSheets[i];
        }
      }

      if (typeof styleSheet !== 'undefined') 
        break;
    }
  }

  if (typeof styleSheet === 'undefined') {
    var styleSheetElement = document.createElement('style');
    styleSheetElement.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

    for (i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].disabled) {
        continue;
      }
      styleSheet = document.styleSheets[i];
    }

    mediaType = typeof styleSheet.media;
  }

  if (mediaType === 'string') {
    for (var i = 0, l = styleSheet.rules.length; i < l; i++) {
      if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()==selector.toLowerCase()) {
        styleSheet.rules[i].style.cssText = style;
        return;
      }
    }
    styleSheet.addRule(selector,style);
  }
  else if (mediaType === 'object') {
    var styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
    for (var i = 0; i < styleSheetLength; i++) {
      if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
        styleSheet.cssRules[i].style.cssText = style;
        return;
      }
    }
    styleSheet.insertRule(selector + '{' + style + '}', styleSheetLength);
  }
}
