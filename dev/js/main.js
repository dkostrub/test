import data from 'data.json';
import '';

var headContent = head(data);
let layout = template(data);

document.head.innerHTML = headContent;
document.body.innerHTML = layout;