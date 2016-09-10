# TableUtil

## Instantiation and Use
`var util = new TableUtil(selector, data, functions)`

`selector` - a required parameter that represents the selector for the table, e.g. `"#myTable"`

`data` - a required parameter that represents the configuration options for your table

`functions` - an optional parameter consisting of functions you want called upon a certain table action

Upon instantiation with the correct parameters, the table will be fully set up.

To get the table data as a JSON, simply call `util.read()`

## data - required dictionary

#### delete - optional dictionary - include to allow user to delete rows
 - optional `confirmMessage` - a message string that is alerted each time a row is deleted
 - optional `minRows` - an integer for the minimum number of rows allowed in the table

#### add - optional dictionary - include to allow user to add new rows
 - required `buttonSelector` - a string for the CSS selector of the button to be clicked in order to add new table rows, e.g. `"#myAddButton"`
 - either 
 -  One of the following properties is required 
 - - `rowString`, a simple HTML string for the new row to be added, or
 - - `reuse`, a boolean. Setting `reuse` true will let the table simply reuse one of the provided rows

#### read - optional array - include to get table data as JSON
 - The read array represents a single `<tr>` in the table
 - Each array element is a dictionary representing a single `<td>` in a table row, from left to right. Each element has the following properties: 
 - - required `selector` - a string for the CSS selector of the element in the `<td>` whose property you want to read - e.g. `"#myTextField"`
 - - required `name` - a string that will be the key for the selector's value in the dictionary that is returned
 - - optional `property` - a string that represents the property of the element the selector references - e.g. `"innerHTML"` - if no property is provided, TableUtil will use jQuery's `.val()` method 

#### order - optional boolean - include to allow user to drag and reorder table rows
 - If `order` is included, and if it's true (I think), the table rows will be orderable.

## functions - optional dictionary

#### onDelete(event)
 - Called after a row has been deleted, is passed the jQuery click event  

#### beforeAdd(event)
 - Called before a new row is added, is passed the jQuery click event
 - If the function returns false, a new row will not be added

#### onAdd(event)
 - Called after a row has been added, is passed the jQuery click event

#### beforeAddReuse(rowClone)
 - Called before a reused row is added, is passed the cloned `<tr>` DOM element about to be added to the table
 - The function can modify and then return the `<tr>` DOM element, which will then be added to the table. For example, you might have `var r = rowClone; r.find("select").remove(); return r;` in the function body. This would remove all `select` tags before appending the row.

#### onSortStart(event, ui)
 - Fed into the jQueryUI sortable function, called when the user begins sorting table rows. Is passed the jQuery event and UI objects

#### onSortFinish(event, ui(
 - Fed into the jQueryUI sortable function, called when the user has finished sorting the table rows. Is passed the jQuery event and UI objects.


 




