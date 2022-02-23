{
    'use strict';

    var getmdlSelect = {
        defaultValue : {
            width: 300
        },
        addEventListeners: function (dropdown) {
            var input = dropdown.querySelector('input');
            var list = dropdown.querySelectorAll('li');
            var menu = dropdown.querySelector('.mdl-js-menu');

            //show menu on mouse down or mouse up
            input.onkeydown = function (event) {
                if (event.keyCode == 38 || event.keyCode == 40) {
                    menu['MaterialMenu'].show();
                }
            };

            //return focus to input
            menu.onkeydown = function (event) {
                if (event.keyCode == 13) {
                    input.focus();
                }
            };

            [].forEach.call(list, function (li) {
                li.onclick = function () {
                    input.value = li.textContent;
                    dropdown.MaterialTextfield.change(li.textContent); // handles css class changes
                    setTimeout( function() {
                        dropdown.MaterialTextfield.updateClasses_(); //update css class
                    }, 250 );

                    // update input with the "id" value
                    input.dataset.val = li.dataset.val || '';

                    if ("createEvent" in document) {
                        var evt = document.createEvent("HTMLEvents");
                        evt.initEvent("change", false, true);
                        menu['MaterialMenu'].hide();
                        input.dispatchEvent(evt);
                    } else {
                        input.fireEvent("onchange");
                    }
                };
            });
        },
        init: function (selector, widthDef) {
            var dropdowns = document.querySelectorAll(selector);
            [].forEach.call(dropdowns, function (i) {
                getmdlSelect.addEventListeners(i);
                var width = widthDef ? widthDef : (i.querySelector('.mdl-menu').offsetWidth ? i.querySelector('.mdl-menu').offsetWidth : getmdlSelect.defaultValue.width);
                i.style.width = width + 'px';
            });
        }
    };
}
