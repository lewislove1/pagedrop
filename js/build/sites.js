(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var account = {
        
        buttonUpdateAccountDetails: document.getElementById('accountDetailsSubmit'),
        buttonUpdateLoginDetails: document.getElementById('accountLoginSubmit'),
        
        init: function() {
            
            $(this.buttonUpdateAccountDetails).on('click', this.updateAccountDetails);
            $(this.buttonUpdateLoginDetails).on('click', this.updateLoginDetails);
                        
        },
        
        
        /*
            updates account details
        */
        updateAccountDetails: function() {
            
            //all fields filled in?
            
            var allGood = 1;
            
            if( $('#account_details input#firstname').val() === '' ) {
                $('#account_details input#firstname').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_details input#firstname').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( $('#account_details input#lastname').val() === '' ) {
                $('#account_details input#lastname').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_details input#lastname').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
		
            if( allGood === 1 ) {

                var theButton = $(this);
                
                //disable button
                $(this).addClass('disabled');
                
                //show loader
                $('#account_details .loader').fadeIn(500);
                
                //remove alerts
                $('#account_details .alerts > *').remove();
                
                $.ajax({
                    url: appUI.siteUrl+"users/uaccount",
                    type: 'post',
                    dataType: 'json',
                    data: $('#account_details').serialize()
                }).done(function(ret){
                    
                    //enable button
                    theButton.removeClass('disabled');
                    
                    //hide loader
                    $('#account_details .loader').hide();
                    $('#account_details .alerts').append( $(ret.responseHTML) );

                    if( ret.responseCode === 1 ) {//success
                        setTimeout(function () { 
                            $('#account_details .alerts > *').fadeOut(500, function () { $(this).remove(); });
                        }, 3000);
                    }
                });

            }
            
        },
        
        
        /*
            updates account login details
        */
        updateLoginDetails: function() {
			
			console.log(appUI);
            
            var allGood = 1;
            
            if( $('#account_login input#email').val() === '' ) {
                $('#account_login input#email').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_login input#email').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( $('#account_login input#password').val() === '' ) {
                $('#account_login input#password').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_login input#password').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( allGood === 1 ) {
                
                var theButton = $(this);

                //disable button
                $(this).addClass('disabled');
                
                //show loader
                $('#account_login .loader').fadeIn(500);
                
                //remove alerts
                $('#account_login .alerts > *').remove();
                
                $.ajax({
                    url: appUI.siteUrl+"users/ulogin",
                    type: 'post',
                    dataType: 'json',
                    data: $('#account_login').serialize()
                }).done(function(ret){
                    
                    //enable button
                    theButton.removeClass('disabled');
                    
                    //hide loader
                    $('#account_login .loader').hide();
                    $('#account_login .alerts').append( $(ret.responseHTML) );
					
                    if( ret.responseCode === 1 ) {//success
                        setTimeout(function () { 
                            $('#account_login .alerts > *').fadeOut(500, function () { $(this).remove(); });
                        }, 3000);
                    }
                
                });
            
            }
            
        }
        
    };
    
    account.init();

}());
},{"./ui.js":7}],2:[function(require,module,exports){
(function () {
	"use strict";

    var siteBuilderUtils = require('./utils.js');
    var bConfig = require('./config.js');
    var appUI = require('./ui.js').appUI;
    var publisher = require('../vendor/publisher');


	 /*
        Basic Builder UI initialisation
    */
    var builderUI = {
        
        allBlocks: {},                                              //holds all blocks loaded from the server
        menuWrapper: document.getElementById('menu'),
        primarySideMenuWrapper: document.getElementById('main'),
        buttonBack: document.getElementById('backButton'),
        buttonBackConfirm: document.getElementById('leavePageButton'),
        
        aceEditors: {},
        frameContents: '',                                      //holds frame contents
        templateID: 0,                                          //holds the template ID for a page (???)
                
        modalDeleteBlock: document.getElementById('deleteBlock'),
        modalResetBlock: document.getElementById('resetBlock'),
        modalDeletePage: document.getElementById('deletePage'),
        buttonDeletePageConfirm: document.getElementById('deletePageConfirm'),
        
        dropdownPageLinks: document.getElementById('internalLinksDropdown'),

        pageInUrl: null,
        
        tempFrame: {},

        currentResponsiveMode: {},
                
        init: function(){
                                                
            //load blocks
            $.getJSON(appUI.baseUrl+'elements.json?v=12345678', function(data){ builderUI.allBlocks = data; builderUI.implementBlocks(); });
            
            //sitebar hover animation action
            $(this.menuWrapper).on('mouseenter', function(){
                
                $(this).stop().animate({'left': '0px'}, 500);
                
            }).on('mouseleave', function(){
                
                $(this).stop().animate({'left': '-190px'}, 500);
                
                $('#menu #main a').removeClass('active');
                $('.menu .second').stop().animate({
                    width: 0
                }, 500, function(){
                    $('#menu #second').hide();
                });
                
            });
            
            //prevent click event on ancors in the block section of the sidebar
            $(this.primarySideMenuWrapper).on('click', 'a:not(.actionButtons)', function(e){e.preventDefault();});
            
            $(this.buttonBack).on('click', this.backButton);
            $(this.buttonBackConfirm).on('click', this.backButtonConfirm);
            
            //notify the user of pending chnages when clicking the back button
            $(window).bind('beforeunload', function(){
                if( site.pendingChanges === true ) {
                    return 'Your site contains changed which haven\'t been saved yet. Are you sure you want to leave?';
                }
            });
                                                
            //URL parameters
            builderUI.pageInUrl = siteBuilderUtils.getParameterByName('p');

        },
        
        
        /*
            builds the blocks into the site bar
        */
        implementBlocks: function() {

            var newItem, loaderFunction;
            
            for( var key in this.allBlocks.elements ) {
                
                var niceKey = key.toLowerCase().replace(" ", "_");
                
                $('<li><a href="" id="'+niceKey+'">'+key+'</a></li>').appendTo('#menu #main ul#elementCats');
                
                for( var x = 0; x < this.allBlocks.elements[key].length; x++ ) {
                    
                    if( this.allBlocks.elements[key][x].thumbnail === null ) {//we'll need an iframe
                        
                        //build us some iframes!
                        
                        if( this.allBlocks.elements[key][x].sandbox ) {
                            
                            if( this.allBlocks.elements[key][x].loaderFunction ) {
                                loaderFunction = 'data-loaderfunction="'+this.allBlocks.elements[key][x].loaderFunction+'"';
                            }
                            
                            newItem = $('<li class="element '+niceKey+'"><iframe src="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" scrolling="no" sandbox="allow-same-origin"></iframe></li>');
                        
                        } else {
                            
                            newItem = $('<li class="element '+niceKey+'"><iframe src="about:blank" scrolling="no"></iframe></li>');
                        
                        }
                        
                        newItem.find('iframe').uniqueId();
                        newItem.find('iframe').attr('src', appUI.baseUrl+this.allBlocks.elements[key][x].url);
                    
                    } else {//we've got a thumbnail
                        
                        if( this.allBlocks.elements[key][x].sandbox ) {
                            
                            if( this.allBlocks.elements[key][x].loaderFunction ) {
                                loaderFunction = 'data-loaderfunction="'+this.allBlocks.elements[key][x].loaderFunction+'"';
                            }
                            
                            newItem = $('<li class="element '+niceKey+'"><img src="'+appUI.baseUrl+this.allBlocks.elements[key][x].thumbnail+'" data-srcc="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" data-height="'+this.allBlocks.elements[key][x].height+'" data-sandbox="" '+loaderFunction+'></li>');
                            
                        } else {
                                
                            newItem = $('<li class="element '+niceKey+'"><img src="'+appUI.baseUrl+this.allBlocks.elements[key][x].thumbnail+'" data-srcc="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" data-height="'+this.allBlocks.elements[key][x].height+'"></li>');
                                
                        }
                    }
                    
                    newItem.appendTo('#menu #second ul#elements');
            
                    //zoomer works

                    var theHeight;
                    
                    if( this.allBlocks.elements[key][x].height ) {
                        
                        theHeight = this.allBlocks.elements[key][x].height*0.25;
                    
                    } else {
                        
                        theHeight = 'auto';
                        
                    }
                    
                    newItem.find('iframe').zoomer({
                        zoom: 0.25,
                        width: 270,
                        height: theHeight,
                        message: "Drag&Drop Me!"
                    });
                
                }
            
            }
            
            //draggables
            builderUI.makeDraggable();
            
        },
                
        
        /*
            event handler for when the back link is clicked
        */
        backButton: function() {
            
            if( site.pendingChanges === true ) {
                $('#backModal').modal('show');
                return false;
            }
            
        },
        
        
        /*
            button for confirming leaving the page
        */
        backButtonConfirm: function() {
            
            site.pendingChanges = false;//prevent the JS alert after confirming user wants to leave
            
        },
                
       
        /*
            makes the blocks and templates in the sidebar draggable onto the canvas
        */
        makeDraggable: function() {
                        
            $('#elements li, #templates li').each(function(){

                $(this).draggable({
                    helper: function() {
                        return $('<div style="height: 100px; width: 300px; background: #F9FAFA; box-shadow: 5px 5px 1px rgba(0,0,0,0.1); text-align: center; line-height: 100px; font-size: 28px; color: #16A085"><span class="fui-list"></span></div>');
                    },
                    revert: 'invalid',
                    appendTo: 'body',
                    connectToSortable: '#pageList > ul',
                    start: function () {
                        site.moveMode('on');
                    },
                    stop: function () {}
                }); 
            
            });
            
            $('#elements li a').each(function(){
                
                $(this).unbind('click').bind('click', function(e){
                    e.preventDefault();
                });
            
            });
            
        },
        
        
        /*
            Implements the site on the canvas, called from the Site object when the siteData has completed loading
        */
        populateCanvas: function() {

            var i,
                counter = 1;
                        
            //loop through the pages
                                    
            for( i in site.pages ) {
                
                var newPage = new Page(i, site.pages[i], counter);
                                            
                counter++;

                //set this page as active?
                if( builderUI.pageInUrl === i ) {
                    newPage.selectPage();
                }
                                
            }
            
            //activate the first page
            if(site.sitePages.length > 0 && builderUI.pageInUrl === null) {
                site.sitePages[0].selectPage();
            }
                                    
        },


        /*
            Canvas loading on/off
        */
        canvasLoading: function (value) {

            if ( value === 'on' && document.getElementById('frameWrapper').querySelectorAll('#canvasOverlay').length === 0 ) {

                var overlay = document.createElement('DIV');

                overlay.style.display = 'flex';
                $(overlay).hide();
                overlay.id = 'canvasOverlay';

                overlay.innerHTML = '<div class="loader"><span>{</span><span>}</span></div>';

                document.getElementById('frameWrapper').appendChild(overlay);

                $('#canvasOverlay').fadeIn(500);

            } else if ( value === 'off' && document.getElementById('frameWrapper').querySelectorAll('#canvasOverlay').length === 1 ) {

                site.loaded();

                $('#canvasOverlay').fadeOut(500, function () {
                    this.remove();
                });

            }

        }
        
    };


    /*
        Page constructor
    */
    function Page (pageName, page, counter) {
    
        this.name = pageName || "";
        this.pageID = page.page_id || 0;
        this.blocks = [];
        this.parentUL = {}; //parent UL on the canvas
        this.status = '';//'', 'new' or 'changed'
        this.scripts = [];//tracks script URLs used on this page
        
        this.pageSettings = {
            title: page.pages_title || '',
            meta_description: page.meta_description || '',
            meta_keywords: page.meta_keywords || '',
            header_includes: page.header_includes || '',
            page_css: page.page_css || ''
        };
                
        this.pageMenuTemplate = '<a href="" class="menuItemLink">page</a><span class="pageButtons"><a href="" class="fileEdit fui-new"></a><a href="" class="fileDel fui-cross"><a class="btn btn-xs btn-primary btn-embossed fileSave fui-check" href="#"></a></span></a></span>';
        
        this.menuItem = {};//reference to the pages menu item for this page instance
        this.linksDropdownItem = {};//reference to the links dropdown item for this page instance
        
        this.parentUL = document.createElement('UL');
        this.parentUL.setAttribute('id', "page"+counter);
                
        /*
            makes the clicked page active
        */
        this.selectPage = function() {
            
            //console.log('select:');
            //console.log(this.pageSettings);
                        
            //mark the menu item as active
            site.deActivateAll();
            $(this.menuItem).addClass('active');
                        
            //let Site know which page is currently active
            site.setActive(this);
            
            //display the name of the active page on the canvas
            site.pageTitle.innerHTML = this.name;
            
            //load the page settings into the page settings modal
            site.inputPageSettingsTitle.value = this.pageSettings.title;
            site.inputPageSettingsMetaDescription.value = this.pageSettings.meta_description;
            site.inputPageSettingsMetaKeywords.value = this.pageSettings.meta_keywords;
            site.inputPageSettingsIncludes.value = this.pageSettings.header_includes;
            site.inputPageSettingsPageCss.value = this.pageSettings.page_css;
                          
            //trigger custom event
            $('body').trigger('changePage');
            
            //reset the heights for the blocks on the current page
            for( var i in this.blocks ) {
                
                if( Object.keys(this.blocks[i].frameDocument).length > 0 ){
                    this.blocks[i].heightAdjustment();
                }
            
            }
            
            //show the empty message?
            this.isEmpty();
                                    
        };
        
        /*
            changed the location/order of a block within a page
        */
        this.setPosition = function(frameID, newPos) {
            
            //we'll need the block object connected to iframe with frameID
            
            for(var i in this.blocks) {
                
                if( this.blocks[i].frame.getAttribute('id') === frameID ) {
                    
                    //change the position of this block in the blocks array
                    this.blocks.splice(newPos, 0, this.blocks.splice(i, 1)[0]);
                    
                }
                
            }
                        
        };
        
        /*
            delete block from blocks array
        */
        this.deleteBlock = function(block) {
            
            //remove from blocks array
            for( var i in this.blocks ) {
                if( this.blocks[i] === block ) {
                    //found it, remove from blocks array
                    this.blocks.splice(i, 1);
                }
            }
            
            site.setPendingChanges(true);
            
        };
        
        /*
            toggles all block frameCovers on this page
        */
        this.toggleFrameCovers = function(onOrOff) {
            
            for( var i in this.blocks ) {
                                 
                this.blocks[i].toggleCover(onOrOff);
                
            }
            
        };
        
        /*
            setup for editing a page name
        */
        this.editPageName = function() {
            
            if( !this.menuItem.classList.contains('edit') ) {
            
                //hide the link
                this.menuItem.querySelector('a.menuItemLink').style.display = 'none';
            
                //insert the input field
                var newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.setAttribute('name', 'page');
                newInput.setAttribute('value', this.name);
                this.menuItem.insertBefore(newInput, this.menuItem.firstChild);
                    
                newInput.focus();
        
                var tmpStr = newInput.getAttribute('value');
                newInput.setAttribute('value', '');
                newInput.setAttribute('value', tmpStr);
                            
                this.menuItem.classList.add('edit');
            
            }
            
        };
        
        /*
            Updates this page's name (event handler for the save button)
        */
        this.updatePageNameEvent = function(el) {
            
            if( this.menuItem.classList.contains('edit') ) {
            
                //el is the clicked button, we'll need access to the input
                var theInput = this.menuItem.querySelector('input[name="page"]');
                
                //make sure the page's name is OK
                if( site.checkPageName(theInput.value) ) {
                   
                    this.name = site.prepPageName( theInput.value );
            
                    this.menuItem.querySelector('input[name="page"]').remove();
                    this.menuItem.querySelector('a.menuItemLink').innerHTML = this.name;
                    this.menuItem.querySelector('a.menuItemLink').style.display = 'block';
            
                    this.menuItem.classList.remove('edit');
                
                    //update the links dropdown item
                    this.linksDropdownItem.text = this.name;
                    this.linksDropdownItem.setAttribute('value', this.name+".html");
                    
                    //update the page name on the canvas
                    site.pageTitle.innerHTML = this.name;
            
                    //changed page title, we've got pending changes
                    site.setPendingChanges(true);
                                        
                } else {
                    
                    alert(site.pageNameError);
                    
                }
                                        
            }
            
        };
        
        /*
            deletes this entire page
        */
        this.delete = function() {
                        
            //delete from the Site
            for( var i in site.sitePages ) {
                
                if( site.sitePages[i] === this ) {//got a match!
                    
                    //delete from site.sitePages
                    site.sitePages.splice(i, 1);
                    
                    //delete from canvas
                    this.parentUL.remove();
                    
                    //add to deleted pages
                    site.pagesToDelete.push(this.name);
                    
                    //delete the page's menu item
                    this.menuItem.remove();
                    
                    //delet the pages link dropdown item
                    this.linksDropdownItem.remove();
                    
                    //activate the first page
                    site.sitePages[0].selectPage();
                    
                    //page was deleted, so we've got pending changes
                    site.setPendingChanges(true);
                    
                }
                
            }
                        
        };
        
        /*
            checks if the page is empty, if so show the 'empty' message
        */
        this.isEmpty = function() {
            
            if( this.blocks.length === 0 ) {
                
                site.messageStart.style.display = 'block';
                site.divFrameWrapper.classList.add('empty');
                             
            } else {
                
                site.messageStart.style.display = 'none';
                site.divFrameWrapper.classList.remove('empty');
                
            }
                        
        };
            
        /*
            preps/strips this page data for a pending ajax request
        */
        this.prepForSave = function() {
            
            var page = {};
                    
            page.name = this.name;
            page.pageSettings = this.pageSettings;
            page.status = this.status;
            page.pageID = this.pageID;
            page.blocks = [];
                    
            //process the blocks
                    
            for( var x = 0; x < this.blocks.length; x++ ) {
                        
                var block = {};
                        
                if( this.blocks[x].sandbox ) {
                            
                    block.frameContent = "<html>"+$('#sandboxes #'+this.blocks[x].sandbox).contents().find('html').html()+"</html>";
                    block.sandbox = true;
                    block.loaderFunction = this.blocks[x].sandbox_loader;
                            
                } else {
                                                        
                    block.frameContent = this.blocks[x].getSource();
                    block.sandbox = false;
                    block.loaderFunction = '';
                            
                }
                        
                block.frameHeight = this.blocks[x].frameHeight;
                block.originalUrl = this.blocks[x].originalUrl;
                if ( this.blocks[x].global ) block.frames_global = true;
                                                                
                page.blocks.push(block);
                        
            }
            
            return page;
            
        };
            
        /*
            generates the full page, using skeleton.html
        */
        this.fullPage = function() {
            
            var page = this;//reference to self for later
            page.scripts = [];//make sure it's empty, we'll store script URLs in there later
                        
            var newDocMainParent = $('iframe#skeleton').contents().find( bConfig.pageContainer );
            
            //empty out the skeleton first
            $('iframe#skeleton').contents().find( bConfig.pageContainer ).html('');
            
            //remove old script tags
            $('iframe#skeleton').contents().find( 'script' ).each(function(){
                $(this).remove();
            });

            var theContents;
                        
            for( var i in this.blocks ) {
                
                //grab the block content
                if (this.blocks[i].sandbox !== false) {
                                
                    theContents = $('#sandboxes #'+this.blocks[i].sandbox).contents().find( bConfig.pageContainer ).clone();
                            
                } else {
                                
                    theContents = $(this.blocks[i].frameDocument.body).find( bConfig.pageContainer ).clone();
                            
                }
                                
                //remove video frameCovers
                theContents.find('.frameCover').each(function () {
                    $(this).remove();
                });
                
                //remove video frameWrappers
                theContents.find('.videoWrapper').each(function(){
                    
                    var cnt = $(this).contents();
                    $(this).replaceWith(cnt);
                    
                });
                
                //remove style leftovers from the style editor
                for( var key in bConfig.editableItems ) {
                                                                
                    theContents.find( key ).each(function(){
                                                                        
                        $(this).removeAttr('data-selector');
                        
                        $(this).css('outline', '');
                        $(this).css('outline-offset', '');
                        $(this).css('cursor', '');
                                                                        
                        if( $(this).attr('style') === '' ) {
                                        
                            $(this).removeAttr('style');
                                    
                        }
                                
                    });
                            
                }
                
                //remove style leftovers from the content editor
                for ( var x = 0; x < bConfig.editableContent.length; ++x) {
                                
                    theContents.find( bConfig.editableContent[x] ).each(function(){
                                    
                        $(this).removeAttr('data-selector');
                                
                    });
                            
                }
                
                //append to DOM in the skeleton
                newDocMainParent.append( $(theContents.html()) );
                
                //do we need to inject any scripts?
                var scripts = $(this.blocks[i].frameDocument.body).find('script');
                var theIframe = document.getElementById("skeleton");
                                            
                if( scripts.size() > 0 ) {
                                
                    scripts.each(function(){

                        var script;
                                    
                        if( $(this).text() !== '' ) {//script tags with content
                                        
                            script = theIframe.contentWindow.document.createElement("script");
                            script.type = 'text/javascript';
                            script.innerHTML = $(this).text();
                                        
                            theIframe.contentWindow.document.body.appendChild(script);
                                    
                        } else if( $(this).attr('src') !== null && page.scripts.indexOf($(this).attr('src')) === -1 ) {
                            //use indexOf to make sure each script only appears on the produced page once
                                        
                            script = theIframe.contentWindow.document.createElement("script");
                            script.type = 'text/javascript';
                            script.src = $(this).attr('src');
                                        
                            theIframe.contentWindow.document.body.appendChild(script);
                            
                            page.scripts.push($(this).attr('src'));
                                    
                        }
                                
                    });
                            
                }
            
            }
                        
        };


        /*
            Checks if all blocks on this page have finished loading
        */
        this.loaded = function () {

            var i;

            for ( i = 0; i <this.blocks.length; i++ ) {

                if ( !this.blocks[i].loaded ) return false;

            }

            return true;

        };
            
        /*
            clear out this page
        */
        this.clear = function() {
            
            var block = this.blocks.pop();
            
            while( block !== undefined ) {
                
                block.delete();
                
                block = this.blocks.pop();
                
            }
                                    
        };


        /*
            Height adjustment for all blocks on the page
        */
        this.heightAdjustment = function () {

            for ( var i = 0; i < this.blocks.length; i++ ) {
                this.blocks[i].heightAdjustment();
            }

        };
         
        
        //loop through the frames/blocks
        
        if( page.hasOwnProperty('blocks') ) {
        
            for( var x = 0; x < page.blocks.length; x++ ) {
            
                //create new Block
            
                var newBlock = new Block();
            
                page.blocks[x].src = appUI.siteUrl+"sites/getframe/"+page.blocks[x].frames_id;
                
                //sandboxed block?
                if( page.blocks[x].frames_sandbox === '1') {
                                        
                    newBlock.sandbox = true;
                    newBlock.sandbox_loader = page.blocks[x].frames_loaderfunction;
                
                }
                
                newBlock.frameID = page.blocks[x].frames_id;
                if ( page.blocks[x].frames_global === '1' ) newBlock.global = true;
                newBlock.createParentLI(page.blocks[x].frames_height);
                newBlock.createFrame(page.blocks[x]);
                newBlock.createFrameCover();
                newBlock.insertBlockIntoDom(this.parentUL);
                                                                    
                //add the block to the new page
                this.blocks.push(newBlock);
                                        
            }
            
        }
        
        //add this page to the site object
        site.sitePages.push( this );
        
        //plant the new UL in the DOM (on the canvas)
        site.divCanvas.appendChild(this.parentUL);
        
        //make the blocks/frames in each page sortable
        
        var thePage = this;
        
        $(this.parentUL).sortable({
            revert: true,
            placeholder: "drop-hover",
            handle: '.dragBlock',
            cancel: '',
            stop: function () {
                site.moveMode('off');
                site.setPendingChanges(true);
                if ( !site.loaded() ) builderUI.canvasLoading('on');
            },
            beforeStop: function(event, ui){
                
                //template or regular block?
                var attr = ui.item.attr('data-frames');

                var newBlock;
                    
                if (typeof attr !== typeof undefined && attr !== false) {//template, build it
                 
                    $('#start').hide();
                                        
                    //clear out all blocks on this page    
                    thePage.clear();
                                            
                    //create the new frames
                    var frameIDs = ui.item.attr('data-frames').split('-');
                    var heights = ui.item.attr('data-heights').split('-');
                    var urls = ui.item.attr('data-originalurls').split('-');
                        
                    for( var x = 0; x < frameIDs.length; x++) {
                                                
                        newBlock = new Block();
                        newBlock.createParentLI(heights[x]);
                        
                        var frameData = {};
                        
                        frameData.src = appUI.siteUrl+'sites/getframe/'+frameIDs[x];
                        frameData.frames_original_url = appUI.siteUrl+'sites/getframe/'+frameIDs[x];
                        frameData.frames_height = heights[x];
                        
                        newBlock.createFrame( frameData );
                        newBlock.createFrameCover();
                        newBlock.insertBlockIntoDom(thePage.parentUL);
                        
                        //add the block to the new page
                        thePage.blocks.push(newBlock);
                        
                        //dropped element, so we've got pending changes
                        site.setPendingChanges(true);
                            
                    }
                
                    //set the tempateID
                    builderUI.templateID = ui.item.attr('data-pageid');
                                                                                    
                    //make sure nothing gets dropped in the lsit
                    ui.item.html(null);
                        
                    //delete drag place holder
                    $('body .ui-sortable-helper').remove();
                    
                } else {//regular block
                
                    //are we dealing with a new block being dropped onto the canvas, or a reordering og blocks already on the canvas?
                
                    if( ui.item.find('.frameCover > button').size() > 0 ) {//re-ordering of blocks on canvas
                    
                        //no need to create a new block object, we simply need to make sure the position of the existing block in the Site object
                        //is changed to reflect the new position of the block on th canvas
                    
                        var frameID = ui.item.find('iframe').attr('id');
                        var newPos = ui.item.index();
                    
                        site.activePage.setPosition(frameID, newPos);
                                        
                    } else {//new block on canvas
                                                
                        //new block                    
                        newBlock = new Block();
                                
                        newBlock.placeOnCanvas(ui);
                                    
                    }
                    
                }
                
            },
            start: function (event, ui) {

                site.moveMode('on');
                    
                if( ui.item.find('.frameCover').size() !== 0 ) {
                    builderUI.frameContents = ui.item.find('iframe').contents().find( bConfig.pageContainer ).html();
                }
            
            },
            over: function(){
                    
                $('#start').hide();
                
            }
        });
        
        //add to the pages menu
        this.menuItem = document.createElement('LI');
        this.menuItem.innerHTML = this.pageMenuTemplate;
        
        $(this.menuItem).find('a:first').text(pageName).attr('href', '#page'+counter);
        
        var theLink = $(this.menuItem).find('a:first').get(0);
        
        //bind some events
        this.menuItem.addEventListener('click', this, false);
        
        this.menuItem.querySelector('a.fileEdit').addEventListener('click', this, false);
        this.menuItem.querySelector('a.fileSave').addEventListener('click', this, false);
        this.menuItem.querySelector('a.fileDel').addEventListener('click', this, false);
        
        //add to the page link dropdown
        this.linksDropdownItem = document.createElement('OPTION');
        this.linksDropdownItem.setAttribute('value', pageName+".html");
        this.linksDropdownItem.text = pageName;
                
        builderUI.dropdownPageLinks.appendChild( this.linksDropdownItem );
        
        site.pagesMenu.appendChild(this.menuItem);
                    
    }
    
    Page.prototype.handleEvent = function(event) {
        switch (event.type) {
            case "click": 
                                
                if( event.target.classList.contains('fileEdit') ) {
                
                    this.editPageName();
                    
                } else if( event.target.classList.contains('fileSave') ) {
                                        
                    this.updatePageNameEvent(event.target);
                
                } else if( event.target.classList.contains('fileDel') ) {
                    
                    var thePage = this;
                
                    $(builderUI.modalDeletePage).modal('show');
                    
                    $(builderUI.modalDeletePage).off('click', '#deletePageConfirm').on('click', '#deletePageConfirm', function() {
                        
                        thePage.delete();
                        
                        $(builderUI.modalDeletePage).modal('hide');
                        
                    });
                                        
                } else {
                    
                    this.selectPage();
                
                }
                
        }
    };


    /*
        Block constructor
    */
    function Block () {
        
        this.frameID = 0;
        this.loaded = false;
        this.sandbox = false;
        this.sandbox_loader = '';
        this.status = '';//'', 'changed' or 'new'
        this.global = false;
        this.originalUrl = '';
        
        this.parentLI = {};
        this.frameCover = {};
        this.frame = {};
        this.frameDocument = {};
        this.frameHeight = 0;
        
        this.annot = {};
        this.annotTimeout = {};
        
        /*
            creates the parent container (LI)
        */
        this.createParentLI = function(height) {
            
            this.parentLI = document.createElement('LI');
            this.parentLI.setAttribute('class', 'element');
            //this.parentLI.setAttribute('style', 'height: '+height+'px');
            
        };
        
        /*
            creates the iframe on the canvas
        */
        this.createFrame = function(frame) {
                        
            this.frame = document.createElement('IFRAME');
            this.frame.setAttribute('frameborder', 0);
            this.frame.setAttribute('scrolling', 0);
            this.frame.setAttribute('src', frame.src);
            this.frame.setAttribute('data-originalurl', frame.frames_original_url);
            this.originalUrl = frame.frames_original_url;
            //this.frame.setAttribute('data-height', frame.frames_height);
            //this.frameHeight = frame.frames_height;
                        
            $(this.frame).uniqueId();
            
            //sandbox?
            if( this.sandbox !== false ) {
                            
                this.frame.setAttribute('data-loaderfunction', this.sandbox_loader);
                this.frame.setAttribute('data-sandbox', this.sandbox);
                            
                //recreate the sandboxed iframe elsewhere
                var sandboxedFrame = $('<iframe src="'+frame.src+'" id="'+this.sandbox+'" sandbox="allow-same-origin"></iframe>');
                $('#sandboxes').append( sandboxedFrame );
                            
            }
                        
        };
            
        /*
            insert the iframe into the DOM on the canvas
        */
        this.insertBlockIntoDom = function(theUL) {
            
            this.parentLI.appendChild(this.frame);
            theUL.appendChild( this.parentLI );
            
            this.frame.addEventListener('load', this, false);

            builderUI.canvasLoading('on');
            
        };
            
        /*
            sets the frame document for the block's iframe
        */
        this.setFrameDocument = function() {
            
            //set the frame document as well
            if( this.frame.contentDocument ) {
                this.frameDocument = this.frame.contentDocument;   
            } else {
                this.frameDocument = this.frame.contentWindow.document;
            }
            
            //this.heightAdjustment();
                                    
        };
        
        /*
            creates the frame cover and block action button
        */
        this.createFrameCover = function() {
            
            //build the frame cover and block action buttons
            this.frameCover = document.createElement('DIV');
            this.frameCover.classList.add('frameCover');
            this.frameCover.classList.add('fresh');
                    
            var delButton = document.createElement('BUTTON');
            delButton.setAttribute('class', 'btn btn-inverse btn-sm deleteBlock');
            delButton.setAttribute('type', 'button');
            delButton.innerHTML = '<i class="fui-trash"></i> <span>remove</span>';
            delButton.addEventListener('click', this, false);
                    
            var resetButton = document.createElement('BUTTON');
            resetButton.setAttribute('class', 'btn btn-inverse btn-sm resetBlock');
            resetButton.setAttribute('type', 'button');
            resetButton.innerHTML = '<i class="fa fa-refresh"></i> <span>reset</span>';
            resetButton.addEventListener('click', this, false);
                    
            var htmlButton = document.createElement('BUTTON');
            htmlButton.setAttribute('class', 'btn btn-inverse btn-sm htmlBlock');
            htmlButton.setAttribute('type', 'button');
            htmlButton.innerHTML = '<i class="fa fa-code"></i> <span>source</span>';
            htmlButton.addEventListener('click', this, false);

            var dragButton = document.createElement('BUTTON');
            dragButton.setAttribute('class', 'btn btn-inverse btn-sm dragBlock');
            dragButton.setAttribute('type', 'button');
            dragButton.innerHTML = '<i class="fa fa-arrows"></i> <span>Move</span>';
            dragButton.addEventListener('click', this, false);

            var globalLabel = document.createElement('LABEL');
            globalLabel.classList.add('checkbox');
            globalLabel.classList.add('primary');
            var globalCheckbox = document.createElement('INPUT');
            globalCheckbox.type = 'checkbox';
            globalCheckbox.setAttribute('data-toggle', 'checkbox');
            globalCheckbox.checked = this.global;
            globalLabel.appendChild(globalCheckbox);
            var globalText = document.createTextNode('Global');
            globalLabel.appendChild(globalText);

            var trigger = document.createElement('span');
            trigger.classList.add('fui-gear');
                    
            this.frameCover.appendChild(delButton);
            this.frameCover.appendChild(resetButton);
            this.frameCover.appendChild(htmlButton);
            this.frameCover.appendChild(dragButton);
            this.frameCover.appendChild(globalLabel);
            this.frameCover.appendChild(trigger);
                            
            this.parentLI.appendChild(this.frameCover);

            var theBlock = this;

            $(globalCheckbox).on('change', function (e) {

                theBlock.toggleGlobal(e);

            }).radiocheck();
                                                        
        };


        /*
            
        */
        this.toggleGlobal = function (e) {

            if ( e.currentTarget.checked ) this.global = true;
            else this.global = false;

            //we've got pending changes
            site.setPendingChanges(true);

            console.log(this);

        };

            
        /*
            automatically corrects the height of the block's iframe depending on its content
        */
        this.heightAdjustment = function() {
            
            if ( Object.keys(this.frameDocument).length !== 0 ) {

                var height,
                    bodyHeight = this.frameDocument.body.offsetHeight,
                    pageContainerHeight = this.frameDocument.body.querySelector( bConfig.pageContainer ).offsetHeight;

                if ( bodyHeight > pageContainerHeight && !this.frameDocument.body.classList.contains( bConfig.bodyPaddingClass ) ) height = pageContainerHeight;
                else height = bodyHeight;

                this.frame.style.height = height+"px";
                this.parentLI.style.height = height+"px";
                //this.frameCover.style.height = height+"px";
                
                this.frameHeight = height;

            }
                                                                                    
        };
            
        /*
            deletes a block
        */
        this.delete = function() {
                        
            //remove from DOM/canvas with a nice animation
            $(this.frame.parentNode).fadeOut(500, function(){
                    
                this.remove();
                    
                site.activePage.isEmpty();
                
            });
            
            //remove from blocks array in the active page
            site.activePage.deleteBlock(this);
            
            //sanbox
            if( this.sanbdox ) {
                document.getElementById( this.sandbox ).remove();   
            }
            
            //element was deleted, so we've got pending change
            site.setPendingChanges(true);
                        
        };
            
        /*
            resets a block to it's orignal state
        */
        this.reset = function (fireEvent) {

            if ( typeof fireEvent === 'undefined') fireEvent = true;
            
            //reset frame by reloading it
            this.frame.contentWindow.location = this.frame.getAttribute('data-originalurl');
            
            //sandbox?
            if( this.sandbox ) {
                var sandboxFrame = document.getElementById(this.sandbox).contentWindow.location.reload();  
            }
            
            //element was deleted, so we've got pending changes
            site.setPendingChanges(true);

            builderUI.canvasLoading('on');

            if ( fireEvent ) publisher.publish('onBlockChange', this, 'reload');
            
        };
            
        /*
            launches the source code editor
        */
        this.source = function() {
            
            //hide the iframe
            this.frame.style.display = 'none';
            
            //disable sortable on the parentLI
            $(this.parentLI.parentNode).sortable('disable');
            
            //built editor element
            var theEditor = document.createElement('DIV');
            theEditor.classList.add('aceEditor');
            $(theEditor).uniqueId();
            
            this.parentLI.appendChild(theEditor);
            
            //build and append error drawer
            var newLI = document.createElement('LI');
            var errorDrawer = document.createElement('DIV');
            errorDrawer.classList.add('errorDrawer');
            errorDrawer.setAttribute('id', 'div_errorDrawer');
            errorDrawer.innerHTML = '<button type="button" class="btn btn-xs btn-embossed btn-default button_clearErrorDrawer" id="button_clearErrorDrawer">CLEAR</button>';
            newLI.appendChild(errorDrawer);
            errorDrawer.querySelector('button').addEventListener('click', this, false);
            this.parentLI.parentNode.insertBefore(newLI, this.parentLI.nextSibling);
            
            ace.config.set("basePath", "/js/vendor/ace");
            
            var theId = theEditor.getAttribute('id');
            var editor = ace.edit( theId );

            //editor.getSession().setUseWrapMode(true);
            
            var pageContainer = this.frameDocument.querySelector( bConfig.pageContainer );
            var theHTML = pageContainer.innerHTML;
            

            editor.setValue( theHTML );
            editor.setTheme("ace/theme/twilight");
            editor.getSession().setMode("ace/mode/html");
            
            var block = this;
            
            
            editor.getSession().on("changeAnnotation", function(){
                
                block.annot = editor.getSession().getAnnotations();
                
                clearTimeout(block.annotTimeout);

                var timeoutCount;
                
                if( $('#div_errorDrawer p').size() === 0 ) {
                    timeoutCount = bConfig.sourceCodeEditSyntaxDelay;
                } else {
                    timeoutCount = 100;
                }
                
                block.annotTimeout = setTimeout(function(){
                                                            
                    for (var key in block.annot){
                    
                        if (block.annot.hasOwnProperty(key)) {
                        
                            if( block.annot[key].text !== "Start tag seen without seeing a doctype first. Expected e.g. <!DOCTYPE html>." ) {
                            
                                var newLine = $('<p></p>');
                                var newKey = $('<b>'+block.annot[key].type+': </b>');
                                var newInfo = $('<span> '+block.annot[key].text + "on line " + " <b>" + block.annot[key].row+'</b></span>');
                                newLine.append( newKey );
                                newLine.append( newInfo );
                    
                                $('#div_errorDrawer').append( newLine );
                        
                            }
                    
                        }
                
                    }
                
                    if( $('#div_errorDrawer').css('display') === 'none' && $('#div_errorDrawer').find('p').size() > 0 ) {
                        $('#div_errorDrawer').slideDown();
                    }
                        
                }, timeoutCount);
                
            
            });
            
            //buttons
            var cancelButton = document.createElement('BUTTON');
            cancelButton.setAttribute('type', 'button');
            cancelButton.classList.add('btn');
            cancelButton.classList.add('btn-danger');
            cancelButton.classList.add('editCancelButton');
            cancelButton.classList.add('btn-sm');
            cancelButton.innerHTML = '<i class="fui-cross"></i> <span>Cancel</span>';
            cancelButton.addEventListener('click', this, false);
            
            var saveButton = document.createElement('BUTTON');
            saveButton.setAttribute('type', 'button');
            saveButton.classList.add('btn');
            saveButton.classList.add('btn-primary');
            saveButton.classList.add('editSaveButton');
            saveButton.classList.add('btn-sm');
            saveButton.innerHTML = '<i class="fui-check"></i> <span>Save</span>';
            saveButton.addEventListener('click', this, false);
            
            var buttonWrapper = document.createElement('DIV');
            buttonWrapper.classList.add('editorButtons');
            
            buttonWrapper.appendChild( cancelButton );
            buttonWrapper.appendChild( saveButton );
            
            this.parentLI.appendChild( buttonWrapper );
            
            builderUI.aceEditors[ theId ] = editor;
            
        };
            
        /*
            cancels the block source code editor
        */
        this.cancelSourceBlock = function() {

            //enable draggable on the LI
            $(this.parentLI.parentNode).sortable('enable');
		
            //delete the errorDrawer
            $(this.parentLI.nextSibling).remove();
        
            //delete the editor
            this.parentLI.querySelector('.aceEditor').remove();
            $(this.frame).fadeIn(500);
                        
            $(this.parentLI.querySelector('.editorButtons')).fadeOut(500, function(){
                $(this).remove();
            });
            
        };
            
        /*
            updates the blocks source code
        */
        this.saveSourceBlock = function() {
            
            //enable draggable on the LI
            $(this.parentLI.parentNode).sortable('enable');
            
            var theId = this.parentLI.querySelector('.aceEditor').getAttribute('id');
            var theContent = builderUI.aceEditors[theId].getValue();
            
            //delete the errorDrawer
            document.getElementById('div_errorDrawer').parentNode.remove();
            
            //delete the editor
            this.parentLI.querySelector('.aceEditor').remove();
            
            //update the frame's content
            this.frameDocument.querySelector( bConfig.pageContainer ).innerHTML = theContent;
            this.frame.style.display = 'block';
            
            //sandboxed?
            if( this.sandbox ) {
                
                var sandboxFrame = document.getElementById( this.sandbox );
                var sandboxFrameDocument = sandboxFrame.contentDocument || sandboxFrame.contentWindow.document;
                
                builderUI.tempFrame = sandboxFrame;
                
                sandboxFrameDocument.querySelector( bConfig.pageContainer ).innerHTML = theContent;
                                
                //do we need to execute a loader function?
                if( this.sandbox_loader !== '' ) {
                    
                    /*
                    var codeToExecute = "sandboxFrame.contentWindow."+this.sandbox_loader+"()";
                    var tmpFunc = new Function(codeToExecute);
                    tmpFunc();
                    */
                    
                }
                
            }
            
            $(this.parentLI.querySelector('.editorButtons')).fadeOut(500, function(){
                $(this).remove();
            });
            
            //adjust height of the frame
            this.heightAdjustment();
            
            //new page added, we've got pending changes
            site.setPendingChanges(true);
            
            //block has changed
            this.status = 'changed';

            publisher.publish('onBlockChange', this, 'change');
            publisher.publish('onBlockLoaded', this);

        };
            
        /*
            clears out the error drawer
        */
        this.clearErrorDrawer = function() {
            
            var ps = this.parentLI.nextSibling.querySelectorAll('p');
                        
            for( var i = 0; i < ps.length; i++ ) {
                ps[i].remove();  
            }
                        
        };
            
        /*
            toggles the visibility of this block's frameCover
        */
        this.toggleCover = function(onOrOff) {
            
            if( onOrOff === 'On' ) {
                
                this.parentLI.querySelector('.frameCover').style.display = 'block';
                
            } else if( onOrOff === 'Off' ) {
             
                this.parentLI.querySelector('.frameCover').style.display = 'none';
                
            }
            
        };
            
        /*
            returns the full source code of the block's frame
        */
        this.getSource = function() {
            
            var source = "<html>";
            source += this.frameDocument.head.outerHTML;
            source += this.frameDocument.body.outerHTML;
            
            return source;
            
        };
            
        /*
            places a dragged/dropped block from the left sidebar onto the canvas
        */
        this.placeOnCanvas = function(ui) {
            
            //frame data, we'll need this before messing with the item's content HTML
            var frameData = {}, attr;
                
            if( ui.item.find('iframe').size() > 0 ) {//iframe thumbnail
                    
                frameData.src = ui.item.find('iframe').attr('src');
                frameData.frames_original_url = ui.item.find('iframe').attr('src');
                frameData.frames_height = ui.item.height();
                    
                //sandboxed block?
                attr = ui.item.find('iframe').attr('sandbox');
                                
                if (typeof attr !== typeof undefined && attr !== false) {
                    this.sandbox = siteBuilderUtils.getRandomArbitrary(10000, 1000000000);
                    this.sandbox_loader = ui.item.find('iframe').attr('data-loaderfunction');
                }
                                        
            } else {//image thumbnail
                    
                frameData.src = ui.item.find('img').attr('data-srcc');
                frameData.frames_original_url = ui.item.find('img').attr('data-srcc');
                frameData.frames_height = ui.item.find('img').attr('data-height');
                                    
                //sandboxed block?
                attr = ui.item.find('img').attr('data-sandbox');
                                
                if (typeof attr !== typeof undefined && attr !== false) {
                    this.sandbox = siteBuilderUtils.getRandomArbitrary(10000, 1000000000);
                    this.sandbox_loader = ui.item.find('img').attr('data-loaderfunction');
                }
                    
            }                
                                
            //create the new block object
            this.frameID = 0;
            this.parentLI = ui.item.get(0);
            this.parentLI.innerHTML = '';
            this.status = 'new';
            this.createFrame(frameData);
            this.parentLI.style.height = this.frameHeight+"px";
            this.createFrameCover();
                
            this.frame.addEventListener('load', this);
                
            //insert the created iframe
            ui.item.append($(this.frame));
                                           
            //add the block to the current page
            site.activePage.blocks.splice(ui.item.index(), 0, this);
                
            //custom event
            ui.item.find('iframe').trigger('canvasupdated');
                                
            //dropped element, so we've got pending changes
            site.setPendingChanges(true);
            
        };

        /*
            injects external JS (defined in config.js) into the block
        */
        this.loadJavascript = function () {

            var i,
                old,
                newScript;

            //remove old ones
            old = this.frameDocument.querySelectorAll('script.builder');

            for ( i = 0; i < old.length; i++ ) old[i].remove();

            //inject
            for ( i = 0; i < bConfig.externalJS.length; i++ ) {
                
                newScript = document.createElement('SCRIPT');
                newScript.classList.add('builder');
                newScript.src = bConfig.externalJS[i];

                this.frameDocument.querySelector('body').appendChild(newScript);
            
            }

        };


        /*
            Checks if this block has external stylesheet
        */
        this.hasExternalCSS = function (src) {

            var externalCss,
                x;

            externalCss = this.frameDocument.querySelectorAll('link[href*="' + src + '"]');

            return externalCss.length !== 0;

        };
        
    }
    
    Block.prototype.handleEvent = function(event) {
        switch (event.type) {
            case "load": 
                this.setFrameDocument();
                this.heightAdjustment();
                this.loadJavascript();
                
                $(this.frameCover).removeClass('fresh', 500);

                publisher.publish('onBlockLoaded', this);

                this.loaded = true;

                builderUI.canvasLoading('off');

                break;
                
            case "click":
                
                var theBlock = this;
                
                //figure out what to do next
                
                if( event.target.classList.contains('deleteBlock') || event.target.parentNode.classList.contains('deleteBlock') ) {//delete this block
                    
                    $(builderUI.modalDeleteBlock).modal('show');                    
                    
                    $(builderUI.modalDeleteBlock).off('click', '#deleteBlockConfirm').on('click', '#deleteBlockConfirm', function(){
                        theBlock.delete(event);
                        $(builderUI.modalDeleteBlock).modal('hide');
                    });
                    
                } else if( event.target.classList.contains('resetBlock') || event.target.parentNode.classList.contains('resetBlock') ) {//reset the block
                    
                    $(builderUI.modalResetBlock).modal('show'); 
                    
                    $(builderUI.modalResetBlock).off('click', '#resetBlockConfirm').on('click', '#resetBlockConfirm', function(){
                        theBlock.reset();
                        $(builderUI.modalResetBlock).modal('hide');
                    });
                       
                } else if( event.target.classList.contains('htmlBlock') || event.target.parentNode.classList.contains('htmlBlock') ) {//source code editor
                    
                    theBlock.source();
                    
                } else if( event.target.classList.contains('editCancelButton') || event.target.parentNode.classList.contains('editCancelButton') ) {//cancel source code editor
                    
                    theBlock.cancelSourceBlock();
                    
                } else if( event.target.classList.contains('editSaveButton') || event.target.parentNode.classList.contains('editSaveButton') ) {//save source code
                    
                    theBlock.saveSourceBlock();
                    
                } else if( event.target.classList.contains('button_clearErrorDrawer') ) {//clear error drawer
                    
                    theBlock.clearErrorDrawer();
                    
                }
                
        }
    };


    /*
        Site object literal
    */
    /*jshint -W003 */
    var site = {
        
        pendingChanges: false,      //pending changes or no?
        pages: {},                  //array containing all pages, including the child frames, loaded from the server on page load
        is_admin: 0,                //0 for non-admin, 1 for admin
        data: {},                   //container for ajax loaded site data
        pagesToDelete: [],          //contains pages to be deleted
                
        sitePages: [],              //this is the only var containing the recent canvas contents
        
        sitePagesReadyForServer: {},     //contains the site data ready to be sent to the server
        
        activePage: {},             //holds a reference to the page currently open on the canvas
        
        pageTitle: document.getElementById('pageTitle'),//holds the page title of the current page on the canvas
        
        divCanvas: document.getElementById('pageList'),//DIV containing all pages on the canvas
        
        pagesMenu: document.getElementById('pages'), //UL containing the pages menu in the sidebar
                
        buttonNewPage: document.getElementById('addPage'),
        liNewPage: document.getElementById('newPageLI'),
        
        inputPageSettingsTitle: document.getElementById('pageData_title'),
        inputPageSettingsMetaDescription: document.getElementById('pageData_metaDescription'),
        inputPageSettingsMetaKeywords: document.getElementById('pageData_metaKeywords'),
        inputPageSettingsIncludes: document.getElementById('pageData_headerIncludes'),
        inputPageSettingsPageCss: document.getElementById('pageData_headerCss'),
        
        buttonSubmitPageSettings: document.getElementById('pageSettingsSubmittButton'),
        
        modalPageSettings: document.getElementById('pageSettingsModal'),
        
        buttonSave: document.getElementById('savePage'),
        
        messageStart: document.getElementById('start'),
        divFrameWrapper: document.getElementById('frameWrapper'),
        
        skeleton: document.getElementById('skeleton'),
		
		autoSaveTimer: {},
        
        init: function() {
                        
            $.getJSON(appUI.siteUrl+"sites/siteData", function(data){
                
                if( data.site !== undefined ) {
                    site.data = data.site;
                }
                if( data.pages !== undefined ) {
                    site.pages = data.pages;
                }
                
                site.is_admin = data.is_admin;
                
				if( $('#pageList').size() > 0 ) {
                	builderUI.populateCanvas();
				}

                if( data.site.viewmode ) {
                    publisher.publish('onSetMode', data.site.viewmode);
                }
                
                //fire custom event
                $('body').trigger('siteDataLoaded');
                
            });
            
            $(this.buttonNewPage).on('click', site.newPage);
            $(this.modalPageSettings).on('show.bs.modal', site.loadPageSettings);
            $(this.buttonSubmitPageSettings).on('click', site.updatePageSettings);
            $(this.buttonSave).on('click', function(){site.save(true);});
            
            //auto save time 
            this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);

            publisher.subscribe('onBlockChange', function (block, type) {

                if ( block.global ) {

                    for ( var i = 0; i < site.sitePages.length; i++ ) {

                        for ( var y = 0; y < site.sitePages[i].blocks.length; y ++ ) {

                            if ( site.sitePages[i].blocks[y] !== block && site.sitePages[i].blocks[y].originalUrl === block.originalUrl && site.sitePages[i].blocks[y].global ) {

                                if ( type === 'change' ) {

                                    site.sitePages[i].blocks[y].frameDocument.body = block.frameDocument.body.cloneNode(true);

                                    publisher.publish('onBlockLoaded', site.sitePages[i].blocks[y]);

                                } else if ( type === 'reload' ) {

                                    site.sitePages[i].blocks[y].reset(false);

                                }

                            }

                        }

                    }

                }

            });
                            
        },
        
        autoSave: function(){
                                    
            if(site.pendingChanges) {
                site.save(false);
            }
			
			window.clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
        
        },
                
        setPendingChanges: function(value) {
                        
            this.pendingChanges = value;
            
            if( value === true ) {
				
				//reset timer
				window.clearInterval(this.autoSaveTimer);
            	this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
                
                $('#savePage .bLabel').text("Save now (!)");
                
                if( site.activePage.status !== 'new' ) {
                
                    site.activePage.status = 'changed';
                    
                }
			
            } else {
	
                $('#savePage .bLabel').text("Nothing to save");
				
                site.updatePageStatus('');

            }
            
        },
                   
        save: function(showConfirmModal) {

            publisher.publish('onBeforeSave');
                                    
            //fire custom event
            $('body').trigger('beforeSave');

            //disable button
            $("a#savePage").addClass('disabled');
	
            //remove old alerts
            $('#errorModal .modal-body > *, #successModal .modal-body > *').each(function(){
                $(this).remove();
            });
	
            site.prepForSave(false);
            
            var serverData = {};
            serverData.pages = this.sitePagesReadyForServer;
            if( this.pagesToDelete.length > 0 ) {
                serverData.toDelete = this.pagesToDelete;
            }

            serverData.siteData = this.data;

            //store current responsive mode as well
            serverData.siteData.responsiveMode = builderUI.currentResponsiveMode;

            $.ajax({
                url: appUI.siteUrl+"sites/save",
                type: "POST",
                dataType: "json",
                data: serverData,
            }).done(function(res){
	
                //enable button
                $("a#savePage").removeClass('disabled');
	
                if( res.responseCode === 0 ) {
			
                    if( showConfirmModal ) {
				
                        $('#errorModal .modal-body').append( $(res.responseHTML) );
                        $('#errorModal').modal('show');
				
                    }
		
                } else if( res.responseCode === 1 ) {
		
                    if( showConfirmModal ) {
		
                        $('#successModal .modal-body').append( $(res.responseHTML) );
                        $('#successModal').modal('show');
				
                    }
			
			
                    //no more pending changes
                    site.setPendingChanges(false);
			

                    //update revisions?
                    $('body').trigger('changePage');
                
                }
            });
    
        },
        
        /*
            preps the site data before sending it to the server
        */
        prepForSave: function(template) {
            
            this.sitePagesReadyForServer = {};
            
            if( template ) {//saving template, only the activePage is needed
                
                this.sitePagesReadyForServer[this.activePage.name] = this.activePage.prepForSave();
                
                this.activePage.fullPage();
                
            } else {//regular save
            
                //find the pages which need to be send to the server
                for( var i = 0; i < this.sitePages.length; i++ ) {
                                
                    if( this.sitePages[i].status !== '' ) {
                                    
                        this.sitePagesReadyForServer[this.sitePages[i].name] = this.sitePages[i].prepForSave();
                    
                    }
                
                }
            
            }
                                                                            
        },
        
        
        /*
            sets a page as the active one
        */
        setActive: function(page) {
            
            //reference to the active page
            this.activePage = page;
            
            //hide other pages
            for(var i in this.sitePages) {
                this.sitePages[i].parentUL.style.display = 'none';   
            }
            
            //display active one
            this.activePage.parentUL.style.display = 'block';
            
        },
        
        
        /*
            de-active all page menu items
        */
        deActivateAll: function() {
            
            var pages = this.pagesMenu.querySelectorAll('li');
            
            for( var i = 0; i < pages.length; i++ ) {
                pages[i].classList.remove('active');
            }
            
        },
        
        
        /*
            adds a new page to the site
        */
        newPage: function() {
            
            site.deActivateAll();
            
            //create the new page instance
            
            var pageData = [];
            var temp = {
                pages_id: 0
            };
            pageData[0] = temp;
            
            var newPageName = 'page'+(site.sitePages.length+1);
            
            var newPage = new Page(newPageName, pageData, site.sitePages.length+1);
            
            newPage.status = 'new';
            
            newPage.selectPage();
            newPage.editPageName();
        
            newPage.isEmpty();
                        
            site.setPendingChanges(true);
                                    
        },
        
        
        /*
            checks if the name of a page is allowed
        */
        checkPageName: function(pageName) {
            
            //make sure the name is unique
            for( var i in this.sitePages ) {
                
                if( this.sitePages[i].name === pageName && this.activePage !== this.sitePages[i] ) {
                    this.pageNameError = "The page name must be unique.";
                    return false;
                }   
                
            }
            
            return true;
            
        },
        
        
        /*
            removes unallowed characters from the page name
        */
        prepPageName: function(pageName) {
            
            pageName = pageName.replace(' ', '');
            pageName = pageName.replace(/[?*!.|&#;$%@"<>()+,]/g, "");
            
            return pageName;
            
        },
        
        
        /*
            save page settings for the current page
        */
        updatePageSettings: function() {
            
            site.activePage.pageSettings.title = site.inputPageSettingsTitle.value;
            site.activePage.pageSettings.meta_description = site.inputPageSettingsMetaDescription.value;
            site.activePage.pageSettings.meta_keywords = site.inputPageSettingsMetaKeywords.value;
            site.activePage.pageSettings.header_includes = site.inputPageSettingsIncludes.value;
            site.activePage.pageSettings.page_css = site.inputPageSettingsPageCss.value;
                        
            site.setPendingChanges(true);
            
            $(site.modalPageSettings).modal('hide');
            
        },
        
        
        /*
            update page statuses
        */
        updatePageStatus: function(status) {
            
            for( var i in this.sitePages ) {
                this.sitePages[i].status = status;   
            }
            
        },


        /*
            Checks all the blocks in this site have finished loading
        */
        loaded: function () {

            var i;

            for ( i = 0; i < this.sitePages.length; i++ ) {

                if ( !this.sitePages[i].loaded() ) return false;

            }

            return true;

        },


        /*
            Make every block have an overlay during dragging to prevent mouse event issues
        */
        moveMode: function (value) {

            var i;

            for ( i = 0; i < this.activePage.blocks.length; i++ ) {

                if ( value === 'on' ) this.activePage.blocks[i].frameCover.classList.add('move');
                else if ( value === 'off' ) this.activePage.blocks[i].frameCover.classList.remove('move');

            }

        }
    
    };

    builderUI.init(); site.init();

    
    //**** EXPORTS
    module.exports.site = site;
    module.exports.builderUI = builderUI;

}());
},{"../vendor/publisher":10,"./config.js":3,"./ui.js":7,"./utils.js":8}],3:[function(require,module,exports){
(function () {
	"use strict";
        
    module.exports.pageContainer = "#page";

    module.exports.bodyPaddingClass = "bPadding";
    
    module.exports.editableItems = {
        'span.fa': ['color', 'font-size'],
        '.bg.bg1': ['background-color'],
        'nav a': ['color', 'font-weight', 'text-transform'],
        'img': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-color', 'border-style', 'border-width'],
        'hr.dashed': ['border-color', 'border-width'],
        '.divider > span': ['color', 'font-size'],
        'hr.shadowDown': ['margin-top', 'margin-bottom'],
        '.footer a': ['color'],
        '.social a': ['color'],
        '.bg.bg1, .bg.bg2, .header10, .header11': ['background-image', 'background-color'],
        '.frameCover': [],
        '.editContent': ['content', 'color', 'font-size', 'background-color', 'font-family'],
        'a.btn, button.btn': ['border-radius', 'font-size', 'background-color'],
        '#pricing_table2 .pricing2 .bottom li': ['content']
    };
    
    module.exports.editableItemOptions = {
        'nav a : font-weight': ['400', '700'],
        'a.btn : border-radius': ['0px', '4px', '10px'],
        'img : border-style': ['none', 'dotted', 'dashed', 'solid'],
        'img : border-width': ['1px', '2px', '3px', '4px'],
        'h1, h2, h3, h4, h5, p : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman'],
        'h2 : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman'],
        'h3 : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman'],
        'p : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman']
    };

    module.exports.responsiveModes = {
        desktop: '97%',
        mobile: '480px',
        tablet: '1024px'
    };

    module.exports.editableContent = ['.editContent', '.navbar a', 'button', 'a.btn', '.footer a:not(.fa)', '.tableWrapper', 'h1', 'h2'];

    module.exports.autoSaveTimeout = 300000;
    
    module.exports.sourceCodeEditSyntaxDelay = 10000;

    module.exports.mediumCssUrls = [
        '//cdn.jsdelivr.net/medium-editor/latest/css/medium-editor.min.css',
        '/css/medium-bootstrap.css'
    ];
    module.exports.mediumButtons = ['bold', 'italic', 'underline', 'anchor', 'orderedlist', 'unorderedlist', 'h1', 'h2', 'h3', 'h4', 'removeFormat'];

    module.exports.externalJS = [
        'js/builder_in_block.js'
    ];
                    
}());
},{}],4:[function(require,module,exports){
(function () {
	"use strict";

	var bConfig = require('./config.js');
	var siteBuilder = require('./builder.js');
	var appUI = require('./ui.js').appUI;

	var publish = {
        
        buttonPublish: document.getElementById('publishPage'),
        buttonSavePendingBeforePublishing: document.getElementById('buttonSavePendingBeforePublishing'),
        publishModal: document.getElementById('publishModal'),
        buttonPublishSubmit: document.getElementById('publishSubmit'),
        publishActive: 0,
        theItem: {},
        modalSiteSettings: document.getElementById('siteSettings'),
    
        init: function() {
        
            $(this.buttonPublish).on('click', this.loadPublishModal);
            $(this.buttonSavePendingBeforePublishing).on('click', this.saveBeforePublishing);
            $(this.publishModal).on('change', 'input[type=checkbox]', this.publishCheckboxEvent);
            $(this.buttonPublishSubmit).on('click', this.publishSite);
            $(this.modalSiteSettings).on('click', '#siteSettingsBrowseFTPButton, .link', this.browseFTP);
            $(this.modalSiteSettings).on('click', '#ftpListItems .close', this.closeFtpBrowser);
            $(this.modalSiteSettings).on('click', '#siteSettingsTestFTP', this.testFTPConnection);
            
            //show the publish button
            $(this.buttonPublish).show();
            
            //listen to site settings load event
            $('body').on('siteSettingsLoad', this.showPublishSettings);
            
            //publish hash?
            if( window.location.hash === "#publish" ) {
                $(this.buttonPublish).click();
            }
            
            // header tooltips
            //if( this.buttonPublish.hasAttribute('data-toggle') && this.buttonPublish.getAttribute('data-toggle') == 'tooltip' ) {
            //   $(this.buttonPublish).tooltip('show');
            //   setTimeout(function(){$(this.buttonPublish).tooltip('hide')}, 5000);
            //}
            
        },
        
        
        /*
            loads the publish modal
        */
        loadPublishModal: function(e) {
            
            e.preventDefault();
            
            if( publish.publishActive === 0 ) {//check if we're currently publishing anything
		
                //hide alerts
                $('#publishModal .modal-alerts > *').each(function(){
                    $(this).remove();
                });
                
                $('#publishModal .modal-body > .alert-success').hide();
                
                //hide loaders
                $('#publishModal_assets .publishing').each(function(){
                    $(this).hide();
                    $(this).find('.working').show();
                    $(this).find('.done').hide();
                });
                
                //remove published class from asset checkboxes
                $('#publishModal_assets input').each(function(){
                    $(this).removeClass('published');
                });
                
                //do we have pending changes?
                if( siteBuilder.site.pendingChanges === true ) {//we've got changes, save first
                    
                    $('#publishModal #publishPendingChangesMessage').show();
                    $('#publishModal .modal-body-content').hide();
		
                } else {//all set, get on it with publishing
                    
                    //get the correct pages in the Pages section of the publish modal
                    $('#publishModal_pages tbody > *').remove();

                    $('#pages li:visible').each(function(){
                        
                        var thePage = $(this).find('a:first').text();
                        var theRow = $('<tr><td class="text-center" style="width: 30px;"><label class="checkbox no-label"><input type="checkbox" value="'+thePage+'" id="" data-type="page" name="pages[]" data-toggle="checkbox"></label></td><td>'+thePage+'<span class="publishing"><span class="working">Publishing... <img src="'+appUI.baseUrl+'images/publishLoader.gif"></span><span class="done text-primary">Published &nbsp;<span class="fui-check"></span></span></span></td></tr>');
                        
                        //checkboxify
                        theRow.find('input').radiocheck();
                        theRow.find('input').on('check uncheck toggle', function(){
                            $(this).closest('tr')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected-row');
                        });
                        
                        $('#publishModal_pages tbody').append( theRow );
                    
                    });
                    
                    $('#publishModal #publishPendingChangesMessage').hide();
                    $('#publishModal .modal-body-content').show();
                
                }
            }
            
            //enable/disable publish button
            
            var activateButton = false;
            
            $('#publishModal input[type=checkbox]').each(function(){
			
                if( $(this).prop('checked') ) {
                    activateButton = true;
                    return false;
                }
            });
            
            if( activateButton ) {
                $('#publishSubmit').removeClass('disabled');
            } else {
                $('#publishSubmit').addClass('disabled');
            }
            
            $('#publishModal').modal('show');
            
        },
        
        
        /*
            saves pending changes before publishing
        */
        saveBeforePublishing: function() {
            
            $('#publishModal #publishPendingChangesMessage').hide();
            $('#publishModal .loader').show();
            $(this).addClass('disabled');

            siteBuilder.site.prepForSave(false);
            
            var serverData = {};
            serverData.pages = siteBuilder.site.sitePagesReadyForServer;
            if( siteBuilder.site.pagesToDelete.length > 0 ) {
                serverData.toDelete = siteBuilder.site.pagesToDelete;
            }
            serverData.siteData = siteBuilder.site.data;
            
            $.ajax({
                url: appUI.siteUrl+"sites/save/1",
                type: "POST",
                dataType: "json",
                data: serverData,
            }).done(function(res){			
						
                $('#publishModal .loader').fadeOut(500, function(){
                    
                    $('#publishModal .modal-alerts').append( $(res.responseHTML) );
                    
                    //self-destruct success messages
                    setTimeout(function(){$('#publishModal .modal-alerts .alert-success').fadeOut(500, function(){$(this).remove();});}, 2500);
                    
                    //enable button
                    $('#publishModal #publishPendingChangesMessage .btn.save').removeClass('disabled');
                
                });
				
                if( res.responseCode === 1 ) {//changes were saved without issues

                    //no more pending changes
                    siteBuilder.site.setPendingChanges(false);
				
                    //get the correct pages in the Pages section of the publish modal
                    $('#publishModal_pages tbody > *').remove();

                    $('#pages li:visible').each(function(){
				
                        var thePage = $(this).find('a:first').text();
                        var theRow = $('<tr><td class="text-center" style="width: 0px;"><label class="checkbox"><input type="checkbox" value="'+thePage+'" id="" data-type="page" name="pages[]" data-toggle="checkbox"></label></td><td>'+thePage+'<span class="publishing"><span class="working">Publishing... <img src="'+appUI.baseUrl+'images/publishLoader.gif"></span><span class="done text-primary">Published &nbsp;<span class="fui-check"></span></span></span></td></tr>');
                        
                        //checkboxify
                        theRow.find('input').radiocheck();
                        theRow.find('input').on('check uncheck toggle', function(){
                            $(this).closest('tr')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected-row');
                        });
                        
                        $('#publishModal_pages tbody').append( theRow );
                    
                    });
                    
                    //show content
                    $('#publishModal .modal-body-content').fadeIn(500);
                
                }
            
            });
            
        },
        
        
        /*
            event handler for the checkboxes inside the publish modal
        */
        publishCheckboxEvent: function() {
            
            var activateButton = false;
            
            $('#publishModal input[type=checkbox]').each(function(){
                
                if( $(this).prop('checked') ) {
                    activateButton = true;
                    return false;
                }
            
            });
            
            if( activateButton ) {
                
                $('#publishSubmit').removeClass('disabled');
            
            } else {
                
                $('#publishSubmit').addClass('disabled');
            
            }
            
        },
        
        
        /*
            publishes the selected items
        */
        publishSite: function() {
            
            //track the publishing state
            publish.publishActive = 1;
            
            //disable button
            $('#publishSubmit, #publishCancel').addClass('disabled');
		
            //remove existing alerts
            $('#publishModal .modal-alerts > *').remove();
		
            //prepare stuff
            $('#publishModal form input[type="hidden"].page').remove();
            
            //loop through all pages
            $('#pageList > ul').each(function(){
                
                //export this page?
                if( $('#publishModal #publishModal_pages input:eq('+($(this).index()+1)+')').prop('checked') ) {
                    
                    //grab the skeleton markup
                    var newDocMainParent = $('iframe#skeleton').contents().find( bConfig.pageContainer );
                    
                    //empty out the skeleton
                    newDocMainParent.find('*').remove();
                    
                    //loop through page iframes and grab the body stuff
                    $(this).find('iframe').each(function(){
                        
                        var attr = $(this).attr('data-sandbox');

                        var theContents;
                        
                        if (typeof attr !== typeof undefined && attr !== false) {
                            theContents = $('#sandboxes #'+attr).contents().find( bConfig.pageContainer );
                        } else {
                            theContents = $(this).contents().find( bConfig.pageContainer );
                        }
                        
                        theContents.find('.frameCover').each(function(){
                            $(this).remove();
                        });
                        
                        //remove inline styling leftovers
                        for( var key in bConfig.editableItems ) {
                            
                            theContents.find( key ).each(function(){
                                
                                $(this).removeAttr('data-selector');
                                
                                if( $(this).attr('style') === '' ) {
                                    $(this).removeAttr('style');
                                }
                            
                            });
                        
                        }	
					
                        for (var i = 0; i < bConfig.editableContent.length; ++i) {
                            
                            $(this).contents().find( bConfig.editableContent[i] ).each(function(){
                                $(this).removeAttr('data-selector');
                            });
                        
                        }
                        
                        var toAdd = theContents.html();
                        
                        //grab scripts
                        
                        var scripts = $(this).contents().find( bConfig.pageContainer ).find('script');
                        
                        if( scripts.size() > 0 ) {
                            
                            var theIframe = document.getElementById("skeleton");
                            
                            scripts.each(function(){

                                var script;
                                
                                if( $(this).text() !== '' ) {//script tags with content
                                    
                                    script = theIframe.contentWindow.document.createElement("script");
                                    script.type = 'text/javascript';
                                    script.innerHTML = $(this).text();
                                    theIframe.contentWindow.document.getElementById( bConfig.pageContainer.substring(1) ).appendChild(script);
                                
                                } else if( $(this).attr('src') !== null ) {
                                    
                                    script = theIframe.contentWindow.document.createElement("script");
                                    script.type = 'text/javascript';
                                    script.src = $(this).attr('src');
                                    theIframe.contentWindow.document.getElementById( bConfig.pageContainer.substring(1) ).appendChild(script);
                                }
                            
                            });
                        
                        }
                        
                        newDocMainParent.append( $(toAdd) );
                    
                    });
                    
                    var newInput = $('<input type="hidden" class="page" name="xpages['+$('#pages li:eq('+($(this).index()+1)+') a:first').text()+']" value="">');
                    
                    $('#publishModal form').prepend( newInput );
                    
                    newInput.val( "<html>"+$('iframe#skeleton').contents().find('html').html()+"</html>" );
                
                }
            
            });
            
            publish.publishAsset();
            
        },
        
        publishAsset: function() {
            
            var toPublish = $('#publishModal_assets input[type=checkbox]:checked:not(.published, .toggleAll), #publishModal_pages input[type=checkbox]:checked:not(.published, .toggleAll)');
            
            if( toPublish.size() > 0 ) {
                
                publish.theItem = toPublish.first();
                
                //display the asset loader
                publish.theItem.closest('td').next().find('.publishing').fadeIn(500);

                var theData;
		
                if( publish.theItem.attr('data-type') === 'page' ) {
                    
                    theData = {siteID: $('form#publishForm input[name=siteID]').val(), item: publish.theItem.val(), pageContent: $('form#publishForm input[name="xpages['+publish.theItem.val()+']"]').val()};
                
                } else if( publish.theItem.attr('data-type') === 'asset' ) {
                    
                    theData = {siteID: $('form#publishForm input[name=siteID]').val(), item: publish.theItem.val()};
                
                }
                
                $.ajax({
                    url: $('form#publishForm').attr('action')+"/"+publish.theItem.attr('data-type'),
                    type: 'post',
                    data: theData,
                    dataType: 'json'
                }).done(function(ret){
                    
                    if( ret.responseCode === 0 ) {//fatal error, publishing will stop
                        
                        //hide indicators
                        publish.theItem.closest('td').next().find('.working').hide();
                        
                        //enable buttons
                        $('#publishSubmit, #publishCancel').removeClass('disabled');
                        $('#publishModal .modal-alerts').append( $(ret.responseHTML) );
                    
                    } else if( ret.responseCode === 1 ) {//no issues
                        
                        //show done
                        publish.theItem.closest('td').next().find('.working').hide();
                        publish.theItem.closest('td').next().find('.done').fadeIn();
                        publish.theItem.addClass('published');
                        
                        publish.publishAsset();
                    
                    }
                
                });

            } else {
                
                //publishing is done
                publish.publishActive = 0;
                
                //enable buttons
                $('#publishSubmit, #publishCancel').removeClass('disabled');
		
                //show message
                $('#publishModal .modal-body > .alert-success').fadeIn(500, function(){
                    setTimeout(function(){$('#publishModal .modal-body > .alert-success').fadeOut(500);}, 2500);
                });
            
            }
            
        },
        
        showPublishSettings: function() {
                        
            $('#siteSettingsPublishing').show();
        },
        
        
        /*
            browse the FTP connection
        */
        browseFTP: function(e) {
            
            e.preventDefault();
    		
    		//got all we need?
    		
    		if( $('#siteSettings_ftpServer').val() === '' || $('#siteSettings_ftpUser').val() === '' || $('#siteSettings_ftpPassword').val() === '' ) {
                alert('Please make sure all FTP connection details are present');
                return false;
            }
    		
            //check if this is a deeper level link
    		if( $(this).hasClass('link') ) {
    			
    			if( $(this).hasClass('back') ) {
    			
    				$('#siteSettings_ftpPath').val( $(this).attr('href') );
    			
    			} else {
    			
    				//if so, we'll change the path before connecting
    			
    				if( $('#siteSettings_ftpPath').val().substr( $('#siteSettings_ftpPath').val.length - 1 ) === '/' ) {//prepend "/"
    				
    					$('#siteSettings_ftpPath').val( $('#siteSettings_ftpPath').val()+$(this).attr('href') );
    			
    				} else {
    				
    					$('#siteSettings_ftpPath').val( $('#siteSettings_ftpPath').val()+"/"+$(this).attr('href') );
    				
    				}
    			
    			}
    			
    			
    		}
    		
    		//destroy all alerts
    		
    		$('#ftpAlerts .alert').fadeOut(500, function(){
    			$(this).remove();
    		});
    		
    		//disable button
    		$(this).addClass('disabled');
    		
    		//remove existing links
    		$('#ftpListItems > *').remove();
    		
    		//show ftp section
    		$('#ftpBrowse .loaderFtp').show();
    		$('#ftpBrowse').slideDown(500);

    		var theButton = $(this);
    		
    		$.ajax({
                url: appUI.siteUrl+"ftpconnection/connect",
    			type: 'post',
    			dataType: 'json',
    			data: $('form#siteSettingsForm').serializeArray()
    		}).done(function(ret){
    		
    			//enable button
    			theButton.removeClass('disabled');
    			
    			//hide loading
    			$('#ftpBrowse .loaderFtp').hide();
    		
    			if( ret.responseCode === 0 ) {//error
    				$('#ftpAlerts').append( $(ret.responseHTML) );
    			} else if( ret.responseCode === 1 ) {//all good
    				$('#ftpListItems').append( $(ret.responseHTML) );
    			}
    		
    		});
            
        },
        
        
        /*
            hides/closes the FTP browser
        */
        closeFtpBrowser: function(e) {
            
            e.preventDefault();
    		$(this).closest('#ftpBrowse').slideUp(500);
            
        },
        
        
         /*
            tests the FTP connection with the provided details
        */
        testFTPConnection: function() {
            
            //got all we need?
    		if( $('#siteSettings_ftpServer').val() === '' || $('#siteSettings_ftpUser').val() === '' || $('#siteSettings_ftpPassword').val() === '' ) {
                alert('Please make sure all FTP connection details are present');
                return false;
            }
    		
    		//destroy all alerts
            $('#ftpTestAlerts .alert').fadeOut(500, function(){
                $(this).remove();
            });
    		
    		//disable button
    		$(this).addClass('disabled');
    		
    		//show loading indicator
    		$(this).next().fadeIn(500);
    		
            var theButton = $(this);
    		
    		$.ajax({
                url: appUI.siteUrl+"ftpconnection/test",
    			type: 'post',
    			dataType: 'json',
    			data: $('form#siteSettingsForm').serializeArray()
    		}).done(function(ret){
    		    		
    			//enable button
    			theButton.removeClass('disabled');
                theButton.next().fadeOut(500);
    			    		
    			if( ret.responseCode === 0 ) {//error
                    $('#ftpTestAlerts').append( $(ret.responseHTML) );
                } else if( ret.responseCode === 1 ) {//all good
                    $('#ftpTestAlerts').append( $(ret.responseHTML) );
                }
    		
    		});
            
        }
        
    };
    
    publish.init();

}());
},{"./builder.js":2,"./config.js":3,"./ui.js":7}],5:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var sites = {
        
        wrapperSites: document.getElementById('sites'),
        selectUser: document.getElementById('userDropDown'),
        selectSort: document.getElementById('sortDropDown'),
        buttonDeleteSite: document.getElementById('deleteSiteButton'),
		buttonsDeleteSite: document.querySelectorAll('.deleteSiteButton'),
        
        init: function() {
            
            this.createThumbnails();
            
            $(this.selectUser).on('change', this.filterUser);
            $(this.selectSort).on('change', this.changeSorting);
            $(this.buttonsDeleteSite).on('click', this.deleteSite);
			$(this.buttonDeleteSite).on('click', this.deleteSite);
            
        },
        
        
        /*
            applies zoomer to create the iframe thubmnails
        */
        createThumbnails: function() {
                        
            $(this.wrapperSites).find('iframe').each(function(){
                            
                var theHeight = $(this).attr('data-height')*0.25;
                
                $(this).zoomer({
                    zoom: 0.25,
                    height: theHeight,
                    width: $(this).parent().width(),
                    message: "",
                    messageURL: appUI.siteUrl+"sites/"+$(this).attr('data-siteid')
                });
                
                $(this).closest('.site').find('.zoomer-cover > a').attr('target', '');
                    
            });
            
        },
        
        
        /*
            filters the site list by selected user
        */
        filterUser: function() {
            
            if( $(this).val() === 'All' || $(this).val() === '' ) {
                $('#sites .site').hide().fadeIn(500);
            } else {
                $('#sites .site').hide();
                $('#sites').find('[data-name="'+$(this).val()+'"]').fadeIn(500);
            }
            
        },
        
        
        /*
            chnages the sorting on the site list
        */
        changeSorting: function() {

            var sites;
            
            if( $(this).val() === 'NoOfPages' ) {
		
				sites = $('#sites .site');
			
				sites.sort( function(a,b){
                    
                    var an = a.getAttribute('data-pages');
					var bn = b.getAttribute('data-pages');
				
					if(an > bn) {
						return 1;
					}
				
					if(an < bn) {
						return -1;
					}
				
					return 0;
				
				} );
			
				sites.detach().appendTo( $('#sites') );
		
			} else if( $(this).val() === 'CreationDate' ) {
		
				sites = $('#sites .site');
			
				sites.sort( function(a,b){
			
					var an = a.getAttribute('data-created').replace("-", "");
					var bn = b.getAttribute('data-created').replace("-", "");
				
					if(an > bn) {
						return 1;
					}
				
					if(an < bn) {
						return -1;
					}
				
					return 0;
				
				} );
			
				sites.detach().appendTo( $('#sites') );
		
			} else if( $(this).val() === 'LastUpdate' ) {
		
				sites = $('#sites .site');
			
				sites.sort( function(a,b){
			
					var an = a.getAttribute('data-update').replace("-", "");
					var bn = b.getAttribute('data-update').replace("-", "");
				
					if(an > bn) {
						return 1;
					}
				
					if(an < bn) {
						return -1;
					}
				
				return 0;
				
				} );
			
				sites.detach().appendTo( $('#sites') );
		
			}
            
        },
        
        
        /*
            deletes a site
        */
        deleteSite: function(e) {
			            
            e.preventDefault();
            
            $('#deleteSiteModal .modal-content p').show();
            
            //remove old alerts
            $('#deleteSiteModal .modal-alerts > *').remove();
            $('#deleteSiteModal .loader').hide();
		
            var toDel = $(this).closest('.site');
            var delButton = $(this);
           
            $('#deleteSiteModal button#deleteSiteButton').show();
            $('#deleteSiteModal').modal('show');
           
            $('#deleteSiteModal button#deleteSiteButton').unbind('click').click(function(){
                
                $(this).addClass('disabled');
                $('#deleteSiteModal .loader').fadeIn(500);
               
                $.ajax({
                    url: appUI.siteUrl+"sites/trash/"+delButton.attr('data-siteid'),
                    type: 'post',
                    dataType: 'json'
                }).done(function(ret){
                    
                    $('#deleteSiteModal .loader').hide();
                    $('#deleteSiteModal button#deleteSiteButton').removeClass('disabled');
                   
                    if( ret.responseCode === 0 ) {//error
                       
                        $('#deleteSiteModal .modal-content p').hide();
                        $('#deleteSiteModal .modal-alerts').append( $(ret.responseHTML) );
                   
                    } else if( ret.responseCode === 1 ) {//all good
                       
                        $('#deleteSiteModal .modal-content p').hide();
                        $('#deleteSiteModal .modal-alerts').append( $(ret.responseHTML) );
                        $('#deleteSiteModal button#deleteSiteButton').hide();
                       
                        toDel.fadeOut(800, function(){
                            $(this).remove();
                        });
                    }
               
                });	
            });
            
        }
        
    };
    
    sites.init();

}());
},{"./ui.js":7}],6:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var siteSettings = {
        
        //buttonSiteSettings: document.getElementById('siteSettingsButton'),
		buttonSiteSettings2: $('.siteSettingsModalButton'),
        buttonSaveSiteSettings: document.getElementById('saveSiteSettingsButton'),
    
        init: function() {
            
            //$(this.buttonSiteSettings).on('click', this.siteSettingsModal);
			this.buttonSiteSettings2.on('click', this.siteSettingsModal);
            $(this.buttonSaveSiteSettings).on('click', this.saveSiteSettings);
        
        },
    
        /*
            loads the site settings data
        */
        siteSettingsModal: function(e) {
            
            e.preventDefault();
    		
    		$('#siteSettings').modal('show');
    		
    		//destroy all alerts
    		$('#siteSettings .alert').fadeOut(500, function(){
    		
    			$(this).remove();
    		
    		});
    		
    		//set the siteID
    		$('input#siteID').val( $(this).attr('data-siteid') );
    		
    		//destroy current forms
    		$('#siteSettings .modal-body-content > *').each(function(){
    			$(this).remove();
    		});
    		
            //show loader, hide rest
    		$('#siteSettingsWrapper .loader').show();
    		$('#siteSettingsWrapper > *:not(.loader)').hide();
    		
    		//load site data using ajax
    		$.ajax({
                url: appUI.siteUrl+"sites/siteAjax/"+$(this).attr('data-siteid'),
    			type: 'post',
    			dataType: 'json'
    		}).done(function(ret){    			
    			
    			if( ret.responseCode === 0 ) {//error
    			
    				//hide loader, show error message
    				$('#siteSettings .loader').fadeOut(500, function(){
    					
    					$('#siteSettings .modal-alerts').append( $(ret.responseHTML) );
    				
    				});
    				
    				//disable submit button
    				$('#saveSiteSettingsButton').addClass('disabled');
    			
    			
    			} else if( ret.responseCode === 1 ) {//all well :)
    			
    				//hide loader, show data
    				
    				$('#siteSettings .loader').fadeOut(500, function(){
    				
    					$('#siteSettings .modal-body-content').append( $(ret.responseHTML) );
                        
                        $('body').trigger('siteSettingsLoad');
    				
    				});
    				
    				//enable submit button
    				$('#saveSiteSettingsButton').removeClass('disabled');
                        			
    			}
    		
    		});
            
        },
        
        
        /*
            saves the site settings
        */
        saveSiteSettings: function() {
            
            //destroy all alerts
    		$('#siteSettings .alert').fadeOut(500, function(){
    		
    			$(this).remove();
    		
    		});
    		
    		//disable button
    		$('#saveSiteSettingsButton').addClass('disabled');
    		
    		//hide form data
    		$('#siteSettings .modal-body-content > *').hide();
    		
    		//show loader
    		$('#siteSettings .loader').show();
    		
    		$.ajax({
                url: appUI.siteUrl+"sites/siteAjaxUpdate",
    			type: 'post',
    			dataType: 'json',
    			data: $('form#siteSettingsForm').serializeArray()
    		}).done(function(ret){
    		
    			if( ret.responseCode === 0 ) {//error
    			
    				$('#siteSettings .loader').fadeOut(500, function(){
    				
    					$('#siteSettings .modal-alerts').append( ret.responseHTML );
    					
    					//show form data
    					$('#siteSettings .modal-body-content > *').show();
    					
    					//enable button
    					$('#saveSiteSettingsButton').removeClass('disabled');
    				
    				});
    			
    			
    			} else if( ret.responseCode === 1 ) {//all is well
    			
    				$('#siteSettings .loader').fadeOut(500, function(){
    					
    					
    					//update site name in top menu
    					$('#siteTitle').text( ret.siteName );
    					
    					$('#siteSettings .modal-alerts').append( ret.responseHTML );
    					
    					//hide form data
    					$('#siteSettings .modal-body-content > *').remove();
    					$('#siteSettings .modal-body-content').append( ret.responseHTML2 );
    					
    					//enable button
    					$('#saveSiteSettingsButton').removeClass('disabled');
    					
    					//is the FTP stuff all good?
    					
    					if( ret.ftpOk === 1 ) {//yes, all good
    					
    						$('#publishPage').removeAttr('data-toggle');
    						$('#publishPage span.text-danger').hide();
    						
    						$('#publishPage').tooltip('destroy');
    					
    					} else {//nope, can't use FTP
    						
    						$('#publishPage').attr('data-toggle', 'tooltip');
    						$('#publishPage span.text-danger').show();
    						
    						$('#publishPage').tooltip('show');
    					
    					}
    					
    					
    					//update the site name in the small window
    					$('#site_'+ret.siteID+' .window .top b').text( ret.siteName );
    				
    				});
    			
    			
    			}
    		
    		});
    		            
        },
        
    
    };
    
    siteSettings.init();

}());
},{"./ui.js":7}],7:[function(require,module,exports){
(function () {

/* globals siteUrl:false, baseUrl:false */
    "use strict";
        
    var appUI = {
        
        firstMenuWidth: 190,
        secondMenuWidth: 300,
        loaderAnimation: document.getElementById('loader'),
        secondMenuTriggerContainers: $('#menu #main #elementCats, #menu #main #templatesUl'),
        siteUrl: siteUrl,
        baseUrl: baseUrl,
        
        setup: function(){
            
            // Fade the loader animation
            $(appUI.loaderAnimation).fadeOut(function(){
                $('#menu').animate({'left': -appUI.firstMenuWidth}, 1000);
            });
            
            // Tabs
            $(".nav-tabs a").on('click', function (e) {
                e.preventDefault();
                $(this).tab("show");
            });
            
            $("select.select").select2();
            
            $(':radio, :checkbox').radiocheck();
            
            // Tooltips
            $("[data-toggle=tooltip]").tooltip("hide");
            
            // Table: Toggle all checkboxes
            $('.table .toggle-all :checkbox').on('click', function () {
                var $this = $(this);
                var ch = $this.prop('checked');
                $this.closest('.table').find('tbody :checkbox').radiocheck(!ch ? 'uncheck' : 'check');
            });
            
            // Add style class name to a tooltips
            $(".tooltip").addClass(function() {
                if ($(this).prev().attr("data-tooltip-style")) {
                    return "tooltip-" + $(this).prev().attr("data-tooltip-style");
                }
            });
            
            $(".btn-group").on('click', "a", function() {
                $(this).siblings().removeClass("active").end().addClass("active");
            });
            
            // Focus state for append/prepend inputs
            $('.input-group').on('focus', '.form-control', function () {
                $(this).closest('.input-group, .form-group').addClass('focus');
            }).on('blur', '.form-control', function () {
                $(this).closest('.input-group, .form-group').removeClass('focus');
            });
            
            // Table: Toggle all checkboxes
            $('.table .toggle-all').on('click', function() {
                var ch = $(this).find(':checkbox').prop('checked');
                $(this).closest('.table').find('tbody :checkbox').checkbox(!ch ? 'check' : 'uncheck');
            });
            
            // Table: Add class row selected
            $('.table tbody :checkbox').on('check uncheck toggle', function (e) {
                var $this = $(this)
                , check = $this.prop('checked')
                , toggle = e.type === 'toggle'
                , checkboxes = $('.table tbody :checkbox')
                , checkAll = checkboxes.length === checkboxes.filter(':checked').length;

                $this.closest('tr')[check ? 'addClass' : 'removeClass']('selected-row');
                if (toggle) $this.closest('.table').find('.toggle-all :checkbox').checkbox(checkAll ? 'check' : 'uncheck');
            });
            
            // Switch
            $("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
                        
            appUI.secondMenuTriggerContainers.on('click', 'a:not(.btn)', appUI.secondMenuAnimation);
                        
        },
        
        secondMenuAnimation: function(){
        
            $('#menu #main a').removeClass('active');
            $(this).addClass('active');
	
            //show only the right elements
            $('#menu #second ul li').hide();
            $('#menu #second ul li.'+$(this).attr('id')).show();

            if( $(this).attr('id') === 'all' ) {
                $('#menu #second ul#elements li').show();		
            }
	
            $('.menu .second').css('display', 'block').stop().animate({
                width: appUI.secondMenuWidth
            }, 500);	
                
        }
        
    };
    
    //initiate the UI
    appUI.setup();


    //**** EXPORTS
    module.exports.appUI = appUI;
    
}());
},{}],8:[function(require,module,exports){
(function () {
    "use strict";
    
    exports.getRandomArbitrary = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };

    exports.getParameterByName = function (name, url) {

        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
        
    };
    
}());
},{}],9:[function(require,module,exports){
(function () {
	"use strict";

	require('./modules/ui.js');
	require('./modules/account.js');
	require('./modules/sites.js');
	require('./modules/sitesettings.js');
	require('./modules/publishing.js');

}());
},{"./modules/account.js":1,"./modules/publishing.js":4,"./modules/sites.js":5,"./modules/sitesettings.js":6,"./modules/ui.js":7}],10:[function(require,module,exports){
/*!
 * publisher.js - (c) Ryan Florence 2011
 * github.com/rpflorence/publisher.js
 * MIT License
*/

// UMD Boilerplate \o/ && D:
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(); // node
  } else if (typeof define === 'function' && define.amd) {
    define(factory); // amd
  } else {
    // window with noConflict
    var _publisher = root.publisher;
    var publisher = root.publisher = factory();
    root.publisher.noConflict = function () {
      root.publisher = _publisher;
      return publisher;
    }
  }
}(this, function () {

  var publisher = function (obj) {
    var topics = {};
    obj = obj || {};

    obj.publish = function (topic/*, messages...*/) {
      if (!topics[topic]) return obj;
      var messages = [].slice.call(arguments, 1);
      for (var i = 0, l = topics[topic].length; i < l; i++) {
        topics[topic][i].handler.apply(topics[topic][i].context, messages);
      }
      return obj;
    };

    obj.subscribe = function (topicOrSubscriber, handlerOrTopics) {
      var firstType = typeof topicOrSubscriber;

      if (firstType === 'string') {
        return subscribe.apply(null, arguments);
      }

      if (firstType === 'object' && !handlerOrTopics) {
        return subscribeMultiple.apply(null, arguments);
      }

      if (typeof handlerOrTopics === 'string') {
        return hitch.apply(null, arguments);
      }

      return hitchMultiple.apply(null, arguments);
    };

    function subscribe (topic, handler, context) {
      var reference = { handler: handler, context: context || obj };
      topic = topics[topic] || (topics[topic] = []);
      topic.push(reference);
      return {
        attach: function () {
          topic.push(reference);
          return this;
        },
        detach: function () {
          erase(topic, reference);
          return this;
        }
      };
    };

    function subscribeMultiple (pairs) {
      var subscriptions = {};
      for (var topic in pairs) {
        if (!pairs.hasOwnProperty(topic)) continue;
        subscriptions[topic] = subscribe(topic, pairs[topic]);
      }
      return subscriptions;
    };

    function hitch (subscriber, topic) {
      return subscribe(topic, subscriber[topic], subscriber);
    };

    function hitchMultiple (subscriber, topics) {
      var subscriptions = [];
      for (var i = 0, l = topics.length; i < l; i++) {
        subscriptions.push( hitch(subscriber, topics[i]) );
      }
      return subscriptions;
    };

    function erase (arr, victim) {
      for (var i = 0, l = arr.length; i < l; i++){
        if (arr[i] === victim) arr.splice(i, 1);
      }
    }

    return obj;
  };

  // publisher is a publisher, so meta ...
  return publisher(publisher);
}));

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tb2R1bGVzL2FjY291bnQuanMiLCJqcy9tb2R1bGVzL2J1aWxkZXIuanMiLCJqcy9tb2R1bGVzL2NvbmZpZy5qcyIsImpzL21vZHVsZXMvcHVibGlzaGluZy5qcyIsImpzL21vZHVsZXMvc2l0ZXMuanMiLCJqcy9tb2R1bGVzL3NpdGVzZXR0aW5ncy5qcyIsImpzL21vZHVsZXMvdWkuanMiLCJqcy9tb2R1bGVzL3V0aWxzLmpzIiwianMvc2l0ZXMuanMiLCJqcy92ZW5kb3IvcHVibGlzaGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDLy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGFwcFVJID0gcmVxdWlyZSgnLi91aS5qcycpLmFwcFVJO1xuXG5cdHZhciBhY2NvdW50ID0ge1xuICAgICAgICBcbiAgICAgICAgYnV0dG9uVXBkYXRlQWNjb3VudERldGFpbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NvdW50RGV0YWlsc1N1Ym1pdCcpLFxuICAgICAgICBidXR0b25VcGRhdGVMb2dpbkRldGFpbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NvdW50TG9naW5TdWJtaXQnKSxcbiAgICAgICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uVXBkYXRlQWNjb3VudERldGFpbHMpLm9uKCdjbGljaycsIHRoaXMudXBkYXRlQWNjb3VudERldGFpbHMpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvblVwZGF0ZUxvZ2luRGV0YWlscykub24oJ2NsaWNrJywgdGhpcy51cGRhdGVMb2dpbkRldGFpbHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZXMgYWNjb3VudCBkZXRhaWxzXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFjY291bnREZXRhaWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9hbGwgZmllbGRzIGZpbGxlZCBpbj9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNmaXJzdG5hbWUnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNmaXJzdG5hbWUnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNmaXJzdG5hbWUnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQoJyNhY2NvdW50X2RldGFpbHMgaW5wdXQjbGFzdG5hbWUnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNsYXN0bmFtZScpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2xhc3RuYW1lJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICB9XG5cdFx0XG4gICAgICAgICAgICBpZiggYWxsR29vZCA9PT0gMSApIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aGVCdXR0b24gPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vc2hvdyBsb2FkZXJcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIC5sb2FkZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBhbGVydHNcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIC5hbGVydHMgPiAqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1widXNlcnMvdWFjY291bnRcIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAkKCcjYWNjb3VudF9kZXRhaWxzJykuc2VyaWFsaXplKClcbiAgICAgICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdGhlQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIC5sb2FkZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmFsZXJ0cyA+IConKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24gKCkgeyAkKHRoaXMpLnJlbW92ZSgpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICB1cGRhdGVzIGFjY291bnQgbG9naW4gZGV0YWlsc1xuICAgICAgICAqL1xuICAgICAgICB1cGRhdGVMb2dpbkRldGFpbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyhhcHBVSSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I2VtYWlsJykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I2VtYWlsJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I2VtYWlsJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjYWNjb3VudF9sb2dpbiBpbnB1dCNwYXNzd29yZCcpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiBpbnB1dCNwYXNzd29yZCcpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiBpbnB1dCNwYXNzd29yZCcpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggYWxsR29vZCA9PT0gMSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgdGhlQnV0dG9uID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vc2hvdyBsb2FkZXJcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAubG9hZGVyJykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgYWxlcnRzXG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gLmFsZXJ0cyA+IConKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJ1c2Vycy91bG9naW5cIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAkKCcjYWNjb3VudF9sb2dpbicpLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHRoZUJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gLmxvYWRlcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gLmFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuXHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL3N1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAuYWxlcnRzID4gKicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbiAoKSB7ICQodGhpcykucmVtb3ZlKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcbiAgICBcbiAgICBhY2NvdW50LmluaXQoKTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBzaXRlQnVpbGRlclV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xuICAgIHZhciBiQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcbiAgICB2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG4gICAgdmFyIHB1Ymxpc2hlciA9IHJlcXVpcmUoJy4uL3ZlbmRvci9wdWJsaXNoZXInKTtcblxuXG5cdCAvKlxuICAgICAgICBCYXNpYyBCdWlsZGVyIFVJIGluaXRpYWxpc2F0aW9uXG4gICAgKi9cbiAgICB2YXIgYnVpbGRlclVJID0ge1xuICAgICAgICBcbiAgICAgICAgYWxsQmxvY2tzOiB7fSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9ob2xkcyBhbGwgYmxvY2tzIGxvYWRlZCBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgICAgbWVudVdyYXBwZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51JyksXG4gICAgICAgIHByaW1hcnlTaWRlTWVudVdyYXBwZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJyksXG4gICAgICAgIGJ1dHRvbkJhY2s6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrQnV0dG9uJyksXG4gICAgICAgIGJ1dHRvbkJhY2tDb25maXJtOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGVhdmVQYWdlQnV0dG9uJyksXG4gICAgICAgIFxuICAgICAgICBhY2VFZGl0b3JzOiB7fSxcbiAgICAgICAgZnJhbWVDb250ZW50czogJycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2hvbGRzIGZyYW1lIGNvbnRlbnRzXG4gICAgICAgIHRlbXBsYXRlSUQ6IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9ob2xkcyB0aGUgdGVtcGxhdGUgSUQgZm9yIGEgcGFnZSAoPz8/KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBtb2RhbERlbGV0ZUJsb2NrOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsZXRlQmxvY2snKSxcbiAgICAgICAgbW9kYWxSZXNldEJsb2NrOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCbG9jaycpLFxuICAgICAgICBtb2RhbERlbGV0ZVBhZ2U6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGVQYWdlJyksXG4gICAgICAgIGJ1dHRvbkRlbGV0ZVBhZ2VDb25maXJtOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsZXRlUGFnZUNvbmZpcm0nKSxcbiAgICAgICAgXG4gICAgICAgIGRyb3Bkb3duUGFnZUxpbmtzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW50ZXJuYWxMaW5rc0Ryb3Bkb3duJyksXG5cbiAgICAgICAgcGFnZUluVXJsOiBudWxsLFxuICAgICAgICBcbiAgICAgICAgdGVtcEZyYW1lOiB7fSxcblxuICAgICAgICBjdXJyZW50UmVzcG9uc2l2ZU1vZGU6IHt9LFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2xvYWQgYmxvY2tzXG4gICAgICAgICAgICAkLmdldEpTT04oYXBwVUkuYmFzZVVybCsnZWxlbWVudHMuanNvbj92PTEyMzQ1Njc4JywgZnVuY3Rpb24oZGF0YSl7IGJ1aWxkZXJVSS5hbGxCbG9ja3MgPSBkYXRhOyBidWlsZGVyVUkuaW1wbGVtZW50QmxvY2tzKCk7IH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3NpdGViYXIgaG92ZXIgYW5pbWF0aW9uIGFjdGlvblxuICAgICAgICAgICAgJCh0aGlzLm1lbnVXcmFwcGVyKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5zdG9wKCkuYW5pbWF0ZSh7J2xlZnQnOiAnMHB4J30sIDUwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5zdG9wKCkuYW5pbWF0ZSh7J2xlZnQnOiAnLTE5MHB4J30sIDUwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCgnI21lbnUgI21haW4gYScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCcubWVudSAuc2Vjb25kJykuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIH0sIDUwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJCgnI21lbnUgI3NlY29uZCcpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3ByZXZlbnQgY2xpY2sgZXZlbnQgb24gYW5jb3JzIGluIHRoZSBibG9jayBzZWN0aW9uIG9mIHRoZSBzaWRlYmFyXG4gICAgICAgICAgICAkKHRoaXMucHJpbWFyeVNpZGVNZW51V3JhcHBlcikub24oJ2NsaWNrJywgJ2E6bm90KC5hY3Rpb25CdXR0b25zKScsIGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTt9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvbkJhY2spLm9uKCdjbGljaycsIHRoaXMuYmFja0J1dHRvbik7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uQmFja0NvbmZpcm0pLm9uKCdjbGljaycsIHRoaXMuYmFja0J1dHRvbkNvbmZpcm0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL25vdGlmeSB0aGUgdXNlciBvZiBwZW5kaW5nIGNobmFnZXMgd2hlbiBjbGlja2luZyB0aGUgYmFjayBidXR0b25cbiAgICAgICAgICAgICQod2luZG93KS5iaW5kKCdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlmKCBzaXRlLnBlbmRpbmdDaGFuZ2VzID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1lvdXIgc2l0ZSBjb250YWlucyBjaGFuZ2VkIHdoaWNoIGhhdmVuXFwndCBiZWVuIHNhdmVkIHlldC4gQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxlYXZlPyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vVVJMIHBhcmFtZXRlcnNcbiAgICAgICAgICAgIGJ1aWxkZXJVSS5wYWdlSW5VcmwgPSBzaXRlQnVpbGRlclV0aWxzLmdldFBhcmFtZXRlckJ5TmFtZSgncCcpO1xuXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGJ1aWxkcyB0aGUgYmxvY2tzIGludG8gdGhlIHNpdGUgYmFyXG4gICAgICAgICovXG4gICAgICAgIGltcGxlbWVudEJsb2NrczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBuZXdJdGVtLCBsb2FkZXJGdW5jdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIga2V5IGluIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBuaWNlS2V5ID0ga2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZShcIiBcIiwgXCJfXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJzxsaT48YSBocmVmPVwiXCIgaWQ9XCInK25pY2VLZXkrJ1wiPicra2V5Kyc8L2E+PC9saT4nKS5hcHBlbmRUbygnI21lbnUgI21haW4gdWwjZWxlbWVudENhdHMnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IoIHZhciB4ID0gMDsgeCA8IHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV0ubGVuZ3RoOyB4KysgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS50aHVtYm5haWwgPT09IG51bGwgKSB7Ly93ZSdsbCBuZWVkIGFuIGlmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2J1aWxkIHVzIHNvbWUgaWZyYW1lcyFcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0uc2FuZGJveCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5sb2FkZXJGdW5jdGlvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyRnVuY3Rpb24gPSAnZGF0YS1sb2FkZXJmdW5jdGlvbj1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5sb2FkZXJGdW5jdGlvbisnXCInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtID0gJCgnPGxpIGNsYXNzPVwiZWxlbWVudCAnK25pY2VLZXkrJ1wiPjxpZnJhbWUgc3JjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKydcIiBzY3JvbGxpbmc9XCJub1wiIHNhbmRib3g9XCJhbGxvdy1zYW1lLW9yaWdpblwiPjwvaWZyYW1lPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbSA9ICQoJzxsaSBjbGFzcz1cImVsZW1lbnQgJytuaWNlS2V5KydcIj48aWZyYW1lIHNyYz1cImFib3V0OmJsYW5rXCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT48L2xpPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmluZCgnaWZyYW1lJykudW5pcXVlSWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignc3JjJywgYXBwVUkuYmFzZVVybCt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnVybCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugey8vd2UndmUgZ290IGEgdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0ubG9hZGVyRnVuY3Rpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckZ1bmN0aW9uID0gJ2RhdGEtbG9hZGVyZnVuY3Rpb249XCInK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0ubG9hZGVyRnVuY3Rpb24rJ1wiJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbSA9ICQoJzxsaSBjbGFzcz1cImVsZW1lbnQgJytuaWNlS2V5KydcIj48aW1nIHNyYz1cIicrYXBwVUkuYmFzZVVybCt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnRodW1ibmFpbCsnXCIgZGF0YS1zcmNjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKydcIiBkYXRhLWhlaWdodD1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5oZWlnaHQrJ1wiIGRhdGEtc2FuZGJveD1cIlwiICcrbG9hZGVyRnVuY3Rpb24rJz48L2xpPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbSA9ICQoJzxsaSBjbGFzcz1cImVsZW1lbnQgJytuaWNlS2V5KydcIj48aW1nIHNyYz1cIicrYXBwVUkuYmFzZVVybCt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnRodW1ibmFpbCsnXCIgZGF0YS1zcmNjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKydcIiBkYXRhLWhlaWdodD1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5oZWlnaHQrJ1wiPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBuZXdJdGVtLmFwcGVuZFRvKCcjbWVudSAjc2Vjb25kIHVsI2VsZW1lbnRzJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy96b29tZXIgd29ya3NcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0uaGVpZ2h0ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVIZWlnaHQgPSB0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLmhlaWdodCowLjI1O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlSGVpZ2h0ID0gJ2F1dG8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmluZCgnaWZyYW1lJykuem9vbWVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDAuMjUsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMjcwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGVIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkRyYWcmRHJvcCBNZSFcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kcmFnZ2FibGVzXG4gICAgICAgICAgICBidWlsZGVyVUkubWFrZURyYWdnYWJsZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZXZlbnQgaGFuZGxlciBmb3Igd2hlbiB0aGUgYmFjayBsaW5rIGlzIGNsaWNrZWRcbiAgICAgICAgKi9cbiAgICAgICAgYmFja0J1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBzaXRlLnBlbmRpbmdDaGFuZ2VzID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgICQoJyNiYWNrTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBidXR0b24gZm9yIGNvbmZpcm1pbmcgbGVhdmluZyB0aGUgcGFnZVxuICAgICAgICAqL1xuICAgICAgICBiYWNrQnV0dG9uQ29uZmlybTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpdGUucGVuZGluZ0NoYW5nZXMgPSBmYWxzZTsvL3ByZXZlbnQgdGhlIEpTIGFsZXJ0IGFmdGVyIGNvbmZpcm1pbmcgdXNlciB3YW50cyB0byBsZWF2ZVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBtYWtlcyB0aGUgYmxvY2tzIGFuZCB0ZW1wbGF0ZXMgaW4gdGhlIHNpZGViYXIgZHJhZ2dhYmxlIG9udG8gdGhlIGNhbnZhc1xuICAgICAgICAqL1xuICAgICAgICBtYWtlRHJhZ2dhYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI2VsZW1lbnRzIGxpLCAjdGVtcGxhdGVzIGxpJykuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgICAgICAgICBoZWxwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoJzxkaXYgc3R5bGU9XCJoZWlnaHQ6IDEwMHB4OyB3aWR0aDogMzAwcHg7IGJhY2tncm91bmQ6ICNGOUZBRkE7IGJveC1zaGFkb3c6IDVweCA1cHggMXB4IHJnYmEoMCwwLDAsMC4xKTsgdGV4dC1hbGlnbjogY2VudGVyOyBsaW5lLWhlaWdodDogMTAwcHg7IGZvbnQtc2l6ZTogMjhweDsgY29sb3I6ICMxNkEwODVcIj48c3BhbiBjbGFzcz1cImZ1aS1saXN0XCI+PC9zcGFuPjwvZGl2PicpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXZlcnQ6ICdpbnZhbGlkJyxcbiAgICAgICAgICAgICAgICAgICAgYXBwZW5kVG86ICdib2R5JyxcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdFRvU29ydGFibGU6ICcjcGFnZUxpc3QgPiB1bCcsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXRlLm1vdmVNb2RlKCdvbicpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7fVxuICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNlbGVtZW50cyBsaSBhJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQodGhpcykudW5iaW5kKCdjbGljaycpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgSW1wbGVtZW50cyB0aGUgc2l0ZSBvbiB0aGUgY2FudmFzLCBjYWxsZWQgZnJvbSB0aGUgU2l0ZSBvYmplY3Qgd2hlbiB0aGUgc2l0ZURhdGEgaGFzIGNvbXBsZXRlZCBsb2FkaW5nXG4gICAgICAgICovXG4gICAgICAgIHBvcHVsYXRlQ2FudmFzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgY291bnRlciA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbG9vcCB0aHJvdWdoIHRoZSBwYWdlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIGkgaW4gc2l0ZS5wYWdlcyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGFnZSA9IG5ldyBQYWdlKGksIHNpdGUucGFnZXNbaV0sIGNvdW50ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XG5cbiAgICAgICAgICAgICAgICAvL3NldCB0aGlzIHBhZ2UgYXMgYWN0aXZlP1xuICAgICAgICAgICAgICAgIGlmKCBidWlsZGVyVUkucGFnZUluVXJsID09PSBpICkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYWdlLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FjdGl2YXRlIHRoZSBmaXJzdCBwYWdlXG4gICAgICAgICAgICBpZihzaXRlLnNpdGVQYWdlcy5sZW5ndGggPiAwICYmIGJ1aWxkZXJVSS5wYWdlSW5VcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzaXRlLnNpdGVQYWdlc1swXS5zZWxlY3RQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBDYW52YXMgbG9hZGluZyBvbi9vZmZcbiAgICAgICAgKi9cbiAgICAgICAgY2FudmFzTG9hZGluZzogZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgICAgICAgICAgIGlmICggdmFsdWUgPT09ICdvbicgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZyYW1lV3JhcHBlcicpLnF1ZXJ5U2VsZWN0b3JBbGwoJyNjYW52YXNPdmVybGF5JykubGVuZ3RoID09PSAwICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcblxuICAgICAgICAgICAgICAgIG92ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgICAgICAgICAkKG92ZXJsYXkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBvdmVybGF5LmlkID0gJ2NhbnZhc092ZXJsYXknO1xuXG4gICAgICAgICAgICAgICAgb3ZlcmxheS5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImxvYWRlclwiPjxzcGFuPns8L3NwYW4+PHNwYW4+fTwvc3Bhbj48L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZyYW1lV3JhcHBlcicpLmFwcGVuZENoaWxkKG92ZXJsYXkpO1xuXG4gICAgICAgICAgICAgICAgJCgnI2NhbnZhc092ZXJsYXknKS5mYWRlSW4oNTAwKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmICggdmFsdWUgPT09ICdvZmYnICYmIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmFtZVdyYXBwZXInKS5xdWVyeVNlbGVjdG9yQWxsKCcjY2FudmFzT3ZlcmxheScpLmxlbmd0aCA9PT0gMSApIHtcblxuICAgICAgICAgICAgICAgIHNpdGUubG9hZGVkKCk7XG5cbiAgICAgICAgICAgICAgICAkKCcjY2FudmFzT3ZlcmxheScpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH07XG5cblxuICAgIC8qXG4gICAgICAgIFBhZ2UgY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uIFBhZ2UgKHBhZ2VOYW1lLCBwYWdlLCBjb3VudGVyKSB7XG4gICAgXG4gICAgICAgIHRoaXMubmFtZSA9IHBhZ2VOYW1lIHx8IFwiXCI7XG4gICAgICAgIHRoaXMucGFnZUlEID0gcGFnZS5wYWdlX2lkIHx8IDA7XG4gICAgICAgIHRoaXMuYmxvY2tzID0gW107XG4gICAgICAgIHRoaXMucGFyZW50VUwgPSB7fTsgLy9wYXJlbnQgVUwgb24gdGhlIGNhbnZhc1xuICAgICAgICB0aGlzLnN0YXR1cyA9ICcnOy8vJycsICduZXcnIG9yICdjaGFuZ2VkJ1xuICAgICAgICB0aGlzLnNjcmlwdHMgPSBbXTsvL3RyYWNrcyBzY3JpcHQgVVJMcyB1c2VkIG9uIHRoaXMgcGFnZVxuICAgICAgICBcbiAgICAgICAgdGhpcy5wYWdlU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICB0aXRsZTogcGFnZS5wYWdlc190aXRsZSB8fCAnJyxcbiAgICAgICAgICAgIG1ldGFfZGVzY3JpcHRpb246IHBhZ2UubWV0YV9kZXNjcmlwdGlvbiB8fCAnJyxcbiAgICAgICAgICAgIG1ldGFfa2V5d29yZHM6IHBhZ2UubWV0YV9rZXl3b3JkcyB8fCAnJyxcbiAgICAgICAgICAgIGhlYWRlcl9pbmNsdWRlczogcGFnZS5oZWFkZXJfaW5jbHVkZXMgfHwgJycsXG4gICAgICAgICAgICBwYWdlX2NzczogcGFnZS5wYWdlX2NzcyB8fCAnJ1xuICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnBhZ2VNZW51VGVtcGxhdGUgPSAnPGEgaHJlZj1cIlwiIGNsYXNzPVwibWVudUl0ZW1MaW5rXCI+cGFnZTwvYT48c3BhbiBjbGFzcz1cInBhZ2VCdXR0b25zXCI+PGEgaHJlZj1cIlwiIGNsYXNzPVwiZmlsZUVkaXQgZnVpLW5ld1wiPjwvYT48YSBocmVmPVwiXCIgY2xhc3M9XCJmaWxlRGVsIGZ1aS1jcm9zc1wiPjxhIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tcHJpbWFyeSBidG4tZW1ib3NzZWQgZmlsZVNhdmUgZnVpLWNoZWNrXCIgaHJlZj1cIiNcIj48L2E+PC9zcGFuPjwvYT48L3NwYW4+JztcbiAgICAgICAgXG4gICAgICAgIHRoaXMubWVudUl0ZW0gPSB7fTsvL3JlZmVyZW5jZSB0byB0aGUgcGFnZXMgbWVudSBpdGVtIGZvciB0aGlzIHBhZ2UgaW5zdGFuY2VcbiAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbSA9IHt9Oy8vcmVmZXJlbmNlIHRvIHRoZSBsaW5rcyBkcm9wZG93biBpdGVtIGZvciB0aGlzIHBhZ2UgaW5zdGFuY2VcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGFyZW50VUwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdVTCcpO1xuICAgICAgICB0aGlzLnBhcmVudFVMLnNldEF0dHJpYnV0ZSgnaWQnLCBcInBhZ2VcIitjb3VudGVyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIG1ha2VzIHRoZSBjbGlja2VkIHBhZ2UgYWN0aXZlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2VsZWN0UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzZWxlY3Q6Jyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMucGFnZVNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9tYXJrIHRoZSBtZW51IGl0ZW0gYXMgYWN0aXZlXG4gICAgICAgICAgICBzaXRlLmRlQWN0aXZhdGVBbGwoKTtcbiAgICAgICAgICAgICQodGhpcy5tZW51SXRlbSkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2xldCBTaXRlIGtub3cgd2hpY2ggcGFnZSBpcyBjdXJyZW50bHkgYWN0aXZlXG4gICAgICAgICAgICBzaXRlLnNldEFjdGl2ZSh0aGlzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kaXNwbGF5IHRoZSBuYW1lIG9mIHRoZSBhY3RpdmUgcGFnZSBvbiB0aGUgY2FudmFzXG4gICAgICAgICAgICBzaXRlLnBhZ2VUaXRsZS5pbm5lckhUTUwgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbG9hZCB0aGUgcGFnZSBzZXR0aW5ncyBpbnRvIHRoZSBwYWdlIHNldHRpbmdzIG1vZGFsXG4gICAgICAgICAgICBzaXRlLmlucHV0UGFnZVNldHRpbmdzVGl0bGUudmFsdWUgPSB0aGlzLnBhZ2VTZXR0aW5ncy50aXRsZTtcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NNZXRhRGVzY3JpcHRpb24udmFsdWUgPSB0aGlzLnBhZ2VTZXR0aW5ncy5tZXRhX2Rlc2NyaXB0aW9uO1xuICAgICAgICAgICAgc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc01ldGFLZXl3b3Jkcy52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLm1ldGFfa2V5d29yZHM7XG4gICAgICAgICAgICBzaXRlLmlucHV0UGFnZVNldHRpbmdzSW5jbHVkZXMudmFsdWUgPSB0aGlzLnBhZ2VTZXR0aW5ncy5oZWFkZXJfaW5jbHVkZXM7XG4gICAgICAgICAgICBzaXRlLmlucHV0UGFnZVNldHRpbmdzUGFnZUNzcy52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLnBhZ2VfY3NzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdHJpZ2dlciBjdXN0b20gZXZlbnRcbiAgICAgICAgICAgICQoJ2JvZHknKS50cmlnZ2VyKCdjaGFuZ2VQYWdlJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVzZXQgdGhlIGhlaWdodHMgZm9yIHRoZSBibG9ja3Mgb24gdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICAgZm9yKCB2YXIgaSBpbiB0aGlzLmJsb2NrcyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggT2JqZWN0LmtleXModGhpcy5ibG9ja3NbaV0uZnJhbWVEb2N1bWVudCkubGVuZ3RoID4gMCApe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS5oZWlnaHRBZGp1c3RtZW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2hvdyB0aGUgZW1wdHkgbWVzc2FnZT9cbiAgICAgICAgICAgIHRoaXMuaXNFbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2hhbmdlZCB0aGUgbG9jYXRpb24vb3JkZXIgb2YgYSBibG9jayB3aXRoaW4gYSBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihmcmFtZUlELCBuZXdQb3MpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy93ZSdsbCBuZWVkIHRoZSBibG9jayBvYmplY3QgY29ubmVjdGVkIHRvIGlmcmFtZSB3aXRoIGZyYW1lSURcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMuYmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuYmxvY2tzW2ldLmZyYW1lLmdldEF0dHJpYnV0ZSgnaWQnKSA9PT0gZnJhbWVJRCApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vY2hhbmdlIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGJsb2NrIGluIHRoZSBibG9ja3MgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja3Muc3BsaWNlKG5ld1BvcywgMCwgdGhpcy5ibG9ja3Muc3BsaWNlKGksIDEpWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZGVsZXRlIGJsb2NrIGZyb20gYmxvY2tzIGFycmF5XG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlQmxvY2sgPSBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIGJsb2NrcyBhcnJheVxuICAgICAgICAgICAgZm9yKCB2YXIgaSBpbiB0aGlzLmJsb2NrcyApIHtcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5ibG9ja3NbaV0gPT09IGJsb2NrICkge1xuICAgICAgICAgICAgICAgICAgICAvL2ZvdW5kIGl0LCByZW1vdmUgZnJvbSBibG9ja3MgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHRvZ2dsZXMgYWxsIGJsb2NrIGZyYW1lQ292ZXJzIG9uIHRoaXMgcGFnZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnRvZ2dsZUZyYW1lQ292ZXJzID0gZnVuY3Rpb24ob25Pck9mZikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuYmxvY2tzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja3NbaV0udG9nZ2xlQ292ZXIob25Pck9mZik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBzZXR1cCBmb3IgZWRpdGluZyBhIHBhZ2UgbmFtZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmVkaXRQYWdlTmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggIXRoaXMubWVudUl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdlZGl0JykgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGxpbmtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EubWVudUl0ZW1MaW5rJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vaW5zZXJ0IHRoZSBpbnB1dCBmaWVsZFxuICAgICAgICAgICAgICAgIHZhciBuZXdJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgbmV3SW5wdXQudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICAgICAgICBuZXdJbnB1dC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAncGFnZScpO1xuICAgICAgICAgICAgICAgIG5ld0lucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCB0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUl0ZW0uaW5zZXJ0QmVmb3JlKG5ld0lucHV0LCB0aGlzLm1lbnVJdGVtLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZXdJbnB1dC5mb2N1cygpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgdG1wU3RyID0gbmV3SW5wdXQuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICAgICAgICAgIG5ld0lucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnJyk7XG4gICAgICAgICAgICAgICAgbmV3SW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHRtcFN0cik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5jbGFzc0xpc3QuYWRkKCdlZGl0Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIFVwZGF0ZXMgdGhpcyBwYWdlJ3MgbmFtZSAoZXZlbnQgaGFuZGxlciBmb3IgdGhlIHNhdmUgYnV0dG9uKVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnVwZGF0ZVBhZ2VOYW1lRXZlbnQgPSBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdGhpcy5tZW51SXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2VkaXQnKSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZWwgaXMgdGhlIGNsaWNrZWQgYnV0dG9uLCB3ZSdsbCBuZWVkIGFjY2VzcyB0byB0aGUgaW5wdXRcbiAgICAgICAgICAgICAgICB2YXIgdGhlSW5wdXQgPSB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJwYWdlXCJdJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9tYWtlIHN1cmUgdGhlIHBhZ2UncyBuYW1lIGlzIE9LXG4gICAgICAgICAgICAgICAgaWYoIHNpdGUuY2hlY2tQYWdlTmFtZSh0aGVJbnB1dC52YWx1ZSkgKSB7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IHNpdGUucHJlcFBhZ2VOYW1lKCB0aGVJbnB1dC52YWx1ZSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInBhZ2VcIl0nKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdhLm1lbnVJdGVtTGluaycpLmlubmVySFRNTCA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdhLm1lbnVJdGVtTGluaycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnZWRpdCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgbGlua3MgZHJvcGRvd24gaXRlbVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmtzRHJvcGRvd25JdGVtLnRleHQgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0uc2V0QXR0cmlidXRlKCd2YWx1ZScsIHRoaXMubmFtZStcIi5odG1sXCIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy91cGRhdGUgdGhlIHBhZ2UgbmFtZSBvbiB0aGUgY2FudmFzXG4gICAgICAgICAgICAgICAgICAgIHNpdGUucGFnZVRpdGxlLmlubmVySFRNTCA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2NoYW5nZWQgcGFnZSB0aXRsZSwgd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhbGVydChzaXRlLnBhZ2VOYW1lRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBkZWxldGVzIHRoaXMgZW50aXJlIHBhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZWxldGUgZnJvbSB0aGUgU2l0ZVxuICAgICAgICAgICAgZm9yKCB2YXIgaSBpbiBzaXRlLnNpdGVQYWdlcyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggc2l0ZS5zaXRlUGFnZXNbaV0gPT09IHRoaXMgKSB7Ly9nb3QgYSBtYXRjaCFcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGZyb20gc2l0ZS5zaXRlUGFnZXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5zaXRlUGFnZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZnJvbSBjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRVTC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vYWRkIHRvIGRlbGV0ZWQgcGFnZXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5wYWdlc1RvRGVsZXRlLnB1c2godGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBwYWdlJ3MgbWVudSBpdGVtXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudUl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0IHRoZSBwYWdlcyBsaW5rIGRyb3Bkb3duIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vYWN0aXZhdGUgdGhlIGZpcnN0IHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5zaXRlUGFnZXNbMF0uc2VsZWN0UGFnZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9wYWdlIHdhcyBkZWxldGVkLCBzbyB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNoZWNrcyBpZiB0aGUgcGFnZSBpcyBlbXB0eSwgaWYgc28gc2hvdyB0aGUgJ2VtcHR5JyBtZXNzYWdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdGhpcy5ibG9ja3MubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUubWVzc2FnZVN0YXJ0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIHNpdGUuZGl2RnJhbWVXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2VtcHR5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzaXRlLm1lc3NhZ2VTdGFydC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIHNpdGUuZGl2RnJhbWVXcmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2VtcHR5Jyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcHJlcHMvc3RyaXBzIHRoaXMgcGFnZSBkYXRhIGZvciBhIHBlbmRpbmcgYWpheCByZXF1ZXN0XG4gICAgICAgICovXG4gICAgICAgIHRoaXMucHJlcEZvclNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBhZ2UgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwYWdlLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgICAgICAgICBwYWdlLnBhZ2VTZXR0aW5ncyA9IHRoaXMucGFnZVNldHRpbmdzO1xuICAgICAgICAgICAgcGFnZS5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgICAgICAgICAgIHBhZ2UucGFnZUlEID0gdGhpcy5wYWdlSUQ7XG4gICAgICAgICAgICBwYWdlLmJsb2NrcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcHJvY2VzcyB0aGUgYmxvY2tzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgeCA9IDA7IHggPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IHgrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuYmxvY2tzW3hdLnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmZyYW1lQ29udGVudCA9IFwiPGh0bWw+XCIrJCgnI3NhbmRib3hlcyAjJyt0aGlzLmJsb2Nrc1t4XS5zYW5kYm94KS5jb250ZW50cygpLmZpbmQoJ2h0bWwnKS5odG1sKCkrXCI8L2h0bWw+XCI7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLnNhbmRib3ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBibG9jay5sb2FkZXJGdW5jdGlvbiA9IHRoaXMuYmxvY2tzW3hdLnNhbmRib3hfbG9hZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBibG9jay5mcmFtZUNvbnRlbnQgPSB0aGlzLmJsb2Nrc1t4XS5nZXRTb3VyY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suc2FuZGJveCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBibG9jay5sb2FkZXJGdW5jdGlvbiA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrLmZyYW1lSGVpZ2h0ID0gdGhpcy5ibG9ja3NbeF0uZnJhbWVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgYmxvY2sub3JpZ2luYWxVcmwgPSB0aGlzLmJsb2Nrc1t4XS5vcmlnaW5hbFVybDtcbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMuYmxvY2tzW3hdLmdsb2JhbCApIGJsb2NrLmZyYW1lc19nbG9iYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBhZ2UuYmxvY2tzLnB1c2goYmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBwYWdlO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGdlbmVyYXRlcyB0aGUgZnVsbCBwYWdlLCB1c2luZyBza2VsZXRvbi5odG1sXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZnVsbFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBhZ2UgPSB0aGlzOy8vcmVmZXJlbmNlIHRvIHNlbGYgZm9yIGxhdGVyXG4gICAgICAgICAgICBwYWdlLnNjcmlwdHMgPSBbXTsvL21ha2Ugc3VyZSBpdCdzIGVtcHR5LCB3ZSdsbCBzdG9yZSBzY3JpcHQgVVJMcyBpbiB0aGVyZSBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbmV3RG9jTWFpblBhcmVudCA9ICQoJ2lmcmFtZSNza2VsZXRvbicpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZW1wdHkgb3V0IHRoZSBza2VsZXRvbiBmaXJzdFxuICAgICAgICAgICAgJCgnaWZyYW1lI3NrZWxldG9uJykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5odG1sKCcnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZW1vdmUgb2xkIHNjcmlwdCB0YWdzXG4gICAgICAgICAgICAkKCdpZnJhbWUjc2tlbGV0b24nKS5jb250ZW50cygpLmZpbmQoICdzY3JpcHQnICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHRoZUNvbnRlbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuYmxvY2tzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZ3JhYiB0aGUgYmxvY2sgY29udGVudFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJsb2Nrc1tpXS5zYW5kYm94ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMgPSAkKCcjc2FuZGJveGVzICMnK3RoaXMuYmxvY2tzW2ldLnNhbmRib3gpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMgPSAkKHRoaXMuYmxvY2tzW2ldLmZyYW1lRG9jdW1lbnQuYm9keSkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vcmVtb3ZlIHZpZGVvIGZyYW1lQ292ZXJzXG4gICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCgnLmZyYW1lQ292ZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSB2aWRlbyBmcmFtZVdyYXBwZXJzXG4gICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCgnLnZpZGVvV3JhcHBlcicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBjbnQgPSAkKHRoaXMpLmNvbnRlbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVwbGFjZVdpdGgoY250KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgc3R5bGUgbGVmdG92ZXJzIGZyb20gdGhlIHN0eWxlIGVkaXRvclxuICAgICAgICAgICAgICAgIGZvciggdmFyIGtleSBpbiBiQ29uZmlnLmVkaXRhYmxlSXRlbXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZUNvbnRlbnRzLmZpbmQoIGtleSApLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVBdHRyKCdkYXRhLXNlbGVjdG9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKCdvdXRsaW5lJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ291dGxpbmUtb2Zmc2V0JywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ2N1cnNvcicsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoICQodGhpcykuYXR0cignc3R5bGUnKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgc3R5bGUgbGVmdG92ZXJzIGZyb20gdGhlIGNvbnRlbnQgZWRpdG9yXG4gICAgICAgICAgICAgICAgZm9yICggdmFyIHggPSAwOyB4IDwgYkNvbmZpZy5lZGl0YWJsZUNvbnRlbnQubGVuZ3RoOyArK3gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZUNvbnRlbnRzLmZpbmQoIGJDb25maWcuZWRpdGFibGVDb250ZW50W3hdICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ2RhdGEtc2VsZWN0b3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2FwcGVuZCB0byBET00gaW4gdGhlIHNrZWxldG9uXG4gICAgICAgICAgICAgICAgbmV3RG9jTWFpblBhcmVudC5hcHBlbmQoICQodGhlQ29udGVudHMuaHRtbCgpKSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZG8gd2UgbmVlZCB0byBpbmplY3QgYW55IHNjcmlwdHM/XG4gICAgICAgICAgICAgICAgdmFyIHNjcmlwdHMgPSAkKHRoaXMuYmxvY2tzW2ldLmZyYW1lRG9jdW1lbnQuYm9keSkuZmluZCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgdmFyIHRoZUlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2tlbGV0b25cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBzY3JpcHRzLnNpemUoKSA+IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY3JpcHRzLmVhY2goZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoICQodGhpcykudGV4dCgpICE9PSAnJyApIHsvL3NjcmlwdCB0YWdzIHdpdGggY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdCA9IHRoZUlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQuaW5uZXJIVE1MID0gJCh0aGlzKS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoICQodGhpcykuYXR0cignc3JjJykgIT09IG51bGwgJiYgcGFnZS5zY3JpcHRzLmluZGV4T2YoJCh0aGlzKS5hdHRyKCdzcmMnKSkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlIGluZGV4T2YgdG8gbWFrZSBzdXJlIGVhY2ggc2NyaXB0IG9ubHkgYXBwZWFycyBvbiB0aGUgcHJvZHVjZWQgcGFnZSBvbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0ID0gdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC5zcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZUlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlLnNjcmlwdHMucHVzaCgkKHRoaXMpLmF0dHIoJ3NyYycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBDaGVja3MgaWYgYWxsIGJsb2NrcyBvbiB0aGlzIHBhZ2UgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nXG4gICAgICAgICovXG4gICAgICAgIHRoaXMubG9hZGVkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgaTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPHRoaXMuYmxvY2tzLmxlbmd0aDsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5ibG9ja3NbaV0ubG9hZGVkICkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNsZWFyIG91dCB0aGlzIHBhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmJsb2Nrcy5wb3AoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUoIGJsb2NrICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2suZGVsZXRlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2sgPSB0aGlzLmJsb2Nrcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIEhlaWdodCBhZGp1c3RtZW50IGZvciBhbGwgYmxvY2tzIG9uIHRoZSBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuaGVpZ2h0QWRqdXN0bWVudCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja3NbaV0uaGVpZ2h0QWRqdXN0bWVudCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vbG9vcCB0aHJvdWdoIHRoZSBmcmFtZXMvYmxvY2tzXG4gICAgICAgIFxuICAgICAgICBpZiggcGFnZS5oYXNPd25Qcm9wZXJ0eSgnYmxvY2tzJykgKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgeCA9IDA7IHggPCBwYWdlLmJsb2Nrcy5sZW5ndGg7IHgrKyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBCbG9ja1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEJsb2NrKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwYWdlLmJsb2Nrc1t4XS5zcmMgPSBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvZ2V0ZnJhbWUvXCIrcGFnZS5ibG9ja3NbeF0uZnJhbWVzX2lkO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vc2FuZGJveGVkIGJsb2NrP1xuICAgICAgICAgICAgICAgIGlmKCBwYWdlLmJsb2Nrc1t4XS5mcmFtZXNfc2FuZGJveCA9PT0gJzEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLnNhbmRib3ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBuZXdCbG9jay5zYW5kYm94X2xvYWRlciA9IHBhZ2UuYmxvY2tzW3hdLmZyYW1lc19sb2FkZXJmdW5jdGlvbjtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbmV3QmxvY2suZnJhbWVJRCA9IHBhZ2UuYmxvY2tzW3hdLmZyYW1lc19pZDtcbiAgICAgICAgICAgICAgICBpZiAoIHBhZ2UuYmxvY2tzW3hdLmZyYW1lc19nbG9iYWwgPT09ICcxJyApIG5ld0Jsb2NrLmdsb2JhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlUGFyZW50TEkocGFnZS5ibG9ja3NbeF0uZnJhbWVzX2hlaWdodCk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlRnJhbWUocGFnZS5ibG9ja3NbeF0pO1xuICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZUZyYW1lQ292ZXIoKTtcbiAgICAgICAgICAgICAgICBuZXdCbG9jay5pbnNlcnRCbG9ja0ludG9Eb20odGhpcy5wYXJlbnRVTCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBibG9jayB0byB0aGUgbmV3IHBhZ2VcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrcy5wdXNoKG5ld0Jsb2NrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0aGlzIHBhZ2UgdG8gdGhlIHNpdGUgb2JqZWN0XG4gICAgICAgIHNpdGUuc2l0ZVBhZ2VzLnB1c2goIHRoaXMgKTtcbiAgICAgICAgXG4gICAgICAgIC8vcGxhbnQgdGhlIG5ldyBVTCBpbiB0aGUgRE9NIChvbiB0aGUgY2FudmFzKVxuICAgICAgICBzaXRlLmRpdkNhbnZhcy5hcHBlbmRDaGlsZCh0aGlzLnBhcmVudFVMKTtcbiAgICAgICAgXG4gICAgICAgIC8vbWFrZSB0aGUgYmxvY2tzL2ZyYW1lcyBpbiBlYWNoIHBhZ2Ugc29ydGFibGVcbiAgICAgICAgXG4gICAgICAgIHZhciB0aGVQYWdlID0gdGhpcztcbiAgICAgICAgXG4gICAgICAgICQodGhpcy5wYXJlbnRVTCkuc29ydGFibGUoe1xuICAgICAgICAgICAgcmV2ZXJ0OiB0cnVlLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiZHJvcC1ob3ZlclwiLFxuICAgICAgICAgICAgaGFuZGxlOiAnLmRyYWdCbG9jaycsXG4gICAgICAgICAgICBjYW5jZWw6ICcnLFxuICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNpdGUubW92ZU1vZGUoJ29mZicpO1xuICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKCAhc2l0ZS5sb2FkZWQoKSApIGJ1aWxkZXJVSS5jYW52YXNMb2FkaW5nKCdvbicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uKGV2ZW50LCB1aSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy90ZW1wbGF0ZSBvciByZWd1bGFyIGJsb2NrP1xuICAgICAgICAgICAgICAgIHZhciBhdHRyID0gdWkuaXRlbS5hdHRyKCdkYXRhLWZyYW1lcycpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld0Jsb2NrO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgIT09IHR5cGVvZiB1bmRlZmluZWQgJiYgYXR0ciAhPT0gZmFsc2UpIHsvL3RlbXBsYXRlLCBidWlsZCBpdFxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N0YXJ0JykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2NsZWFyIG91dCBhbGwgYmxvY2tzIG9uIHRoaXMgcGFnZSAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlUGFnZS5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgdGhlIG5ldyBmcmFtZXNcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZyYW1lSURzID0gdWkuaXRlbS5hdHRyKCdkYXRhLWZyYW1lcycpLnNwbGl0KCctJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWlnaHRzID0gdWkuaXRlbS5hdHRyKCdkYXRhLWhlaWdodHMnKS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXJscyA9IHVpLml0ZW0uYXR0cignZGF0YS1vcmlnaW5hbHVybHMnKS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGZvciggdmFyIHggPSAwOyB4IDwgZnJhbWVJRHMubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QmxvY2sgPSBuZXcgQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZVBhcmVudExJKGhlaWdodHNbeF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnJhbWVEYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lRGF0YS5zcmMgPSBhcHBVSS5zaXRlVXJsKydzaXRlcy9nZXRmcmFtZS8nK2ZyYW1lSURzW3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19vcmlnaW5hbF91cmwgPSBhcHBVSS5zaXRlVXJsKydzaXRlcy9nZXRmcmFtZS8nK2ZyYW1lSURzW3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19oZWlnaHQgPSBoZWlnaHRzW3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jay5jcmVhdGVGcmFtZSggZnJhbWVEYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jay5jcmVhdGVGcmFtZUNvdmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jay5pbnNlcnRCbG9ja0ludG9Eb20odGhlUGFnZS5wYXJlbnRVTCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBibG9jayB0byB0aGUgbmV3IHBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVBhZ2UuYmxvY2tzLnB1c2gobmV3QmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2Ryb3BwZWQgZWxlbWVudCwgc28gd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3NldCB0aGUgdGVtcGF0ZUlEXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXJVSS50ZW1wbGF0ZUlEID0gdWkuaXRlbS5hdHRyKCdkYXRhLXBhZ2VpZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vbWFrZSBzdXJlIG5vdGhpbmcgZ2V0cyBkcm9wcGVkIGluIHRoZSBsc2l0XG4gICAgICAgICAgICAgICAgICAgIHVpLml0ZW0uaHRtbChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBkcmFnIHBsYWNlIGhvbGRlclxuICAgICAgICAgICAgICAgICAgICAkKCdib2R5IC51aS1zb3J0YWJsZS1oZWxwZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsvL3JlZ3VsYXIgYmxvY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9hcmUgd2UgZGVhbGluZyB3aXRoIGEgbmV3IGJsb2NrIGJlaW5nIGRyb3BwZWQgb250byB0aGUgY2FudmFzLCBvciBhIHJlb3JkZXJpbmcgb2cgYmxvY2tzIGFscmVhZHkgb24gdGhlIGNhbnZhcz9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoIHVpLml0ZW0uZmluZCgnLmZyYW1lQ292ZXIgPiBidXR0b24nKS5zaXplKCkgPiAwICkgey8vcmUtb3JkZXJpbmcgb2YgYmxvY2tzIG9uIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gbmVlZCB0byBjcmVhdGUgYSBuZXcgYmxvY2sgb2JqZWN0LCB3ZSBzaW1wbHkgbmVlZCB0byBtYWtlIHN1cmUgdGhlIHBvc2l0aW9uIG9mIHRoZSBleGlzdGluZyBibG9jayBpbiB0aGUgU2l0ZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaXMgY2hhbmdlZCB0byByZWZsZWN0IHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGJsb2NrIG9uIHRoIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcmFtZUlEID0gdWkuaXRlbS5maW5kKCdpZnJhbWUnKS5hdHRyKCdpZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1BvcyA9IHVpLml0ZW0uaW5kZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2Uuc2V0UG9zaXRpb24oZnJhbWVJRCwgbmV3UG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsvL25ldyBibG9jayBvbiBjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZXcgYmxvY2sgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QmxvY2sgPSBuZXcgQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jay5wbGFjZU9uQ2FudmFzKHVpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFydDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuXG4gICAgICAgICAgICAgICAgc2l0ZS5tb3ZlTW9kZSgnb24nKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHVpLml0ZW0uZmluZCgnLmZyYW1lQ292ZXInKS5zaXplKCkgIT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkZXJVSS5mcmFtZUNvbnRlbnRzID0gdWkuaXRlbS5maW5kKCdpZnJhbWUnKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciApLmh0bWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvdmVyOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcjc3RhcnQnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gdGhlIHBhZ2VzIG1lbnVcbiAgICAgICAgdGhpcy5tZW51SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJyk7XG4gICAgICAgIHRoaXMubWVudUl0ZW0uaW5uZXJIVE1MID0gdGhpcy5wYWdlTWVudVRlbXBsYXRlO1xuICAgICAgICBcbiAgICAgICAgJCh0aGlzLm1lbnVJdGVtKS5maW5kKCdhOmZpcnN0JykudGV4dChwYWdlTmFtZSkuYXR0cignaHJlZicsICcjcGFnZScrY291bnRlcik7XG4gICAgICAgIFxuICAgICAgICB2YXIgdGhlTGluayA9ICQodGhpcy5tZW51SXRlbSkuZmluZCgnYTpmaXJzdCcpLmdldCgwKTtcbiAgICAgICAgXG4gICAgICAgIC8vYmluZCBzb21lIGV2ZW50c1xuICAgICAgICB0aGlzLm1lbnVJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdhLmZpbGVFZGl0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignYS5maWxlU2F2ZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EuZmlsZURlbCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gdGhlIHBhZ2UgbGluayBkcm9wZG93blxuICAgICAgICB0aGlzLmxpbmtzRHJvcGRvd25JdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnT1BUSU9OJyk7XG4gICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0uc2V0QXR0cmlidXRlKCd2YWx1ZScsIHBhZ2VOYW1lK1wiLmh0bWxcIik7XG4gICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0udGV4dCA9IHBhZ2VOYW1lO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBidWlsZGVyVUkuZHJvcGRvd25QYWdlTGlua3MuYXBwZW5kQ2hpbGQoIHRoaXMubGlua3NEcm9wZG93bkl0ZW0gKTtcbiAgICAgICAgXG4gICAgICAgIHNpdGUucGFnZXNNZW51LmFwcGVuZENoaWxkKHRoaXMubWVudUl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgUGFnZS5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJjbGlja1wiOiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGVFZGl0JykgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdFBhZ2VOYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZmlsZVNhdmUnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYWdlTmFtZUV2ZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlRGVsJykgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhlUGFnZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsRGVsZXRlUGFnZSkubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsRGVsZXRlUGFnZSkub2ZmKCdjbGljaycsICcjZGVsZXRlUGFnZUNvbmZpcm0nKS5vbignY2xpY2snLCAnI2RlbGV0ZVBhZ2VDb25maXJtJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVBhZ2UuZGVsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsRGVsZXRlUGFnZSkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQYWdlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLypcbiAgICAgICAgQmxvY2sgY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uIEJsb2NrICgpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZnJhbWVJRCA9IDA7XG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2FuZGJveCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNhbmRib3hfbG9hZGVyID0gJyc7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gJyc7Ly8nJywgJ2NoYW5nZWQnIG9yICduZXcnXG4gICAgICAgIHRoaXMuZ2xvYmFsID0gZmFsc2U7XG4gICAgICAgIHRoaXMub3JpZ2luYWxVcmwgPSAnJztcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGFyZW50TEkgPSB7fTtcbiAgICAgICAgdGhpcy5mcmFtZUNvdmVyID0ge307XG4gICAgICAgIHRoaXMuZnJhbWUgPSB7fTtcbiAgICAgICAgdGhpcy5mcmFtZURvY3VtZW50ID0ge307XG4gICAgICAgIHRoaXMuZnJhbWVIZWlnaHQgPSAwO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5hbm5vdCA9IHt9O1xuICAgICAgICB0aGlzLmFubm90VGltZW91dCA9IHt9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNyZWF0ZXMgdGhlIHBhcmVudCBjb250YWluZXIgKExJKVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZVBhcmVudExJID0gZnVuY3Rpb24oaGVpZ2h0KSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2VsZW1lbnQnKTtcbiAgICAgICAgICAgIC8vdGhpcy5wYXJlbnRMSS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2hlaWdodDogJytoZWlnaHQrJ3B4Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjcmVhdGVzIHRoZSBpZnJhbWUgb24gdGhlIGNhbnZhc1xuICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lID0gZnVuY3Rpb24oZnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lGUkFNRScpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2ZyYW1lYm9yZGVyJywgMCk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJywgMCk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywgZnJhbWUuc3JjKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsdXJsJywgZnJhbWUuZnJhbWVzX29yaWdpbmFsX3VybCk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsVXJsID0gZnJhbWUuZnJhbWVzX29yaWdpbmFsX3VybDtcbiAgICAgICAgICAgIC8vdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JywgZnJhbWUuZnJhbWVzX2hlaWdodCk7XG4gICAgICAgICAgICAvL3RoaXMuZnJhbWVIZWlnaHQgPSBmcmFtZS5mcmFtZXNfaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuZnJhbWUpLnVuaXF1ZUlkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2FuZGJveD9cbiAgICAgICAgICAgIGlmKCB0aGlzLnNhbmRib3ggIT09IGZhbHNlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUuc2V0QXR0cmlidXRlKCdkYXRhLWxvYWRlcmZ1bmN0aW9uJywgdGhpcy5zYW5kYm94X2xvYWRlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2FuZGJveCcsIHRoaXMuc2FuZGJveCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZWNyZWF0ZSB0aGUgc2FuZGJveGVkIGlmcmFtZSBlbHNld2hlcmVcbiAgICAgICAgICAgICAgICB2YXIgc2FuZGJveGVkRnJhbWUgPSAkKCc8aWZyYW1lIHNyYz1cIicrZnJhbWUuc3JjKydcIiBpZD1cIicrdGhpcy5zYW5kYm94KydcIiBzYW5kYm94PVwiYWxsb3ctc2FtZS1vcmlnaW5cIj48L2lmcmFtZT4nKTtcbiAgICAgICAgICAgICAgICAkKCcjc2FuZGJveGVzJykuYXBwZW5kKCBzYW5kYm94ZWRGcmFtZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGluc2VydCB0aGUgaWZyYW1lIGludG8gdGhlIERPTSBvbiB0aGUgY2FudmFzXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuaW5zZXJ0QmxvY2tJbnRvRG9tID0gZnVuY3Rpb24odGhlVUwpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5hcHBlbmRDaGlsZCh0aGlzLmZyYW1lKTtcbiAgICAgICAgICAgIHRoZVVMLmFwcGVuZENoaWxkKCB0aGlzLnBhcmVudExJICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMsIGZhbHNlKTtcblxuICAgICAgICAgICAgYnVpbGRlclVJLmNhbnZhc0xvYWRpbmcoJ29uJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgc2V0cyB0aGUgZnJhbWUgZG9jdW1lbnQgZm9yIHRoZSBibG9jaydzIGlmcmFtZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldEZyYW1lRG9jdW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zZXQgdGhlIGZyYW1lIGRvY3VtZW50IGFzIHdlbGxcbiAgICAgICAgICAgIGlmKCB0aGlzLmZyYW1lLmNvbnRlbnREb2N1bWVudCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lRG9jdW1lbnQgPSB0aGlzLmZyYW1lLmNvbnRlbnREb2N1bWVudDsgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZURvY3VtZW50ID0gdGhpcy5mcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3RoaXMuaGVpZ2h0QWRqdXN0bWVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY3JlYXRlcyB0aGUgZnJhbWUgY292ZXIgYW5kIGJsb2NrIGFjdGlvbiBidXR0b25cbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZUNvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYnVpbGQgdGhlIGZyYW1lIGNvdmVyIGFuZCBibG9jayBhY3Rpb24gYnV0dG9uc1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuY2xhc3NMaXN0LmFkZCgnZnJhbWVDb3ZlcicpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLmNsYXNzTGlzdC5hZGQoJ2ZyZXNoJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRlbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgZGVsQnV0dG9uLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnYnRuIGJ0bi1pbnZlcnNlIGJ0bi1zbSBkZWxldGVCbG9jaycpO1xuICAgICAgICAgICAgZGVsQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIGRlbEJ1dHRvbi5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmdWktdHJhc2hcIj48L2k+IDxzcGFuPnJlbW92ZTwvc3Bhbj4nO1xuICAgICAgICAgICAgZGVsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgcmVzZXRCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdidG4gYnRuLWludmVyc2UgYnRuLXNtIHJlc2V0QmxvY2snKTtcbiAgICAgICAgICAgIHJlc2V0QnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIHJlc2V0QnV0dG9uLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhIGZhLXJlZnJlc2hcIj48L2k+IDxzcGFuPnJlc2V0PC9zcGFuPic7XG4gICAgICAgICAgICByZXNldEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgaHRtbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgaHRtbEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J0biBidG4taW52ZXJzZSBidG4tc20gaHRtbEJsb2NrJyk7XG4gICAgICAgICAgICBodG1sQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIGh0bWxCdXR0b24uaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEgZmEtY29kZVwiPjwvaT4gPHNwYW4+c291cmNlPC9zcGFuPic7XG4gICAgICAgICAgICBodG1sQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuXG4gICAgICAgICAgICB2YXIgZHJhZ0J1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgZHJhZ0J1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J0biBidG4taW52ZXJzZSBidG4tc20gZHJhZ0Jsb2NrJyk7XG4gICAgICAgICAgICBkcmFnQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIGRyYWdCdXR0b24uaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEgZmEtYXJyb3dzXCI+PC9pPiA8c3Bhbj5Nb3ZlPC9zcGFuPic7XG4gICAgICAgICAgICBkcmFnQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuXG4gICAgICAgICAgICB2YXIgZ2xvYmFsTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMQUJFTCcpO1xuICAgICAgICAgICAgZ2xvYmFsTGFiZWwuY2xhc3NMaXN0LmFkZCgnY2hlY2tib3gnKTtcbiAgICAgICAgICAgIGdsb2JhbExhYmVsLmNsYXNzTGlzdC5hZGQoJ3ByaW1hcnknKTtcbiAgICAgICAgICAgIHZhciBnbG9iYWxDaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0lOUFVUJyk7XG4gICAgICAgICAgICBnbG9iYWxDaGVja2JveC50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgICAgIGdsb2JhbENoZWNrYm94LnNldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnLCAnY2hlY2tib3gnKTtcbiAgICAgICAgICAgIGdsb2JhbENoZWNrYm94LmNoZWNrZWQgPSB0aGlzLmdsb2JhbDtcbiAgICAgICAgICAgIGdsb2JhbExhYmVsLmFwcGVuZENoaWxkKGdsb2JhbENoZWNrYm94KTtcbiAgICAgICAgICAgIHZhciBnbG9iYWxUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0dsb2JhbCcpO1xuICAgICAgICAgICAgZ2xvYmFsTGFiZWwuYXBwZW5kQ2hpbGQoZ2xvYmFsVGV4dCk7XG5cbiAgICAgICAgICAgIHZhciB0cmlnZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdHJpZ2dlci5jbGFzc0xpc3QuYWRkKCdmdWktZ2VhcicpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZChkZWxCdXR0b24pO1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLmFwcGVuZENoaWxkKHJlc2V0QnV0dG9uKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZChodG1sQnV0dG9uKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZChkcmFnQnV0dG9uKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZChnbG9iYWxMYWJlbCk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuYXBwZW5kQ2hpbGQodHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLmFwcGVuZENoaWxkKHRoaXMuZnJhbWVDb3Zlcik7XG5cbiAgICAgICAgICAgIHZhciB0aGVCbG9jayA9IHRoaXM7XG5cbiAgICAgICAgICAgICQoZ2xvYmFsQ2hlY2tib3gpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICAgICAgdGhlQmxvY2sudG9nZ2xlR2xvYmFsKGUpO1xuXG4gICAgICAgICAgICB9KS5yYWRpb2NoZWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnRvZ2dsZUdsb2JhbCA9IGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgIGlmICggZS5jdXJyZW50VGFyZ2V0LmNoZWNrZWQgKSB0aGlzLmdsb2JhbCA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIHRoaXMuZ2xvYmFsID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBhdXRvbWF0aWNhbGx5IGNvcnJlY3RzIHRoZSBoZWlnaHQgb2YgdGhlIGJsb2NrJ3MgaWZyYW1lIGRlcGVuZGluZyBvbiBpdHMgY29udGVudFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmhlaWdodEFkanVzdG1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBPYmplY3Qua2V5cyh0aGlzLmZyYW1lRG9jdW1lbnQpLmxlbmd0aCAhPT0gMCApIHtcblxuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGJvZHlIZWlnaHQgPSB0aGlzLmZyYW1lRG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VDb250YWluZXJIZWlnaHQgPSB0aGlzLmZyYW1lRG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGJvZHlIZWlnaHQgPiBwYWdlQ29udGFpbmVySGVpZ2h0ICYmICF0aGlzLmZyYW1lRG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoIGJDb25maWcuYm9keVBhZGRpbmdDbGFzcyApICkgaGVpZ2h0ID0gcGFnZUNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgICAgICBlbHNlIGhlaWdodCA9IGJvZHlIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lLnN0eWxlLmhlaWdodCA9IGhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQrXCJweFwiO1xuICAgICAgICAgICAgICAgIC8vdGhpcy5mcmFtZUNvdmVyLnN0eWxlLmhlaWdodCA9IGhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZUhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgYSBibG9ja1xuICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIERPTS9jYW52YXMgd2l0aCBhIG5pY2UgYW5pbWF0aW9uXG4gICAgICAgICAgICAkKHRoaXMuZnJhbWUucGFyZW50Tm9kZSkuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZW1vdmUgZnJvbSBibG9ja3MgYXJyYXkgaW4gdGhlIGFjdGl2ZSBwYWdlXG4gICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UuZGVsZXRlQmxvY2sodGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2FuYm94XG4gICAgICAgICAgICBpZiggdGhpcy5zYW5iZG94ICkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCB0aGlzLnNhbmRib3ggKS5yZW1vdmUoKTsgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbGVtZW50IHdhcyBkZWxldGVkLCBzbyB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcmVzZXRzIGEgYmxvY2sgdG8gaXQncyBvcmlnbmFsIHN0YXRlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoZmlyZUV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmICggdHlwZW9mIGZpcmVFdmVudCA9PT0gJ3VuZGVmaW5lZCcpIGZpcmVFdmVudCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVzZXQgZnJhbWUgYnkgcmVsb2FkaW5nIGl0XG4gICAgICAgICAgICB0aGlzLmZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24gPSB0aGlzLmZyYW1lLmdldEF0dHJpYnV0ZSgnZGF0YS1vcmlnaW5hbHVybCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3NhbmRib3g/XG4gICAgICAgICAgICBpZiggdGhpcy5zYW5kYm94ICkge1xuICAgICAgICAgICAgICAgIHZhciBzYW5kYm94RnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLnNhbmRib3gpLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVsb2FkKCk7ICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbGVtZW50IHdhcyBkZWxldGVkLCBzbyB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuXG4gICAgICAgICAgICBidWlsZGVyVUkuY2FudmFzTG9hZGluZygnb24nKTtcblxuICAgICAgICAgICAgaWYgKCBmaXJlRXZlbnQgKSBwdWJsaXNoZXIucHVibGlzaCgnb25CbG9ja0NoYW5nZScsIHRoaXMsICdyZWxvYWQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBsYXVuY2hlcyB0aGUgc291cmNlIGNvZGUgZWRpdG9yXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc291cmNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vaGlkZSB0aGUgaWZyYW1lXG4gICAgICAgICAgICB0aGlzLmZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGlzYWJsZSBzb3J0YWJsZSBvbiB0aGUgcGFyZW50TElcbiAgICAgICAgICAgICQodGhpcy5wYXJlbnRMSS5wYXJlbnROb2RlKS5zb3J0YWJsZSgnZGlzYWJsZScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2J1aWx0IGVkaXRvciBlbGVtZW50XG4gICAgICAgICAgICB2YXIgdGhlRWRpdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgICAgICB0aGVFZGl0b3IuY2xhc3NMaXN0LmFkZCgnYWNlRWRpdG9yJyk7XG4gICAgICAgICAgICAkKHRoZUVkaXRvcikudW5pcXVlSWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5hcHBlbmRDaGlsZCh0aGVFZGl0b3IpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2J1aWxkIGFuZCBhcHBlbmQgZXJyb3IgZHJhd2VyXG4gICAgICAgICAgICB2YXIgbmV3TEkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpO1xuICAgICAgICAgICAgdmFyIGVycm9yRHJhd2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgICAgICBlcnJvckRyYXdlci5jbGFzc0xpc3QuYWRkKCdlcnJvckRyYXdlcicpO1xuICAgICAgICAgICAgZXJyb3JEcmF3ZXIuc2V0QXR0cmlidXRlKCdpZCcsICdkaXZfZXJyb3JEcmF3ZXInKTtcbiAgICAgICAgICAgIGVycm9yRHJhd2VyLmlubmVySFRNTCA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4teHMgYnRuLWVtYm9zc2VkIGJ0bi1kZWZhdWx0IGJ1dHRvbl9jbGVhckVycm9yRHJhd2VyXCIgaWQ9XCJidXR0b25fY2xlYXJFcnJvckRyYXdlclwiPkNMRUFSPC9idXR0b24+JztcbiAgICAgICAgICAgIG5ld0xJLmFwcGVuZENoaWxkKGVycm9yRHJhd2VyKTtcbiAgICAgICAgICAgIGVycm9yRHJhd2VyLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdMSSwgdGhpcy5wYXJlbnRMSS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFjZS5jb25maWcuc2V0KFwiYmFzZVBhdGhcIiwgXCIvanMvdmVuZG9yL2FjZVwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRoZUlkID0gdGhlRWRpdG9yLmdldEF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgICAgIHZhciBlZGl0b3IgPSBhY2UuZWRpdCggdGhlSWQgKTtcblxuICAgICAgICAgICAgLy9lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldFVzZVdyYXBNb2RlKHRydWUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZUNvbnRhaW5lciA9IHRoaXMuZnJhbWVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKTtcbiAgICAgICAgICAgIHZhciB0aGVIVE1MID0gcGFnZUNvbnRhaW5lci5pbm5lckhUTUw7XG4gICAgICAgICAgICBcblxuICAgICAgICAgICAgZWRpdG9yLnNldFZhbHVlKCB0aGVIVE1MICk7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvdHdpbGlnaHRcIik7XG4gICAgICAgICAgICBlZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9odG1sXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkub24oXCJjaGFuZ2VBbm5vdGF0aW9uXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2suYW5ub3QgPSBlZGl0b3IuZ2V0U2Vzc2lvbigpLmdldEFubm90YXRpb25zKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGJsb2NrLmFubm90VGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZW91dENvdW50O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCAkKCcjZGl2X2Vycm9yRHJhd2VyIHAnKS5zaXplKCkgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRDb3VudCA9IGJDb25maWcuc291cmNlQ29kZUVkaXRTeW50YXhEZWxheTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0Q291bnQgPSAxMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJsb2NrLmFubm90VGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gYmxvY2suYW5ub3Qpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9jay5hbm5vdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggYmxvY2suYW5ub3Rba2V5XS50ZXh0ICE9PSBcIlN0YXJ0IHRhZyBzZWVuIHdpdGhvdXQgc2VlaW5nIGEgZG9jdHlwZSBmaXJzdC4gRXhwZWN0ZWQgZS5nLiA8IURPQ1RZUEUgaHRtbD4uXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdMaW5lID0gJCgnPHA+PC9wPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3S2V5ID0gJCgnPGI+JytibG9jay5hbm5vdFtrZXldLnR5cGUrJzogPC9iPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SW5mbyA9ICQoJzxzcGFuPiAnK2Jsb2NrLmFubm90W2tleV0udGV4dCArIFwib24gbGluZSBcIiArIFwiIDxiPlwiICsgYmxvY2suYW5ub3Rba2V5XS5yb3crJzwvYj48L3NwYW4+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xpbmUuYXBwZW5kKCBuZXdLZXkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGluZS5hcHBlbmQoIG5ld0luZm8gKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5hcHBlbmQoIG5ld0xpbmUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5jc3MoJ2Rpc3BsYXknKSA9PT0gJ25vbmUnICYmICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5maW5kKCdwJykuc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkaXZfZXJyb3JEcmF3ZXInKS5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSwgdGltZW91dENvdW50KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYnV0dG9uc1xuICAgICAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0JVVFRPTicpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tZGFuZ2VyJyk7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZCgnZWRpdENhbmNlbEJ1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1zbScpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZ1aS1jcm9zc1wiPjwvaT4gPHNwYW4+Q2FuY2VsPC9zcGFuPic7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICAgICAgICAgIHNhdmVCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2VkaXRTYXZlQnV0dG9uJyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1zbScpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmdWktY2hlY2tcIj48L2k+IDxzcGFuPlNhdmU8L3NwYW4+JztcbiAgICAgICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBidXR0b25XcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgICAgICBidXR0b25XcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2VkaXRvckJ1dHRvbnMnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYnV0dG9uV3JhcHBlci5hcHBlbmRDaGlsZCggY2FuY2VsQnV0dG9uICk7XG4gICAgICAgICAgICBidXR0b25XcmFwcGVyLmFwcGVuZENoaWxkKCBzYXZlQnV0dG9uICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkuYXBwZW5kQ2hpbGQoIGJ1dHRvbldyYXBwZXIgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYnVpbGRlclVJLmFjZUVkaXRvcnNbIHRoZUlkIF0gPSBlZGl0b3I7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2FuY2VscyB0aGUgYmxvY2sgc291cmNlIGNvZGUgZWRpdG9yXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY2FuY2VsU291cmNlQmxvY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy9lbmFibGUgZHJhZ2dhYmxlIG9uIHRoZSBMSVxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnBhcmVudE5vZGUpLnNvcnRhYmxlKCdlbmFibGUnKTtcblx0XHRcbiAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlcnJvckRyYXdlclxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLm5leHRTaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgICAgXG4gICAgICAgICAgICAvL2RlbGV0ZSB0aGUgZWRpdG9yXG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLnF1ZXJ5U2VsZWN0b3IoJy5hY2VFZGl0b3InKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQodGhpcy5mcmFtZSkuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuZWRpdG9yQnV0dG9ucycpKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlcyB0aGUgYmxvY2tzIHNvdXJjZSBjb2RlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2F2ZVNvdXJjZUJsb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZW5hYmxlIGRyYWdnYWJsZSBvbiB0aGUgTElcbiAgICAgICAgICAgICQodGhpcy5wYXJlbnRMSS5wYXJlbnROb2RlKS5zb3J0YWJsZSgnZW5hYmxlJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB0aGVJZCA9IHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmFjZUVkaXRvcicpLmdldEF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgICAgIHZhciB0aGVDb250ZW50ID0gYnVpbGRlclVJLmFjZUVkaXRvcnNbdGhlSWRdLmdldFZhbHVlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlcnJvckRyYXdlclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpdl9lcnJvckRyYXdlcicpLnBhcmVudE5vZGUucmVtb3ZlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlZGl0b3JcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmFjZUVkaXRvcicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3VwZGF0ZSB0aGUgZnJhbWUncyBjb250ZW50XG4gICAgICAgICAgICB0aGlzLmZyYW1lRG9jdW1lbnQucXVlcnlTZWxlY3RvciggYkNvbmZpZy5wYWdlQ29udGFpbmVyICkuaW5uZXJIVE1MID0gdGhlQ29udGVudDtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2FuZGJveGVkP1xuICAgICAgICAgICAgaWYoIHRoaXMuc2FuZGJveCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgc2FuZGJveEZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIHRoaXMuc2FuZGJveCApO1xuICAgICAgICAgICAgICAgIHZhciBzYW5kYm94RnJhbWVEb2N1bWVudCA9IHNhbmRib3hGcmFtZS5jb250ZW50RG9jdW1lbnQgfHwgc2FuZGJveEZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYnVpbGRlclVJLnRlbXBGcmFtZSA9IHNhbmRib3hGcmFtZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzYW5kYm94RnJhbWVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5pbm5lckhUTUwgPSB0aGVDb250ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2RvIHdlIG5lZWQgdG8gZXhlY3V0ZSBhIGxvYWRlciBmdW5jdGlvbj9cbiAgICAgICAgICAgICAgICBpZiggdGhpcy5zYW5kYm94X2xvYWRlciAhPT0gJycgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICB2YXIgY29kZVRvRXhlY3V0ZSA9IFwic2FuZGJveEZyYW1lLmNvbnRlbnRXaW5kb3cuXCIrdGhpcy5zYW5kYm94X2xvYWRlcitcIigpXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0bXBGdW5jID0gbmV3IEZ1bmN0aW9uKGNvZGVUb0V4ZWN1dGUpO1xuICAgICAgICAgICAgICAgICAgICB0bXBGdW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnF1ZXJ5U2VsZWN0b3IoJy5lZGl0b3JCdXR0b25zJykpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9hZGp1c3QgaGVpZ2h0IG9mIHRoZSBmcmFtZVxuICAgICAgICAgICAgdGhpcy5oZWlnaHRBZGp1c3RtZW50KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbmV3IHBhZ2UgYWRkZWQsIHdlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYmxvY2sgaGFzIGNoYW5nZWRcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ2NoYW5nZWQnO1xuXG4gICAgICAgICAgICBwdWJsaXNoZXIucHVibGlzaCgnb25CbG9ja0NoYW5nZScsIHRoaXMsICdjaGFuZ2UnKTtcbiAgICAgICAgICAgIHB1Ymxpc2hlci5wdWJsaXNoKCdvbkJsb2NrTG9hZGVkJywgdGhpcyk7XG5cbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2xlYXJzIG91dCB0aGUgZXJyb3IgZHJhd2VyXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYXJFcnJvckRyYXdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcHMgPSB0aGlzLnBhcmVudExJLm5leHRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3JBbGwoJ3AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBwc1tpXS5yZW1vdmUoKTsgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHRvZ2dsZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhpcyBibG9jaydzIGZyYW1lQ292ZXJcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy50b2dnbGVDb3ZlciA9IGZ1bmN0aW9uKG9uT3JPZmYpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIG9uT3JPZmYgPT09ICdPbicgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuZnJhbWVDb3ZlcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvbk9yT2ZmID09PSAnT2ZmJyApIHtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudExJLnF1ZXJ5U2VsZWN0b3IoJy5mcmFtZUNvdmVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICByZXR1cm5zIHRoZSBmdWxsIHNvdXJjZSBjb2RlIG9mIHRoZSBibG9jaydzIGZyYW1lXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZ2V0U291cmNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBcIjxodG1sPlwiO1xuICAgICAgICAgICAgc291cmNlICs9IHRoaXMuZnJhbWVEb2N1bWVudC5oZWFkLm91dGVySFRNTDtcbiAgICAgICAgICAgIHNvdXJjZSArPSB0aGlzLmZyYW1lRG9jdW1lbnQuYm9keS5vdXRlckhUTUw7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcGxhY2VzIGEgZHJhZ2dlZC9kcm9wcGVkIGJsb2NrIGZyb20gdGhlIGxlZnQgc2lkZWJhciBvbnRvIHRoZSBjYW52YXNcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wbGFjZU9uQ2FudmFzID0gZnVuY3Rpb24odWkpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9mcmFtZSBkYXRhLCB3ZSdsbCBuZWVkIHRoaXMgYmVmb3JlIG1lc3Npbmcgd2l0aCB0aGUgaXRlbSdzIGNvbnRlbnQgSFRNTFxuICAgICAgICAgICAgdmFyIGZyYW1lRGF0YSA9IHt9LCBhdHRyO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHVpLml0ZW0uZmluZCgnaWZyYW1lJykuc2l6ZSgpID4gMCApIHsvL2lmcmFtZSB0aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLnNyYyA9IHVpLml0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignc3JjJyk7XG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19vcmlnaW5hbF91cmwgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgIGZyYW1lRGF0YS5mcmFtZXNfaGVpZ2h0ID0gdWkuaXRlbS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zYW5kYm94ZWQgYmxvY2s/XG4gICAgICAgICAgICAgICAgYXR0ciA9IHVpLml0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignc2FuZGJveCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgIT09IHR5cGVvZiB1bmRlZmluZWQgJiYgYXR0ciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW5kYm94ID0gc2l0ZUJ1aWxkZXJVdGlscy5nZXRSYW5kb21BcmJpdHJhcnkoMTAwMDAsIDEwMDAwMDAwMDApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhbmRib3hfbG9hZGVyID0gdWkuaXRlbS5maW5kKCdpZnJhbWUnKS5hdHRyKCdkYXRhLWxvYWRlcmZ1bmN0aW9uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHsvL2ltYWdlIHRodW1ibmFpbFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmcmFtZURhdGEuc3JjID0gdWkuaXRlbS5maW5kKCdpbWcnKS5hdHRyKCdkYXRhLXNyY2MnKTtcbiAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX29yaWdpbmFsX3VybCA9IHVpLml0ZW0uZmluZCgnaW1nJykuYXR0cignZGF0YS1zcmNjJyk7XG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19oZWlnaHQgPSB1aS5pdGVtLmZpbmQoJ2ltZycpLmF0dHIoJ2RhdGEtaGVpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3NhbmRib3hlZCBibG9jaz9cbiAgICAgICAgICAgICAgICBhdHRyID0gdWkuaXRlbS5maW5kKCdpbWcnKS5hdHRyKCdkYXRhLXNhbmRib3gnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyICE9PSB0eXBlb2YgdW5kZWZpbmVkICYmIGF0dHIgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2FuZGJveCA9IHNpdGVCdWlsZGVyVXRpbHMuZ2V0UmFuZG9tQXJiaXRyYXJ5KDEwMDAwLCAxMDAwMDAwMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW5kYm94X2xvYWRlciA9IHVpLml0ZW0uZmluZCgnaW1nJykuYXR0cignZGF0YS1sb2FkZXJmdW5jdGlvbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBuZXcgYmxvY2sgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLmZyYW1lSUQgPSAwO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSSA9IHVpLml0ZW0uZ2V0KDApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gJ25ldyc7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKGZyYW1lRGF0YSk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLnN0eWxlLmhlaWdodCA9IHRoaXMuZnJhbWVIZWlnaHQrXCJweFwiO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVGcmFtZUNvdmVyKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmZyYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vaW5zZXJ0IHRoZSBjcmVhdGVkIGlmcmFtZVxuICAgICAgICAgICAgdWkuaXRlbS5hcHBlbmQoJCh0aGlzLmZyYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FkZCB0aGUgYmxvY2sgdG8gdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLmJsb2Nrcy5zcGxpY2UodWkuaXRlbS5pbmRleCgpLCAwLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLnRyaWdnZXIoJ2NhbnZhc3VwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Ryb3BwZWQgZWxlbWVudCwgc28gd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBpbmplY3RzIGV4dGVybmFsIEpTIChkZWZpbmVkIGluIGNvbmZpZy5qcykgaW50byB0aGUgYmxvY2tcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2FkSmF2YXNjcmlwdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgb2xkLFxuICAgICAgICAgICAgICAgIG5ld1NjcmlwdDtcblxuICAgICAgICAgICAgLy9yZW1vdmUgb2xkIG9uZXNcbiAgICAgICAgICAgIG9sZCA9IHRoaXMuZnJhbWVEb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHQuYnVpbGRlcicpO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG9sZC5sZW5ndGg7IGkrKyApIG9sZFtpXS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgLy9pbmplY3RcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgYkNvbmZpZy5leHRlcm5hbEpTLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5ld1NjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1NDUklQVCcpO1xuICAgICAgICAgICAgICAgIG5ld1NjcmlwdC5jbGFzc0xpc3QuYWRkKCdidWlsZGVyJyk7XG4gICAgICAgICAgICAgICAgbmV3U2NyaXB0LnNyYyA9IGJDb25maWcuZXh0ZXJuYWxKU1tpXTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYXBwZW5kQ2hpbGQobmV3U2NyaXB0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgQ2hlY2tzIGlmIHRoaXMgYmxvY2sgaGFzIGV4dGVybmFsIHN0eWxlc2hlZXRcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5oYXNFeHRlcm5hbENTUyA9IGZ1bmN0aW9uIChzcmMpIHtcblxuICAgICAgICAgICAgdmFyIGV4dGVybmFsQ3NzLFxuICAgICAgICAgICAgICAgIHg7XG5cbiAgICAgICAgICAgIGV4dGVybmFsQ3NzID0gdGhpcy5mcmFtZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbaHJlZio9XCInICsgc3JjICsgJ1wiXScpO1xuXG4gICAgICAgICAgICByZXR1cm4gZXh0ZXJuYWxDc3MubGVuZ3RoICE9PSAwO1xuXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBCbG9jay5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJsb2FkXCI6IFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVEb2N1bWVudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0QWRqdXN0bWVudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEphdmFzY3JpcHQoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMuZnJhbWVDb3ZlcikucmVtb3ZlQ2xhc3MoJ2ZyZXNoJywgNTAwKTtcblxuICAgICAgICAgICAgICAgIHB1Ymxpc2hlci5wdWJsaXNoKCdvbkJsb2NrTG9hZGVkJywgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBidWlsZGVyVUkuY2FudmFzTG9hZGluZygnb2ZmJyk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhc2UgXCJjbGlja1wiOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0aGVCbG9jayA9IHRoaXM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9maWd1cmUgb3V0IHdoYXQgdG8gZG8gbmV4dFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkZWxldGVCbG9jaycpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZGVsZXRlQmxvY2snKSApIHsvL2RlbGV0ZSB0aGlzIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbERlbGV0ZUJsb2NrKS5tb2RhbCgnc2hvdycpOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbERlbGV0ZUJsb2NrKS5vZmYoJ2NsaWNrJywgJyNkZWxldGVCbG9ja0NvbmZpcm0nKS5vbignY2xpY2snLCAnI2RlbGV0ZUJsb2NrQ29uZmlybScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVCbG9jay5kZWxldGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVCbG9jaykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygncmVzZXRCbG9jaycpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygncmVzZXRCbG9jaycpICkgey8vcmVzZXQgdGhlIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbFJlc2V0QmxvY2spLm1vZGFsKCdzaG93Jyk7IFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxSZXNldEJsb2NrKS5vZmYoJ2NsaWNrJywgJyNyZXNldEJsb2NrQ29uZmlybScpLm9uKCdjbGljaycsICcjcmVzZXRCbG9ja0NvbmZpcm0nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2sucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsUmVzZXRCbG9jaykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaHRtbEJsb2NrJykgfHwgZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdodG1sQmxvY2snKSApIHsvL3NvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suc291cmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZWRpdENhbmNlbEJ1dHRvbicpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZWRpdENhbmNlbEJ1dHRvbicpICkgey8vY2FuY2VsIHNvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suY2FuY2VsU291cmNlQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlZGl0U2F2ZUJ1dHRvbicpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZWRpdFNhdmVCdXR0b24nKSApIHsvL3NhdmUgc291cmNlIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZUJsb2NrLnNhdmVTb3VyY2VCbG9jaygpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbl9jbGVhckVycm9yRHJhd2VyJykgKSB7Ly9jbGVhciBlcnJvciBkcmF3ZXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZUJsb2NrLmNsZWFyRXJyb3JEcmF3ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLypcbiAgICAgICAgU2l0ZSBvYmplY3QgbGl0ZXJhbFxuICAgICovXG4gICAgLypqc2hpbnQgLVcwMDMgKi9cbiAgICB2YXIgc2l0ZSA9IHtcbiAgICAgICAgXG4gICAgICAgIHBlbmRpbmdDaGFuZ2VzOiBmYWxzZSwgICAgICAvL3BlbmRpbmcgY2hhbmdlcyBvciBubz9cbiAgICAgICAgcGFnZXM6IHt9LCAgICAgICAgICAgICAgICAgIC8vYXJyYXkgY29udGFpbmluZyBhbGwgcGFnZXMsIGluY2x1ZGluZyB0aGUgY2hpbGQgZnJhbWVzLCBsb2FkZWQgZnJvbSB0aGUgc2VydmVyIG9uIHBhZ2UgbG9hZFxuICAgICAgICBpc19hZG1pbjogMCwgICAgICAgICAgICAgICAgLy8wIGZvciBub24tYWRtaW4sIDEgZm9yIGFkbWluXG4gICAgICAgIGRhdGE6IHt9LCAgICAgICAgICAgICAgICAgICAvL2NvbnRhaW5lciBmb3IgYWpheCBsb2FkZWQgc2l0ZSBkYXRhXG4gICAgICAgIHBhZ2VzVG9EZWxldGU6IFtdLCAgICAgICAgICAvL2NvbnRhaW5zIHBhZ2VzIHRvIGJlIGRlbGV0ZWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2l0ZVBhZ2VzOiBbXSwgICAgICAgICAgICAgIC8vdGhpcyBpcyB0aGUgb25seSB2YXIgY29udGFpbmluZyB0aGUgcmVjZW50IGNhbnZhcyBjb250ZW50c1xuICAgICAgICBcbiAgICAgICAgc2l0ZVBhZ2VzUmVhZHlGb3JTZXJ2ZXI6IHt9LCAgICAgLy9jb250YWlucyB0aGUgc2l0ZSBkYXRhIHJlYWR5IHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgICAgICBcbiAgICAgICAgYWN0aXZlUGFnZToge30sICAgICAgICAgICAgIC8vaG9sZHMgYSByZWZlcmVuY2UgdG8gdGhlIHBhZ2UgY3VycmVudGx5IG9wZW4gb24gdGhlIGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgcGFnZVRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZVRpdGxlJyksLy9ob2xkcyB0aGUgcGFnZSB0aXRsZSBvZiB0aGUgY3VycmVudCBwYWdlIG9uIHRoZSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIGRpdkNhbnZhczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VMaXN0JyksLy9ESVYgY29udGFpbmluZyBhbGwgcGFnZXMgb24gdGhlIGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgcGFnZXNNZW51OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZXMnKSwgLy9VTCBjb250YWluaW5nIHRoZSBwYWdlcyBtZW51IGluIHRoZSBzaWRlYmFyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJ1dHRvbk5ld1BhZ2U6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGRQYWdlJyksXG4gICAgICAgIGxpTmV3UGFnZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld1BhZ2VMSScpLFxuICAgICAgICBcbiAgICAgICAgaW5wdXRQYWdlU2V0dGluZ3NUaXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VEYXRhX3RpdGxlJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzTWV0YURlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZURhdGFfbWV0YURlc2NyaXB0aW9uJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzTWV0YUtleXdvcmRzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZURhdGFfbWV0YUtleXdvcmRzJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzSW5jbHVkZXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlRGF0YV9oZWFkZXJJbmNsdWRlcycpLFxuICAgICAgICBpbnB1dFBhZ2VTZXR0aW5nc1BhZ2VDc3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlRGF0YV9oZWFkZXJDc3MnKSxcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvblN1Ym1pdFBhZ2VTZXR0aW5nczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VTZXR0aW5nc1N1Ym1pdHRCdXR0b24nKSxcbiAgICAgICAgXG4gICAgICAgIG1vZGFsUGFnZVNldHRpbmdzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZVNldHRpbmdzTW9kYWwnKSxcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvblNhdmU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYXZlUGFnZScpLFxuICAgICAgICBcbiAgICAgICAgbWVzc2FnZVN0YXJ0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKSxcbiAgICAgICAgZGl2RnJhbWVXcmFwcGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVXcmFwcGVyJyksXG4gICAgICAgIFxuICAgICAgICBza2VsZXRvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NrZWxldG9uJyksXG5cdFx0XG5cdFx0YXV0b1NhdmVUaW1lcjoge30sXG4gICAgICAgIFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5nZXRKU09OKGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9zaXRlRGF0YVwiLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggZGF0YS5zaXRlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpdGUuZGF0YSA9IGRhdGEuc2l0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIGRhdGEucGFnZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5wYWdlcyA9IGRhdGEucGFnZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUuaXNfYWRtaW4gPSBkYXRhLmlzX2FkbWluO1xuICAgICAgICAgICAgICAgIFxuXHRcdFx0XHRpZiggJCgnI3BhZ2VMaXN0Jykuc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICBcdGJ1aWxkZXJVSS5wb3B1bGF0ZUNhbnZhcygpO1xuXHRcdFx0XHR9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5zaXRlLnZpZXdtb2RlICkge1xuICAgICAgICAgICAgICAgICAgICBwdWJsaXNoZXIucHVibGlzaCgnb25TZXRNb2RlJywgZGF0YS5zaXRlLnZpZXdtb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9maXJlIGN1c3RvbSBldmVudFxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS50cmlnZ2VyKCdzaXRlRGF0YUxvYWRlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25OZXdQYWdlKS5vbignY2xpY2snLCBzaXRlLm5ld1BhZ2UpO1xuICAgICAgICAgICAgJCh0aGlzLm1vZGFsUGFnZVNldHRpbmdzKS5vbignc2hvdy5icy5tb2RhbCcsIHNpdGUubG9hZFBhZ2VTZXR0aW5ncyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uU3VibWl0UGFnZVNldHRpbmdzKS5vbignY2xpY2snLCBzaXRlLnVwZGF0ZVBhZ2VTZXR0aW5ncyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uU2F2ZSkub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtzaXRlLnNhdmUodHJ1ZSk7fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYXV0byBzYXZlIHRpbWUgXG4gICAgICAgICAgICB0aGlzLmF1dG9TYXZlVGltZXIgPSBzZXRUaW1lb3V0KHNpdGUuYXV0b1NhdmUsIGJDb25maWcuYXV0b1NhdmVUaW1lb3V0KTtcblxuICAgICAgICAgICAgcHVibGlzaGVyLnN1YnNjcmliZSgnb25CbG9ja0NoYW5nZScsIGZ1bmN0aW9uIChibG9jaywgdHlwZSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBibG9jay5nbG9iYWwgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgc2l0ZS5zaXRlUGFnZXMubGVuZ3RoOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIHZhciB5ID0gMDsgeSA8IHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrcy5sZW5ndGg7IHkgKysgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XSAhPT0gYmxvY2sgJiYgc2l0ZS5zaXRlUGFnZXNbaV0uYmxvY2tzW3ldLm9yaWdpbmFsVXJsID09PSBibG9jay5vcmlnaW5hbFVybCAmJiBzaXRlLnNpdGVQYWdlc1tpXS5ibG9ja3NbeV0uZ2xvYmFsICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdHlwZSA9PT0gJ2NoYW5nZScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XS5mcmFtZURvY3VtZW50LmJvZHkgPSBibG9jay5mcmFtZURvY3VtZW50LmJvZHkuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoZXIucHVibGlzaCgnb25CbG9ja0xvYWRlZCcsIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ3JlbG9hZCcgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XS5yZXNldChmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGF1dG9TYXZlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihzaXRlLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgc2l0ZS5zYXZlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cblx0XHRcdFxuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5hdXRvU2F2ZVRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b1NhdmVUaW1lciA9IHNldFRpbWVvdXQoc2l0ZS5hdXRvU2F2ZSwgYkNvbmZpZy5hdXRvU2F2ZVRpbWVvdXQpO1xuICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0UGVuZGluZ0NoYW5nZXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSB2YWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHZhbHVlID09PSB0cnVlICkge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9yZXNldCB0aW1lclxuXHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmF1dG9TYXZlVGltZXIpO1xuICAgICAgICAgICAgXHR0aGlzLmF1dG9TYXZlVGltZXIgPSBzZXRUaW1lb3V0KHNpdGUuYXV0b1NhdmUsIGJDb25maWcuYXV0b1NhdmVUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcjc2F2ZVBhZ2UgLmJMYWJlbCcpLnRleHQoXCJTYXZlIG5vdyAoISlcIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHNpdGUuYWN0aXZlUGFnZS5zdGF0dXMgIT09ICduZXcnICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2Uuc3RhdHVzID0gJ2NoYW5nZWQnO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG5cdFx0XHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cdFxuICAgICAgICAgICAgICAgICQoJyNzYXZlUGFnZSAuYkxhYmVsJykudGV4dChcIk5vdGhpbmcgdG8gc2F2ZVwiKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgc2l0ZS51cGRhdGVQYWdlU3RhdHVzKCcnKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKHNob3dDb25maXJtTW9kYWwpIHtcblxuICAgICAgICAgICAgcHVibGlzaGVyLnB1Ymxpc2goJ29uQmVmb3JlU2F2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2ZpcmUgY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignYmVmb3JlU2F2ZScpO1xuXG4gICAgICAgICAgICAvL2Rpc2FibGUgYnV0dG9uXG4gICAgICAgICAgICAkKFwiYSNzYXZlUGFnZVwiKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XG4gICAgICAgICAgICAvL3JlbW92ZSBvbGQgYWxlcnRzXG4gICAgICAgICAgICAkKCcjZXJyb3JNb2RhbCAubW9kYWwtYm9keSA+ICosICNzdWNjZXNzTW9kYWwgLm1vZGFsLWJvZHkgPiAqJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcblx0XG4gICAgICAgICAgICBzaXRlLnByZXBGb3JTYXZlKGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNlcnZlckRhdGEgPSB7fTtcbiAgICAgICAgICAgIHNlcnZlckRhdGEucGFnZXMgPSB0aGlzLnNpdGVQYWdlc1JlYWR5Rm9yU2VydmVyO1xuICAgICAgICAgICAgaWYoIHRoaXMucGFnZXNUb0RlbGV0ZS5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAgIHNlcnZlckRhdGEudG9EZWxldGUgPSB0aGlzLnBhZ2VzVG9EZWxldGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlcnZlckRhdGEuc2l0ZURhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICAgICAgICAgIC8vc3RvcmUgY3VycmVudCByZXNwb25zaXZlIG1vZGUgYXMgd2VsbFxuICAgICAgICAgICAgc2VydmVyRGF0YS5zaXRlRGF0YS5yZXNwb25zaXZlTW9kZSA9IGJ1aWxkZXJVSS5jdXJyZW50UmVzcG9uc2l2ZU1vZGU7XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvc2F2ZVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBzZXJ2ZXJEYXRhLFxuICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXMpe1xuXHRcbiAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKFwiYSNzYXZlUGFnZVwiKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XG4gICAgICAgICAgICAgICAgaWYoIHJlcy5yZXNwb25zZUNvZGUgPT09IDAgKSB7XG5cdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgaWYoIHNob3dDb25maXJtTW9kYWwgKSB7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2Vycm9yTW9kYWwgLm1vZGFsLWJvZHknKS5hcHBlbmQoICQocmVzLnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNlcnJvck1vZGFsJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIH1cblx0XHRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHJlcy5yZXNwb25zZUNvZGUgPT09IDEgKSB7XG5cdFx0XG4gICAgICAgICAgICAgICAgICAgIGlmKCBzaG93Q29uZmlybU1vZGFsICkge1xuXHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3N1Y2Nlc3NNb2RhbCAubW9kYWwtYm9keScpLmFwcGVuZCggJChyZXMucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3N1Y2Nlc3NNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICB9XG5cdFx0XHRcblx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAvL25vIG1vcmUgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXMoZmFsc2UpO1xuXHRcdFx0XG5cbiAgICAgICAgICAgICAgICAgICAgLy91cGRhdGUgcmV2aXNpb25zP1xuICAgICAgICAgICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignY2hhbmdlUGFnZScpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHByZXBzIHRoZSBzaXRlIGRhdGEgYmVmb3JlIHNlbmRpbmcgaXQgdG8gdGhlIHNlcnZlclxuICAgICAgICAqL1xuICAgICAgICBwcmVwRm9yU2F2ZTogZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zaXRlUGFnZXNSZWFkeUZvclNlcnZlciA9IHt9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdGVtcGxhdGUgKSB7Ly9zYXZpbmcgdGVtcGxhdGUsIG9ubHkgdGhlIGFjdGl2ZVBhZ2UgaXMgbmVlZGVkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5zaXRlUGFnZXNSZWFkeUZvclNlcnZlclt0aGlzLmFjdGl2ZVBhZ2UubmFtZV0gPSB0aGlzLmFjdGl2ZVBhZ2UucHJlcEZvclNhdmUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2UuZnVsbFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7Ly9yZWd1bGFyIHNhdmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZmluZCB0aGUgcGFnZXMgd2hpY2ggbmVlZCB0byBiZSBzZW5kIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuc2l0ZVBhZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuc2l0ZVBhZ2VzW2ldLnN0YXR1cyAhPT0gJycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzUmVhZHlGb3JTZXJ2ZXJbdGhpcy5zaXRlUGFnZXNbaV0ubmFtZV0gPSB0aGlzLnNpdGVQYWdlc1tpXS5wcmVwRm9yU2F2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBzZXRzIGEgcGFnZSBhcyB0aGUgYWN0aXZlIG9uZVxuICAgICAgICAqL1xuICAgICAgICBzZXRBY3RpdmU6IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZWZlcmVuY2UgdG8gdGhlIGFjdGl2ZSBwYWdlXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2hpZGUgb3RoZXIgcGFnZXNcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnNpdGVQYWdlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzW2ldLnBhcmVudFVMLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGlzcGxheSBhY3RpdmUgb25lXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2UucGFyZW50VUwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZGUtYWN0aXZlIGFsbCBwYWdlIG1lbnUgaXRlbXNcbiAgICAgICAgKi9cbiAgICAgICAgZGVBY3RpdmF0ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlcyA9IHRoaXMucGFnZXNNZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgcGFnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgcGFnZXNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgYWRkcyBhIG5ldyBwYWdlIHRvIHRoZSBzaXRlXG4gICAgICAgICovXG4gICAgICAgIG5ld1BhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLmRlQWN0aXZhdGVBbGwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9jcmVhdGUgdGhlIG5ldyBwYWdlIGluc3RhbmNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlRGF0YSA9IFtdO1xuICAgICAgICAgICAgdmFyIHRlbXAgPSB7XG4gICAgICAgICAgICAgICAgcGFnZXNfaWQ6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwYWdlRGF0YVswXSA9IHRlbXA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBuZXdQYWdlTmFtZSA9ICdwYWdlJysoc2l0ZS5zaXRlUGFnZXMubGVuZ3RoKzEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbmV3UGFnZSA9IG5ldyBQYWdlKG5ld1BhZ2VOYW1lLCBwYWdlRGF0YSwgc2l0ZS5zaXRlUGFnZXMubGVuZ3RoKzEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXdQYWdlLnN0YXR1cyA9ICduZXcnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXdQYWdlLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgIG5ld1BhZ2UuZWRpdFBhZ2VOYW1lKCk7XG4gICAgICAgIFxuICAgICAgICAgICAgbmV3UGFnZS5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2hlY2tzIGlmIHRoZSBuYW1lIG9mIGEgcGFnZSBpcyBhbGxvd2VkXG4gICAgICAgICovXG4gICAgICAgIGNoZWNrUGFnZU5hbWU6IGZ1bmN0aW9uKHBhZ2VOYW1lKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFrZSBzdXJlIHRoZSBuYW1lIGlzIHVuaXF1ZVxuICAgICAgICAgICAgZm9yKCB2YXIgaSBpbiB0aGlzLnNpdGVQYWdlcyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5zaXRlUGFnZXNbaV0ubmFtZSA9PT0gcGFnZU5hbWUgJiYgdGhpcy5hY3RpdmVQYWdlICE9PSB0aGlzLnNpdGVQYWdlc1tpXSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdlTmFtZUVycm9yID0gXCJUaGUgcGFnZSBuYW1lIG11c3QgYmUgdW5pcXVlLlwiO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICByZW1vdmVzIHVuYWxsb3dlZCBjaGFyYWN0ZXJzIGZyb20gdGhlIHBhZ2UgbmFtZVxuICAgICAgICAqL1xuICAgICAgICBwcmVwUGFnZU5hbWU6IGZ1bmN0aW9uKHBhZ2VOYW1lKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhZ2VOYW1lID0gcGFnZU5hbWUucmVwbGFjZSgnICcsICcnKTtcbiAgICAgICAgICAgIHBhZ2VOYW1lID0gcGFnZU5hbWUucmVwbGFjZSgvWz8qIS58JiM7JCVAXCI8PigpKyxdL2csIFwiXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcGFnZU5hbWU7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgc2F2ZSBwYWdlIHNldHRpbmdzIGZvciB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZVBhZ2VTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5wYWdlU2V0dGluZ3MudGl0bGUgPSBzaXRlLmlucHV0UGFnZVNldHRpbmdzVGl0bGUudmFsdWU7XG4gICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UucGFnZVNldHRpbmdzLm1ldGFfZGVzY3JpcHRpb24gPSBzaXRlLmlucHV0UGFnZVNldHRpbmdzTWV0YURlc2NyaXB0aW9uLnZhbHVlO1xuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnBhZ2VTZXR0aW5ncy5tZXRhX2tleXdvcmRzID0gc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc01ldGFLZXl3b3Jkcy52YWx1ZTtcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5wYWdlU2V0dGluZ3MuaGVhZGVyX2luY2x1ZGVzID0gc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc0luY2x1ZGVzLnZhbHVlO1xuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnBhZ2VTZXR0aW5ncy5wYWdlX2NzcyA9IHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NQYWdlQ3NzLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHNpdGUubW9kYWxQYWdlU2V0dGluZ3MpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlIHBhZ2Ugc3RhdHVzZXNcbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlUGFnZVN0YXR1czogZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5zaXRlUGFnZXMgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaXRlUGFnZXNbaV0uc3RhdHVzID0gc3RhdHVzOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgQ2hlY2tzIGFsbCB0aGUgYmxvY2tzIGluIHRoaXMgc2l0ZSBoYXZlIGZpbmlzaGVkIGxvYWRpbmdcbiAgICAgICAgKi9cbiAgICAgICAgbG9hZGVkOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBpO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuc2l0ZVBhZ2VzLmxlbmd0aDsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5zaXRlUGFnZXNbaV0ubG9hZGVkKCkgKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBNYWtlIGV2ZXJ5IGJsb2NrIGhhdmUgYW4gb3ZlcmxheSBkdXJpbmcgZHJhZ2dpbmcgdG8gcHJldmVudCBtb3VzZSBldmVudCBpc3N1ZXNcbiAgICAgICAgKi9cbiAgICAgICAgbW92ZU1vZGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICAgICAgICB2YXIgaTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZVBhZ2UuYmxvY2tzLmxlbmd0aDsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCB2YWx1ZSA9PT0gJ29uJyApIHRoaXMuYWN0aXZlUGFnZS5ibG9ja3NbaV0uZnJhbWVDb3Zlci5jbGFzc0xpc3QuYWRkKCdtb3ZlJyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIHZhbHVlID09PSAnb2ZmJyApIHRoaXMuYWN0aXZlUGFnZS5ibG9ja3NbaV0uZnJhbWVDb3Zlci5jbGFzc0xpc3QucmVtb3ZlKCdtb3ZlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgXG4gICAgfTtcblxuICAgIGJ1aWxkZXJVSS5pbml0KCk7IHNpdGUuaW5pdCgpO1xuXG4gICAgXG4gICAgLy8qKioqIEVYUE9SVFNcbiAgICBtb2R1bGUuZXhwb3J0cy5zaXRlID0gc2l0ZTtcbiAgICBtb2R1bGUuZXhwb3J0cy5idWlsZGVyVUkgPSBidWlsZGVyVUk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLnBhZ2VDb250YWluZXIgPSBcIiNwYWdlXCI7XG5cbiAgICBtb2R1bGUuZXhwb3J0cy5ib2R5UGFkZGluZ0NsYXNzID0gXCJiUGFkZGluZ1wiO1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLmVkaXRhYmxlSXRlbXMgPSB7XG4gICAgICAgICdzcGFuLmZhJzogWydjb2xvcicsICdmb250LXNpemUnXSxcbiAgICAgICAgJy5iZy5iZzEnOiBbJ2JhY2tncm91bmQtY29sb3InXSxcbiAgICAgICAgJ25hdiBhJzogWydjb2xvcicsICdmb250LXdlaWdodCcsICd0ZXh0LXRyYW5zZm9ybSddLFxuICAgICAgICAnaW1nJzogWydib3JkZXItdG9wLWxlZnQtcmFkaXVzJywgJ2JvcmRlci10b3AtcmlnaHQtcmFkaXVzJywgJ2JvcmRlci1ib3R0b20tbGVmdC1yYWRpdXMnLCAnYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXMnLCAnYm9yZGVyLWNvbG9yJywgJ2JvcmRlci1zdHlsZScsICdib3JkZXItd2lkdGgnXSxcbiAgICAgICAgJ2hyLmRhc2hlZCc6IFsnYm9yZGVyLWNvbG9yJywgJ2JvcmRlci13aWR0aCddLFxuICAgICAgICAnLmRpdmlkZXIgPiBzcGFuJzogWydjb2xvcicsICdmb250LXNpemUnXSxcbiAgICAgICAgJ2hyLnNoYWRvd0Rvd24nOiBbJ21hcmdpbi10b3AnLCAnbWFyZ2luLWJvdHRvbSddLFxuICAgICAgICAnLmZvb3RlciBhJzogWydjb2xvciddLFxuICAgICAgICAnLnNvY2lhbCBhJzogWydjb2xvciddLFxuICAgICAgICAnLmJnLmJnMSwgLmJnLmJnMiwgLmhlYWRlcjEwLCAuaGVhZGVyMTEnOiBbJ2JhY2tncm91bmQtaW1hZ2UnLCAnYmFja2dyb3VuZC1jb2xvciddLFxuICAgICAgICAnLmZyYW1lQ292ZXInOiBbXSxcbiAgICAgICAgJy5lZGl0Q29udGVudCc6IFsnY29udGVudCcsICdjb2xvcicsICdmb250LXNpemUnLCAnYmFja2dyb3VuZC1jb2xvcicsICdmb250LWZhbWlseSddLFxuICAgICAgICAnYS5idG4sIGJ1dHRvbi5idG4nOiBbJ2JvcmRlci1yYWRpdXMnLCAnZm9udC1zaXplJywgJ2JhY2tncm91bmQtY29sb3InXSxcbiAgICAgICAgJyNwcmljaW5nX3RhYmxlMiAucHJpY2luZzIgLmJvdHRvbSBsaSc6IFsnY29udGVudCddXG4gICAgfTtcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cy5lZGl0YWJsZUl0ZW1PcHRpb25zID0ge1xuICAgICAgICAnbmF2IGEgOiBmb250LXdlaWdodCc6IFsnNDAwJywgJzcwMCddLFxuICAgICAgICAnYS5idG4gOiBib3JkZXItcmFkaXVzJzogWycwcHgnLCAnNHB4JywgJzEwcHgnXSxcbiAgICAgICAgJ2ltZyA6IGJvcmRlci1zdHlsZSc6IFsnbm9uZScsICdkb3R0ZWQnLCAnZGFzaGVkJywgJ3NvbGlkJ10sXG4gICAgICAgICdpbWcgOiBib3JkZXItd2lkdGgnOiBbJzFweCcsICcycHgnLCAnM3B4JywgJzRweCddLFxuICAgICAgICAnaDEsIGgyLCBoMywgaDQsIGg1LCBwIDogZm9udC1mYW1pbHknOiBbJ2RlZmF1bHQnLCAnTGF0bycsICdIZWx2ZXRpY2EnLCAnQXJpYWwnLCAnVGltZXMgTmV3IFJvbWFuJ10sXG4gICAgICAgICdoMiA6IGZvbnQtZmFtaWx5JzogWydkZWZhdWx0JywgJ0xhdG8nLCAnSGVsdmV0aWNhJywgJ0FyaWFsJywgJ1RpbWVzIE5ldyBSb21hbiddLFxuICAgICAgICAnaDMgOiBmb250LWZhbWlseSc6IFsnZGVmYXVsdCcsICdMYXRvJywgJ0hlbHZldGljYScsICdBcmlhbCcsICdUaW1lcyBOZXcgUm9tYW4nXSxcbiAgICAgICAgJ3AgOiBmb250LWZhbWlseSc6IFsnZGVmYXVsdCcsICdMYXRvJywgJ0hlbHZldGljYScsICdBcmlhbCcsICdUaW1lcyBOZXcgUm9tYW4nXVxuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cy5yZXNwb25zaXZlTW9kZXMgPSB7XG4gICAgICAgIGRlc2t0b3A6ICc5NyUnLFxuICAgICAgICBtb2JpbGU6ICc0ODBweCcsXG4gICAgICAgIHRhYmxldDogJzEwMjRweCdcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHMuZWRpdGFibGVDb250ZW50ID0gWycuZWRpdENvbnRlbnQnLCAnLm5hdmJhciBhJywgJ2J1dHRvbicsICdhLmJ0bicsICcuZm9vdGVyIGE6bm90KC5mYSknLCAnLnRhYmxlV3JhcHBlcicsICdoMScsICdoMiddO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMuYXV0b1NhdmVUaW1lb3V0ID0gMzAwMDAwO1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLnNvdXJjZUNvZGVFZGl0U3ludGF4RGVsYXkgPSAxMDAwMDtcblxuICAgIG1vZHVsZS5leHBvcnRzLm1lZGl1bUNzc1VybHMgPSBbXG4gICAgICAgICcvL2Nkbi5qc2RlbGl2ci5uZXQvbWVkaXVtLWVkaXRvci9sYXRlc3QvY3NzL21lZGl1bS1lZGl0b3IubWluLmNzcycsXG4gICAgICAgICcvY3NzL21lZGl1bS1ib290c3RyYXAuY3NzJ1xuICAgIF07XG4gICAgbW9kdWxlLmV4cG9ydHMubWVkaXVtQnV0dG9ucyA9IFsnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2FuY2hvcicsICdvcmRlcmVkbGlzdCcsICd1bm9yZGVyZWRsaXN0JywgJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ3JlbW92ZUZvcm1hdCddO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMuZXh0ZXJuYWxKUyA9IFtcbiAgICAgICAgJ2pzL2J1aWxkZXJfaW5fYmxvY2suanMnXG4gICAgXTtcbiAgICAgICAgICAgICAgICAgICAgXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBiQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcblx0dmFyIHNpdGVCdWlsZGVyID0gcmVxdWlyZSgnLi9idWlsZGVyLmpzJyk7XG5cdHZhciBhcHBVSSA9IHJlcXVpcmUoJy4vdWkuanMnKS5hcHBVSTtcblxuXHR2YXIgcHVibGlzaCA9IHtcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvblB1Ymxpc2g6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwdWJsaXNoUGFnZScpLFxuICAgICAgICBidXR0b25TYXZlUGVuZGluZ0JlZm9yZVB1Ymxpc2hpbmc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidXR0b25TYXZlUGVuZGluZ0JlZm9yZVB1Ymxpc2hpbmcnKSxcbiAgICAgICAgcHVibGlzaE1vZGFsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHVibGlzaE1vZGFsJyksXG4gICAgICAgIGJ1dHRvblB1Ymxpc2hTdWJtaXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwdWJsaXNoU3VibWl0JyksXG4gICAgICAgIHB1Ymxpc2hBY3RpdmU6IDAsXG4gICAgICAgIHRoZUl0ZW06IHt9LFxuICAgICAgICBtb2RhbFNpdGVTZXR0aW5nczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpdGVTZXR0aW5ncycpLFxuICAgIFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uUHVibGlzaCkub24oJ2NsaWNrJywgdGhpcy5sb2FkUHVibGlzaE1vZGFsKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25TYXZlUGVuZGluZ0JlZm9yZVB1Ymxpc2hpbmcpLm9uKCdjbGljaycsIHRoaXMuc2F2ZUJlZm9yZVB1Ymxpc2hpbmcpO1xuICAgICAgICAgICAgJCh0aGlzLnB1Ymxpc2hNb2RhbCkub24oJ2NoYW5nZScsICdpbnB1dFt0eXBlPWNoZWNrYm94XScsIHRoaXMucHVibGlzaENoZWNrYm94RXZlbnQpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvblB1Ymxpc2hTdWJtaXQpLm9uKCdjbGljaycsIHRoaXMucHVibGlzaFNpdGUpO1xuICAgICAgICAgICAgJCh0aGlzLm1vZGFsU2l0ZVNldHRpbmdzKS5vbignY2xpY2snLCAnI3NpdGVTZXR0aW5nc0Jyb3dzZUZUUEJ1dHRvbiwgLmxpbmsnLCB0aGlzLmJyb3dzZUZUUCk7XG4gICAgICAgICAgICAkKHRoaXMubW9kYWxTaXRlU2V0dGluZ3MpLm9uKCdjbGljaycsICcjZnRwTGlzdEl0ZW1zIC5jbG9zZScsIHRoaXMuY2xvc2VGdHBCcm93c2VyKTtcbiAgICAgICAgICAgICQodGhpcy5tb2RhbFNpdGVTZXR0aW5ncykub24oJ2NsaWNrJywgJyNzaXRlU2V0dGluZ3NUZXN0RlRQJywgdGhpcy50ZXN0RlRQQ29ubmVjdGlvbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2hvdyB0aGUgcHVibGlzaCBidXR0b25cbiAgICAgICAgICAgICQodGhpcy5idXR0b25QdWJsaXNoKS5zaG93KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbGlzdGVuIHRvIHNpdGUgc2V0dGluZ3MgbG9hZCBldmVudFxuICAgICAgICAgICAgJCgnYm9keScpLm9uKCdzaXRlU2V0dGluZ3NMb2FkJywgdGhpcy5zaG93UHVibGlzaFNldHRpbmdzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9wdWJsaXNoIGhhc2g/XG4gICAgICAgICAgICBpZiggd2luZG93LmxvY2F0aW9uLmhhc2ggPT09IFwiI3B1Ymxpc2hcIiApIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuYnV0dG9uUHVibGlzaCkuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gaGVhZGVyIHRvb2x0aXBzXG4gICAgICAgICAgICAvL2lmKCB0aGlzLmJ1dHRvblB1Ymxpc2guaGFzQXR0cmlidXRlKCdkYXRhLXRvZ2dsZScpICYmIHRoaXMuYnV0dG9uUHVibGlzaC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJykgPT0gJ3Rvb2x0aXAnICkge1xuICAgICAgICAgICAgLy8gICAkKHRoaXMuYnV0dG9uUHVibGlzaCkudG9vbHRpcCgnc2hvdycpO1xuICAgICAgICAgICAgLy8gICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7JCh0aGlzLmJ1dHRvblB1Ymxpc2gpLnRvb2x0aXAoJ2hpZGUnKX0sIDUwMDApO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgbG9hZHMgdGhlIHB1Ymxpc2ggbW9kYWxcbiAgICAgICAgKi9cbiAgICAgICAgbG9hZFB1Ymxpc2hNb2RhbDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBwdWJsaXNoLnB1Ymxpc2hBY3RpdmUgPT09IDAgKSB7Ly9jaGVjayBpZiB3ZSdyZSBjdXJyZW50bHkgcHVibGlzaGluZyBhbnl0aGluZ1xuXHRcdFxuICAgICAgICAgICAgICAgIC8vaGlkZSBhbGVydHNcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1hbGVydHMgPiAqJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWJvZHkgPiAuYWxlcnQtc3VjY2VzcycpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2hpZGUgbG9hZGVyc1xuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWxfYXNzZXRzIC5wdWJsaXNoaW5nJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcud29ya2luZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZG9uZScpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBwdWJsaXNoZWQgY2xhc3MgZnJvbSBhc3NldCBjaGVja2JveGVzXG4gICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbF9hc3NldHMgaW5wdXQnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ3B1Ymxpc2hlZCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZG8gd2UgaGF2ZSBwZW5kaW5nIGNoYW5nZXM/XG4gICAgICAgICAgICAgICAgaWYoIHNpdGVCdWlsZGVyLnNpdGUucGVuZGluZ0NoYW5nZXMgPT09IHRydWUgKSB7Ly93ZSd2ZSBnb3QgY2hhbmdlcywgc2F2ZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAjcHVibGlzaFBlbmRpbmdDaGFuZ2VzTWVzc2FnZScpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYm9keS1jb250ZW50JykuaGlkZSgpO1xuXHRcdFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7Ly9hbGwgc2V0LCBnZXQgb24gaXQgd2l0aCBwdWJsaXNoaW5nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgY29ycmVjdCBwYWdlcyBpbiB0aGUgUGFnZXMgc2VjdGlvbiBvZiB0aGUgcHVibGlzaCBtb2RhbFxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsX3BhZ2VzIHRib2R5ID4gKicpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNwYWdlcyBsaTp2aXNpYmxlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhlUGFnZSA9ICQodGhpcykuZmluZCgnYTpmaXJzdCcpLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVSb3cgPSAkKCc8dHI+PHRkIGNsYXNzPVwidGV4dC1jZW50ZXJcIiBzdHlsZT1cIndpZHRoOiAzMHB4O1wiPjxsYWJlbCBjbGFzcz1cImNoZWNrYm94IG5vLWxhYmVsXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiJyt0aGVQYWdlKydcIiBpZD1cIlwiIGRhdGEtdHlwZT1cInBhZ2VcIiBuYW1lPVwicGFnZXNbXVwiIGRhdGEtdG9nZ2xlPVwiY2hlY2tib3hcIj48L2xhYmVsPjwvdGQ+PHRkPicrdGhlUGFnZSsnPHNwYW4gY2xhc3M9XCJwdWJsaXNoaW5nXCI+PHNwYW4gY2xhc3M9XCJ3b3JraW5nXCI+UHVibGlzaGluZy4uLiA8aW1nIHNyYz1cIicrYXBwVUkuYmFzZVVybCsnaW1hZ2VzL3B1Ymxpc2hMb2FkZXIuZ2lmXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwiZG9uZSB0ZXh0LXByaW1hcnlcIj5QdWJsaXNoZWQgJm5ic3A7PHNwYW4gY2xhc3M9XCJmdWktY2hlY2tcIj48L3NwYW4+PC9zcGFuPjwvc3Bhbj48L3RkPjwvdHI+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hlY2tib3hpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVJvdy5maW5kKCdpbnB1dCcpLnJhZGlvY2hlY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVJvdy5maW5kKCdpbnB1dCcpLm9uKCdjaGVjayB1bmNoZWNrIHRvZ2dsZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCd0cicpWyQodGhpcykucHJvcCgnY2hlY2tlZCcpID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdzZWxlY3RlZC1yb3cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsX3BhZ2VzIHRib2R5JykuYXBwZW5kKCB0aGVSb3cgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAjcHVibGlzaFBlbmRpbmdDaGFuZ2VzTWVzc2FnZScpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYm9keS1jb250ZW50Jykuc2hvdygpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbmFibGUvZGlzYWJsZSBwdWJsaXNoIGJ1dHRvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYWN0aXZhdGVCdXR0b24gPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCBpbnB1dFt0eXBlPWNoZWNrYm94XScpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFxuICAgICAgICAgICAgICAgIGlmKCAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVCdXR0b24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBhY3RpdmF0ZUJ1dHRvbiApIHtcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaFN1Ym1pdCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaFN1Ym1pdCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBzYXZlcyBwZW5kaW5nIGNoYW5nZXMgYmVmb3JlIHB1Ymxpc2hpbmdcbiAgICAgICAgKi9cbiAgICAgICAgc2F2ZUJlZm9yZVB1Ymxpc2hpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsICNwdWJsaXNoUGVuZGluZ0NoYW5nZXNNZXNzYWdlJykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubG9hZGVyJykuc2hvdygpO1xuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblxuICAgICAgICAgICAgc2l0ZUJ1aWxkZXIuc2l0ZS5wcmVwRm9yU2F2ZShmYWxzZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzZXJ2ZXJEYXRhID0ge307XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLnBhZ2VzID0gc2l0ZUJ1aWxkZXIuc2l0ZS5zaXRlUGFnZXNSZWFkeUZvclNlcnZlcjtcbiAgICAgICAgICAgIGlmKCBzaXRlQnVpbGRlci5zaXRlLnBhZ2VzVG9EZWxldGUubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJEYXRhLnRvRGVsZXRlID0gc2l0ZUJ1aWxkZXIuc2l0ZS5wYWdlc1RvRGVsZXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VydmVyRGF0YS5zaXRlRGF0YSA9IHNpdGVCdWlsZGVyLnNpdGUuZGF0YTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9zYXZlLzFcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgZGF0YTogc2VydmVyRGF0YSxcbiAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzKXtcdFx0XHRcblx0XHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLmxvYWRlcicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJlcy5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3NlbGYtZGVzdHJ1Y3Qgc3VjY2VzcyBtZXNzYWdlc1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7JCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYWxlcnRzIC5hbGVydC1zdWNjZXNzJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7JCh0aGlzKS5yZW1vdmUoKTt9KTt9LCAyNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZW5hYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsICNwdWJsaXNoUGVuZGluZ0NoYW5nZXNNZXNzYWdlIC5idG4uc2F2ZScpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICBpZiggcmVzLnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL2NoYW5nZXMgd2VyZSBzYXZlZCB3aXRob3V0IGlzc3Vlc1xuXG4gICAgICAgICAgICAgICAgICAgIC8vbm8gbW9yZSBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZUJ1aWxkZXIuc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyhmYWxzZSk7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgY29ycmVjdCBwYWdlcyBpbiB0aGUgUGFnZXMgc2VjdGlvbiBvZiB0aGUgcHVibGlzaCBtb2RhbFxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsX3BhZ2VzIHRib2R5ID4gKicpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNwYWdlcyBsaTp2aXNpYmxlJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVQYWdlID0gJCh0aGlzKS5maW5kKCdhOmZpcnN0JykudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoZVJvdyA9ICQoJzx0cj48dGQgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiIHN0eWxlPVwid2lkdGg6IDBweDtcIj48bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIicrdGhlUGFnZSsnXCIgaWQ9XCJcIiBkYXRhLXR5cGU9XCJwYWdlXCIgbmFtZT1cInBhZ2VzW11cIiBkYXRhLXRvZ2dsZT1cImNoZWNrYm94XCI+PC9sYWJlbD48L3RkPjx0ZD4nK3RoZVBhZ2UrJzxzcGFuIGNsYXNzPVwicHVibGlzaGluZ1wiPjxzcGFuIGNsYXNzPVwid29ya2luZ1wiPlB1Ymxpc2hpbmcuLi4gPGltZyBzcmM9XCInK2FwcFVJLmJhc2VVcmwrJ2ltYWdlcy9wdWJsaXNoTG9hZGVyLmdpZlwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cImRvbmUgdGV4dC1wcmltYXJ5XCI+UHVibGlzaGVkICZuYnNwOzxzcGFuIGNsYXNzPVwiZnVpLWNoZWNrXCI+PC9zcGFuPjwvc3Bhbj48L3NwYW4+PC90ZD48L3RyPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NoZWNrYm94aWZ5XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVSb3cuZmluZCgnaW5wdXQnKS5yYWRpb2NoZWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVSb3cuZmluZCgnaW5wdXQnKS5vbignY2hlY2sgdW5jaGVjayB0b2dnbGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgndHInKVskKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnc2VsZWN0ZWQtcm93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbF9wYWdlcyB0Ym9keScpLmFwcGVuZCggdGhlUm93ICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vc2hvdyBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWJvZHktY29udGVudCcpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGNoZWNrYm94ZXMgaW5zaWRlIHRoZSBwdWJsaXNoIG1vZGFsXG4gICAgICAgICovXG4gICAgICAgIHB1Ymxpc2hDaGVja2JveEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGFjdGl2YXRlQnV0dG9uID0gZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgaW5wdXRbdHlwZT1jaGVja2JveF0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoICQodGhpcykucHJvcCgnY2hlY2tlZCcpICkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZUJ1dHRvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggYWN0aXZhdGVCdXR0b24gKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hTdWJtaXQnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaFN1Ym1pdCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcHVibGlzaGVzIHRoZSBzZWxlY3RlZCBpdGVtc1xuICAgICAgICAqL1xuICAgICAgICBwdWJsaXNoU2l0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdHJhY2sgdGhlIHB1Ymxpc2hpbmcgc3RhdGVcbiAgICAgICAgICAgIHB1Ymxpc2gucHVibGlzaEFjdGl2ZSA9IDE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICQoJyNwdWJsaXNoU3VibWl0LCAjcHVibGlzaENhbmNlbCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFxuICAgICAgICAgICAgLy9yZW1vdmUgZXhpc3RpbmcgYWxlcnRzXG4gICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1hbGVydHMgPiAqJykucmVtb3ZlKCk7XG5cdFx0XG4gICAgICAgICAgICAvL3ByZXBhcmUgc3R1ZmZcbiAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgZm9ybSBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdLnBhZ2UnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9sb29wIHRocm91Z2ggYWxsIHBhZ2VzXG4gICAgICAgICAgICAkKCcjcGFnZUxpc3QgPiB1bCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2V4cG9ydCB0aGlzIHBhZ2U/XG4gICAgICAgICAgICAgICAgaWYoICQoJyNwdWJsaXNoTW9kYWwgI3B1Ymxpc2hNb2RhbF9wYWdlcyBpbnB1dDplcSgnKygkKHRoaXMpLmluZGV4KCkrMSkrJyknKS5wcm9wKCdjaGVja2VkJykgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2dyYWIgdGhlIHNrZWxldG9uIG1hcmt1cFxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3RG9jTWFpblBhcmVudCA9ICQoJ2lmcmFtZSNza2VsZXRvbicpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2VtcHR5IG91dCB0aGUgc2tlbGV0b25cbiAgICAgICAgICAgICAgICAgICAgbmV3RG9jTWFpblBhcmVudC5maW5kKCcqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2xvb3AgdGhyb3VnaCBwYWdlIGlmcmFtZXMgYW5kIGdyYWIgdGhlIGJvZHkgc3R1ZmZcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCdpZnJhbWUnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gJCh0aGlzKS5hdHRyKCdkYXRhLXNhbmRib3gnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoZUNvbnRlbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGF0dHIgIT09IHR5cGVvZiB1bmRlZmluZWQgJiYgYXR0ciAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVDb250ZW50cyA9ICQoJyNzYW5kYm94ZXMgIycrYXR0cikuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMgPSAkKHRoaXMpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUNvbnRlbnRzLmZpbmQoJy5mcmFtZUNvdmVyJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZW1vdmUgaW5saW5lIHN0eWxpbmcgbGVmdG92ZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoIHZhciBrZXkgaW4gYkNvbmZpZy5lZGl0YWJsZUl0ZW1zICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZUNvbnRlbnRzLmZpbmQoIGtleSApLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQXR0cignZGF0YS1zZWxlY3RvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoICQodGhpcykuYXR0cignc3R5bGUnKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVx0XG5cdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJDb25maWcuZWRpdGFibGVDb250ZW50Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcuZWRpdGFibGVDb250ZW50W2ldICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ2RhdGEtc2VsZWN0b3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG9BZGQgPSB0aGVDb250ZW50cy5odG1sKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ3JhYiBzY3JpcHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY3JpcHRzID0gJCh0aGlzKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciApLmZpbmQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggc2NyaXB0cy5zaXplKCkgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVJZnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNrZWxldG9uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdHMuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY3JpcHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS50ZXh0KCkgIT09ICcnICkgey8vc2NyaXB0IHRhZ3Mgd2l0aCBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdCA9IHRoZUlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LmlubmVySFRNTCA9ICQodGhpcykudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGJDb25maWcucGFnZUNvbnRhaW5lci5zdWJzdHJpbmcoMSkgKS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCAkKHRoaXMpLmF0dHIoJ3NyYycpICE9PSBudWxsICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQgPSB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC5zcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIGJDb25maWcucGFnZUNvbnRhaW5lci5zdWJzdHJpbmcoMSkgKS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RG9jTWFpblBhcmVudC5hcHBlbmQoICQodG9BZGQpICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdJbnB1dCA9ICQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgY2xhc3M9XCJwYWdlXCIgbmFtZT1cInhwYWdlc1snKyQoJyNwYWdlcyBsaTplcSgnKygkKHRoaXMpLmluZGV4KCkrMSkrJykgYTpmaXJzdCcpLnRleHQoKSsnXVwiIHZhbHVlPVwiXCI+Jyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIGZvcm0nKS5wcmVwZW5kKCBuZXdJbnB1dCApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbmV3SW5wdXQudmFsKCBcIjxodG1sPlwiKyQoJ2lmcmFtZSNza2VsZXRvbicpLmNvbnRlbnRzKCkuZmluZCgnaHRtbCcpLmh0bWwoKStcIjwvaHRtbD5cIiApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHB1Ymxpc2gucHVibGlzaEFzc2V0KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIHB1Ymxpc2hBc3NldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciB0b1B1Ymxpc2ggPSAkKCcjcHVibGlzaE1vZGFsX2Fzc2V0cyBpbnB1dFt0eXBlPWNoZWNrYm94XTpjaGVja2VkOm5vdCgucHVibGlzaGVkLCAudG9nZ2xlQWxsKSwgI3B1Ymxpc2hNb2RhbF9wYWdlcyBpbnB1dFt0eXBlPWNoZWNrYm94XTpjaGVja2VkOm5vdCgucHVibGlzaGVkLCAudG9nZ2xlQWxsKScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdG9QdWJsaXNoLnNpemUoKSA+IDAgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcHVibGlzaC50aGVJdGVtID0gdG9QdWJsaXNoLmZpcnN0KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kaXNwbGF5IHRoZSBhc3NldCBsb2FkZXJcbiAgICAgICAgICAgICAgICBwdWJsaXNoLnRoZUl0ZW0uY2xvc2VzdCgndGQnKS5uZXh0KCkuZmluZCgnLnB1Ymxpc2hpbmcnKS5mYWRlSW4oNTAwKTtcblxuICAgICAgICAgICAgICAgIHZhciB0aGVEYXRhO1xuXHRcdFxuICAgICAgICAgICAgICAgIGlmKCBwdWJsaXNoLnRoZUl0ZW0uYXR0cignZGF0YS10eXBlJykgPT09ICdwYWdlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZURhdGEgPSB7c2l0ZUlEOiAkKCdmb3JtI3B1Ymxpc2hGb3JtIGlucHV0W25hbWU9c2l0ZUlEXScpLnZhbCgpLCBpdGVtOiBwdWJsaXNoLnRoZUl0ZW0udmFsKCksIHBhZ2VDb250ZW50OiAkKCdmb3JtI3B1Ymxpc2hGb3JtIGlucHV0W25hbWU9XCJ4cGFnZXNbJytwdWJsaXNoLnRoZUl0ZW0udmFsKCkrJ11cIl0nKS52YWwoKX07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBwdWJsaXNoLnRoZUl0ZW0uYXR0cignZGF0YS10eXBlJykgPT09ICdhc3NldCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVEYXRhID0ge3NpdGVJRDogJCgnZm9ybSNwdWJsaXNoRm9ybSBpbnB1dFtuYW1lPXNpdGVJRF0nKS52YWwoKSwgaXRlbTogcHVibGlzaC50aGVJdGVtLnZhbCgpfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAkKCdmb3JtI3B1Ymxpc2hGb3JtJykuYXR0cignYWN0aW9uJykrXCIvXCIrcHVibGlzaC50aGVJdGVtLmF0dHIoJ2RhdGEtdHlwZScpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRoZURhdGEsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2ZhdGFsIGVycm9yLCBwdWJsaXNoaW5nIHdpbGwgc3RvcFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgaW5kaWNhdG9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaC50aGVJdGVtLmNsb3Nlc3QoJ3RkJykubmV4dCgpLmZpbmQoJy53b3JraW5nJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25zXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaFN1Ym1pdCwgI3B1Ymxpc2hDYW5jZWwnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vbm8gaXNzdWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hvdyBkb25lXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoLnRoZUl0ZW0uY2xvc2VzdCgndGQnKS5uZXh0KCkuZmluZCgnLndvcmtpbmcnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoLnRoZUl0ZW0uY2xvc2VzdCgndGQnKS5uZXh0KCkuZmluZCgnLmRvbmUnKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2gudGhlSXRlbS5hZGRDbGFzcygncHVibGlzaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2gucHVibGlzaEFzc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9wdWJsaXNoaW5nIGlzIGRvbmVcbiAgICAgICAgICAgICAgICBwdWJsaXNoLnB1Ymxpc2hBY3RpdmUgPSAwO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZW5hYmxlIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaFN1Ym1pdCwgI3B1Ymxpc2hDYW5jZWwnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcbiAgICAgICAgICAgICAgICAvL3Nob3cgbWVzc2FnZVxuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWJvZHkgPiAuYWxlcnQtc3VjY2VzcycpLmZhZGVJbig1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXskKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1ib2R5ID4gLmFsZXJ0LXN1Y2Nlc3MnKS5mYWRlT3V0KDUwMCk7fSwgMjUwMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgc2hvd1B1Ymxpc2hTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNzaXRlU2V0dGluZ3NQdWJsaXNoaW5nJykuc2hvdygpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBicm93c2UgdGhlIEZUUCBjb25uZWN0aW9uXG4gICAgICAgICovXG4gICAgICAgIGJyb3dzZUZUUDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2dvdCBhbGwgd2UgbmVlZD9cbiAgICBcdFx0XG4gICAgXHRcdGlmKCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFNlcnZlcicpLnZhbCgpID09PSAnJyB8fCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFVzZXInKS52YWwoKSA9PT0gJycgfHwgJCgnI3NpdGVTZXR0aW5nc19mdHBQYXNzd29yZCcpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnUGxlYXNlIG1ha2Ugc3VyZSBhbGwgRlRQIGNvbm5lY3Rpb24gZGV0YWlscyBhcmUgcHJlc2VudCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICBcdFx0XG4gICAgICAgICAgICAvL2NoZWNrIGlmIHRoaXMgaXMgYSBkZWVwZXIgbGV2ZWwgbGlua1xuICAgIFx0XHRpZiggJCh0aGlzKS5oYXNDbGFzcygnbGluaycpICkge1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdGlmKCAkKHRoaXMpLmhhc0NsYXNzKCdiYWNrJykgKSB7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzX2Z0cFBhdGgnKS52YWwoICQodGhpcykuYXR0cignaHJlZicpICk7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0fSBlbHNlIHtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdC8vaWYgc28sIHdlJ2xsIGNoYW5nZSB0aGUgcGF0aCBiZWZvcmUgY29ubmVjdGluZ1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0aWYoICQoJyNzaXRlU2V0dGluZ3NfZnRwUGF0aCcpLnZhbCgpLnN1YnN0ciggJCgnI3NpdGVTZXR0aW5nc19mdHBQYXRoJykudmFsLmxlbmd0aCAtIDEgKSA9PT0gJy8nICkgey8vcHJlcGVuZCBcIi9cIlxuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3NfZnRwUGF0aCcpLnZhbCggJCgnI3NpdGVTZXR0aW5nc19mdHBQYXRoJykudmFsKCkrJCh0aGlzKS5hdHRyKCdocmVmJykgKTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdH0gZWxzZSB7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5nc19mdHBQYXRoJykudmFsKCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFBhdGgnKS52YWwoKStcIi9cIiskKHRoaXMpLmF0dHIoJ2hyZWYnKSApO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHR9XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcdFxuICAgIFx0XHRcdFxuICAgIFx0XHR9XG4gICAgXHRcdFxuICAgIFx0XHQvL2Rlc3Ryb3kgYWxsIGFsZXJ0c1xuICAgIFx0XHRcbiAgICBcdFx0JCgnI2Z0cEFsZXJ0cyAuYWxlcnQnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuICAgIFx0XHR9KTtcbiAgICBcdFx0XG4gICAgXHRcdC8vZGlzYWJsZSBidXR0b25cbiAgICBcdFx0JCh0aGlzKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vcmVtb3ZlIGV4aXN0aW5nIGxpbmtzXG4gICAgXHRcdCQoJyNmdHBMaXN0SXRlbXMgPiAqJykucmVtb3ZlKCk7XG4gICAgXHRcdFxuICAgIFx0XHQvL3Nob3cgZnRwIHNlY3Rpb25cbiAgICBcdFx0JCgnI2Z0cEJyb3dzZSAubG9hZGVyRnRwJykuc2hvdygpO1xuICAgIFx0XHQkKCcjZnRwQnJvd3NlJykuc2xpZGVEb3duKDUwMCk7XG5cbiAgICBcdFx0dmFyIHRoZUJ1dHRvbiA9ICQodGhpcyk7XG4gICAgXHRcdFxuICAgIFx0XHQkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcImZ0cGNvbm5lY3Rpb24vY29ubmVjdFwiLFxuICAgIFx0XHRcdHR5cGU6ICdwb3N0JyxcbiAgICBcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuICAgIFx0XHRcdGRhdGE6ICQoJ2Zvcm0jc2l0ZVNldHRpbmdzRm9ybScpLnNlcmlhbGl6ZUFycmF5KClcbiAgICBcdFx0fSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgIFx0XHRcbiAgICBcdFx0XHQvL2VuYWJsZSBidXR0b25cbiAgICBcdFx0XHR0aGVCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0Ly9oaWRlIGxvYWRpbmdcbiAgICBcdFx0XHQkKCcjZnRwQnJvd3NlIC5sb2FkZXJGdHAnKS5oaWRlKCk7XG4gICAgXHRcdFxuICAgIFx0XHRcdGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3JcbiAgICBcdFx0XHRcdCQoJyNmdHBBbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICBcdFx0XHR9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9hbGwgZ29vZFxuICAgIFx0XHRcdFx0JCgnI2Z0cExpc3RJdGVtcycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgIFx0XHRcdH1cbiAgICBcdFx0XG4gICAgXHRcdH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGhpZGVzL2Nsb3NlcyB0aGUgRlRQIGJyb3dzZXJcbiAgICAgICAgKi9cbiAgICAgICAgY2xvc2VGdHBCcm93c2VyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBcdFx0JCh0aGlzKS5jbG9zZXN0KCcjZnRwQnJvd3NlJykuc2xpZGVVcCg1MDApO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgIC8qXG4gICAgICAgICAgICB0ZXN0cyB0aGUgRlRQIGNvbm5lY3Rpb24gd2l0aCB0aGUgcHJvdmlkZWQgZGV0YWlsc1xuICAgICAgICAqL1xuICAgICAgICB0ZXN0RlRQQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZ290IGFsbCB3ZSBuZWVkP1xuICAgIFx0XHRpZiggJCgnI3NpdGVTZXR0aW5nc19mdHBTZXJ2ZXInKS52YWwoKSA9PT0gJycgfHwgJCgnI3NpdGVTZXR0aW5nc19mdHBVc2VyJykudmFsKCkgPT09ICcnIHx8ICQoJyNzaXRlU2V0dGluZ3NfZnRwUGFzc3dvcmQnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ1BsZWFzZSBtYWtlIHN1cmUgYWxsIEZUUCBjb25uZWN0aW9uIGRldGFpbHMgYXJlIHByZXNlbnQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgXHRcdFxuICAgIFx0XHQvL2Rlc3Ryb3kgYWxsIGFsZXJ0c1xuICAgICAgICAgICAgJCgnI2Z0cFRlc3RBbGVydHMgLmFsZXJ0JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9kaXNhYmxlIGJ1dHRvblxuICAgIFx0XHQkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9zaG93IGxvYWRpbmcgaW5kaWNhdG9yXG4gICAgXHRcdCQodGhpcykubmV4dCgpLmZhZGVJbig1MDApO1xuICAgIFx0XHRcbiAgICAgICAgICAgIHZhciB0aGVCdXR0b24gPSAkKHRoaXMpO1xuICAgIFx0XHRcbiAgICBcdFx0JC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJmdHBjb25uZWN0aW9uL3Rlc3RcIixcbiAgICBcdFx0XHR0eXBlOiAncG9zdCcsXG4gICAgXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcbiAgICBcdFx0XHRkYXRhOiAkKCdmb3JtI3NpdGVTZXR0aW5nc0Zvcm0nKS5zZXJpYWxpemVBcnJheSgpXG4gICAgXHRcdH0pLmRvbmUoZnVuY3Rpb24ocmV0KXtcbiAgICBcdFx0ICAgIFx0XHRcbiAgICBcdFx0XHQvL2VuYWJsZSBidXR0b25cbiAgICBcdFx0XHR0aGVCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgdGhlQnV0dG9uLm5leHQoKS5mYWRlT3V0KDUwMCk7XG4gICAgXHRcdFx0ICAgIFx0XHRcbiAgICBcdFx0XHRpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2Vycm9yXG4gICAgICAgICAgICAgICAgICAgICQoJyNmdHBUZXN0QWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vYWxsIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgJCgnI2Z0cFRlc3RBbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgXHRcdFxuICAgIFx0XHR9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH07XG4gICAgXG4gICAgcHVibGlzaC5pbml0KCk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGFwcFVJID0gcmVxdWlyZSgnLi91aS5qcycpLmFwcFVJO1xuXG5cdHZhciBzaXRlcyA9IHtcbiAgICAgICAgXG4gICAgICAgIHdyYXBwZXJTaXRlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpdGVzJyksXG4gICAgICAgIHNlbGVjdFVzZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyRHJvcERvd24nKSxcbiAgICAgICAgc2VsZWN0U29ydDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvcnREcm9wRG93bicpLFxuICAgICAgICBidXR0b25EZWxldGVTaXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsZXRlU2l0ZUJ1dHRvbicpLFxuXHRcdGJ1dHRvbnNEZWxldGVTaXRlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVsZXRlU2l0ZUJ1dHRvbicpLFxuICAgICAgICBcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlVGh1bWJuYWlscygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuc2VsZWN0VXNlcikub24oJ2NoYW5nZScsIHRoaXMuZmlsdGVyVXNlcik7XG4gICAgICAgICAgICAkKHRoaXMuc2VsZWN0U29ydCkub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlU29ydGluZyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uc0RlbGV0ZVNpdGUpLm9uKCdjbGljaycsIHRoaXMuZGVsZXRlU2l0ZSk7XG5cdFx0XHQkKHRoaXMuYnV0dG9uRGVsZXRlU2l0ZSkub24oJ2NsaWNrJywgdGhpcy5kZWxldGVTaXRlKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBhcHBsaWVzIHpvb21lciB0byBjcmVhdGUgdGhlIGlmcmFtZSB0aHVibW5haWxzXG4gICAgICAgICovXG4gICAgICAgIGNyZWF0ZVRodW1ibmFpbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMud3JhcHBlclNpdGVzKS5maW5kKCdpZnJhbWUnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHRoZUhlaWdodCA9ICQodGhpcykuYXR0cignZGF0YS1oZWlnaHQnKSowLjI1O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQodGhpcykuem9vbWVyKHtcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMC4yNSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGVIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAkKHRoaXMpLnBhcmVudCgpLndpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VVUkw6IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9cIiskKHRoaXMpLmF0dHIoJ2RhdGEtc2l0ZWlkJylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5zaXRlJykuZmluZCgnLnpvb21lci1jb3ZlciA+IGEnKS5hdHRyKCd0YXJnZXQnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZmlsdGVycyB0aGUgc2l0ZSBsaXN0IGJ5IHNlbGVjdGVkIHVzZXJcbiAgICAgICAgKi9cbiAgICAgICAgZmlsdGVyVXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKHRoaXMpLnZhbCgpID09PSAnQWxsJyB8fCAkKHRoaXMpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjc2l0ZXMgLnNpdGUnKS5oaWRlKCkuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNzaXRlcyAuc2l0ZScpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAkKCcjc2l0ZXMnKS5maW5kKCdbZGF0YS1uYW1lPVwiJyskKHRoaXMpLnZhbCgpKydcIl0nKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjaG5hZ2VzIHRoZSBzb3J0aW5nIG9uIHRoZSBzaXRlIGxpc3RcbiAgICAgICAgKi9cbiAgICAgICAgY2hhbmdlU29ydGluZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBzaXRlcztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQodGhpcykudmFsKCkgPT09ICdOb09mUGFnZXMnICkge1xuXHRcdFxuXHRcdFx0XHRzaXRlcyA9ICQoJyNzaXRlcyAuc2l0ZScpO1xuXHRcdFx0XG5cdFx0XHRcdHNpdGVzLnNvcnQoIGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgYW4gPSBhLmdldEF0dHJpYnV0ZSgnZGF0YS1wYWdlcycpO1xuXHRcdFx0XHRcdHZhciBibiA9IGIuZ2V0QXR0cmlidXRlKCdkYXRhLXBhZ2VzJyk7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKGFuID4gYm4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdFx0aWYoYW4gPCBibikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdFxuXHRcdFx0XHR9ICk7XG5cdFx0XHRcblx0XHRcdFx0c2l0ZXMuZGV0YWNoKCkuYXBwZW5kVG8oICQoJyNzaXRlcycpICk7XG5cdFx0XG5cdFx0XHR9IGVsc2UgaWYoICQodGhpcykudmFsKCkgPT09ICdDcmVhdGlvbkRhdGUnICkge1xuXHRcdFxuXHRcdFx0XHRzaXRlcyA9ICQoJyNzaXRlcyAuc2l0ZScpO1xuXHRcdFx0XG5cdFx0XHRcdHNpdGVzLnNvcnQoIGZ1bmN0aW9uKGEsYil7XG5cdFx0XHRcblx0XHRcdFx0XHR2YXIgYW4gPSBhLmdldEF0dHJpYnV0ZSgnZGF0YS1jcmVhdGVkJykucmVwbGFjZShcIi1cIiwgXCJcIik7XG5cdFx0XHRcdFx0dmFyIGJuID0gYi5nZXRBdHRyaWJ1dGUoJ2RhdGEtY3JlYXRlZCcpLnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuXHRcdFx0XHRcblx0XHRcdFx0XHRpZihhbiA+IGJuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKGFuIDwgYm4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0XHRcblx0XHRcdFx0fSApO1xuXHRcdFx0XG5cdFx0XHRcdHNpdGVzLmRldGFjaCgpLmFwcGVuZFRvKCAkKCcjc2l0ZXMnKSApO1xuXHRcdFxuXHRcdFx0fSBlbHNlIGlmKCAkKHRoaXMpLnZhbCgpID09PSAnTGFzdFVwZGF0ZScgKSB7XG5cdFx0XG5cdFx0XHRcdHNpdGVzID0gJCgnI3NpdGVzIC5zaXRlJyk7XG5cdFx0XHRcblx0XHRcdFx0c2l0ZXMuc29ydCggZnVuY3Rpb24oYSxiKXtcblx0XHRcdFxuXHRcdFx0XHRcdHZhciBhbiA9IGEuZ2V0QXR0cmlidXRlKCdkYXRhLXVwZGF0ZScpLnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuXHRcdFx0XHRcdHZhciBibiA9IGIuZ2V0QXR0cmlidXRlKCdkYXRhLXVwZGF0ZScpLnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuXHRcdFx0XHRcblx0XHRcdFx0XHRpZihhbiA+IGJuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKGFuIDwgYm4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0XG5cdFx0XHRcdH0gKTtcblx0XHRcdFxuXHRcdFx0XHRzaXRlcy5kZXRhY2goKS5hcHBlbmRUbyggJCgnI3NpdGVzJykgKTtcblx0XHRcblx0XHRcdH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBkZWxldGVzIGEgc2l0ZVxuICAgICAgICAqL1xuICAgICAgICBkZWxldGVTaXRlOiBmdW5jdGlvbihlKSB7XG5cdFx0XHQgICAgICAgICAgICBcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubW9kYWwtY29udGVudCBwJykuc2hvdygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3JlbW92ZSBvbGQgYWxlcnRzXG4gICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5tb2RhbC1hbGVydHMgPiAqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5sb2FkZXInKS5oaWRlKCk7XG5cdFx0XG4gICAgICAgICAgICB2YXIgdG9EZWwgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zaXRlJyk7XG4gICAgICAgICAgICB2YXIgZGVsQnV0dG9uID0gJCh0aGlzKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIGJ1dHRvbiNkZWxldGVTaXRlQnV0dG9uJykuc2hvdygpO1xuICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCBidXR0b24jZGVsZXRlU2l0ZUJ1dHRvbicpLnVuYmluZCgnY2xpY2snKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubG9hZGVyJykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy90cmFzaC9cIitkZWxCdXR0b24uYXR0cignZGF0YS1zaXRlaWQnKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubG9hZGVyJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIGJ1dHRvbiNkZWxldGVTaXRlQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5tb2RhbC1jb250ZW50IHAnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vYWxsIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5tb2RhbC1jb250ZW50IHAnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgYnV0dG9uI2RlbGV0ZVNpdGVCdXR0b24nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9EZWwuZmFkZU91dCg4MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuICAgIFxuICAgIHNpdGVzLmluaXQoKTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cblx0dmFyIHNpdGVTZXR0aW5ncyA9IHtcbiAgICAgICAgXG4gICAgICAgIC8vYnV0dG9uU2l0ZVNldHRpbmdzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2l0ZVNldHRpbmdzQnV0dG9uJyksXG5cdFx0YnV0dG9uU2l0ZVNldHRpbmdzMjogJCgnLnNpdGVTZXR0aW5nc01vZGFsQnV0dG9uJyksXG4gICAgICAgIGJ1dHRvblNhdmVTaXRlU2V0dGluZ3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYXZlU2l0ZVNldHRpbmdzQnV0dG9uJyksXG4gICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyQodGhpcy5idXR0b25TaXRlU2V0dGluZ3MpLm9uKCdjbGljaycsIHRoaXMuc2l0ZVNldHRpbmdzTW9kYWwpO1xuXHRcdFx0dGhpcy5idXR0b25TaXRlU2V0dGluZ3MyLm9uKCdjbGljaycsIHRoaXMuc2l0ZVNldHRpbmdzTW9kYWwpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvblNhdmVTaXRlU2V0dGluZ3MpLm9uKCdjbGljaycsIHRoaXMuc2F2ZVNpdGVTZXR0aW5ncyk7XG4gICAgICAgIFxuICAgICAgICB9LFxuICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgbG9hZHMgdGhlIHNpdGUgc2V0dGluZ3MgZGF0YVxuICAgICAgICAqL1xuICAgICAgICBzaXRlU2V0dGluZ3NNb2RhbDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgXHRcdFxuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzJykubW9kYWwoJ3Nob3cnKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vZGVzdHJveSBhbGwgYWxlcnRzXG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3MgLmFsZXJ0JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgXHRcdFxuICAgIFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG4gICAgXHRcdFxuICAgIFx0XHR9KTtcbiAgICBcdFx0XG4gICAgXHRcdC8vc2V0IHRoZSBzaXRlSURcbiAgICBcdFx0JCgnaW5wdXQjc2l0ZUlEJykudmFsKCAkKHRoaXMpLmF0dHIoJ2RhdGEtc2l0ZWlkJykgKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vZGVzdHJveSBjdXJyZW50IGZvcm1zXG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWJvZHktY29udGVudCA+IConKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgXHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcbiAgICBcdFx0fSk7XG4gICAgXHRcdFxuICAgICAgICAgICAgLy9zaG93IGxvYWRlciwgaGlkZSByZXN0XG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3NXcmFwcGVyIC5sb2FkZXInKS5zaG93KCk7XG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3NXcmFwcGVyID4gKjpub3QoLmxvYWRlciknKS5oaWRlKCk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2xvYWQgc2l0ZSBkYXRhIHVzaW5nIGFqYXhcbiAgICBcdFx0JC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9zaXRlQWpheC9cIiskKHRoaXMpLmF0dHIoJ2RhdGEtc2l0ZWlkJyksXG4gICAgXHRcdFx0dHlwZTogJ3Bvc3QnLFxuICAgIFx0XHRcdGRhdGFUeXBlOiAnanNvbidcbiAgICBcdFx0fSkuZG9uZShmdW5jdGlvbihyZXQpeyAgICBcdFx0XHRcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2Vycm9yXG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XHQvL2hpZGUgbG9hZGVyLCBzaG93IGVycm9yIG1lc3NhZ2VcbiAgICBcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLmxvYWRlcicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdH0pO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHQvL2Rpc2FibGUgc3VibWl0IGJ1dHRvblxuICAgIFx0XHRcdFx0JCgnI3NhdmVTaXRlU2V0dGluZ3NCdXR0b24nKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcbiAgICBcdFx0XHR9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9hbGwgd2VsbCA6KVxuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0Ly9oaWRlIGxvYWRlciwgc2hvdyBkYXRhXG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLmxvYWRlcicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWJvZHktY29udGVudCcpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignc2l0ZVNldHRpbmdzTG9hZCcpO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHR9KTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0Ly9lbmFibGUgc3VibWl0IGJ1dHRvblxuICAgIFx0XHRcdFx0JCgnI3NhdmVTaXRlU2V0dGluZ3NCdXR0b24nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFxuICAgIFx0XHRcdH1cbiAgICBcdFx0XG4gICAgXHRcdH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHNhdmVzIHRoZSBzaXRlIHNldHRpbmdzXG4gICAgICAgICovXG4gICAgICAgIHNhdmVTaXRlU2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Rlc3Ryb3kgYWxsIGFsZXJ0c1xuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5hbGVydCcpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcbiAgICBcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuICAgIFx0XHRcbiAgICBcdFx0fSk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2Rpc2FibGUgYnV0dG9uXG4gICAgXHRcdCQoJyNzYXZlU2l0ZVNldHRpbmdzQnV0dG9uJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2hpZGUgZm9ybSBkYXRhXG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWJvZHktY29udGVudCA+IConKS5oaWRlKCk7XG4gICAgXHRcdFxuICAgIFx0XHQvL3Nob3cgbG9hZGVyXG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3MgLmxvYWRlcicpLnNob3coKTtcbiAgICBcdFx0XG4gICAgXHRcdCQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvc2l0ZUFqYXhVcGRhdGVcIixcbiAgICBcdFx0XHR0eXBlOiAncG9zdCcsXG4gICAgXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcbiAgICBcdFx0XHRkYXRhOiAkKCdmb3JtI3NpdGVTZXR0aW5nc0Zvcm0nKS5zZXJpYWxpemVBcnJheSgpXG4gICAgXHRcdH0pLmRvbmUoZnVuY3Rpb24ocmV0KXtcbiAgICBcdFx0XG4gICAgXHRcdFx0aWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDAgKSB7Ly9lcnJvclxuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubG9hZGVyJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCByZXQucmVzcG9uc2VIVE1MICk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL3Nob3cgZm9ybSBkYXRhXG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWJvZHktY29udGVudCA+IConKS5zaG93KCk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL2VuYWJsZSBidXR0b25cbiAgICBcdFx0XHRcdFx0JCgnI3NhdmVTaXRlU2V0dGluZ3NCdXR0b24nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0fSk7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0fSBlbHNlIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vYWxsIGlzIHdlbGxcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLmxvYWRlcicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vdXBkYXRlIHNpdGUgbmFtZSBpbiB0b3AgbWVudVxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVRpdGxlJykudGV4dCggcmV0LnNpdGVOYW1lICk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoIHJldC5yZXNwb25zZUhUTUwgKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vaGlkZSBmb3JtIGRhdGFcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYm9keS1jb250ZW50ID4gKicpLnJlbW92ZSgpO1xuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1ib2R5LWNvbnRlbnQnKS5hcHBlbmQoIHJldC5yZXNwb25zZUhUTUwyICk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL2VuYWJsZSBidXR0b25cbiAgICBcdFx0XHRcdFx0JCgnI3NhdmVTaXRlU2V0dGluZ3NCdXR0b24nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vaXMgdGhlIEZUUCBzdHVmZiBhbGwgZ29vZD9cbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdGlmKCByZXQuZnRwT2sgPT09IDEgKSB7Ly95ZXMsIGFsbCBnb29kXG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRcdCQoJyNwdWJsaXNoUGFnZScpLnJlbW92ZUF0dHIoJ2RhdGEtdG9nZ2xlJyk7XG4gICAgXHRcdFx0XHRcdFx0JCgnI3B1Ymxpc2hQYWdlIHNwYW4udGV4dC1kYW5nZXInKS5oaWRlKCk7XG4gICAgXHRcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdFx0JCgnI3B1Ymxpc2hQYWdlJykudG9vbHRpcCgnZGVzdHJveScpO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0fSBlbHNlIHsvL25vcGUsIGNhbid0IHVzZSBGVFBcbiAgICBcdFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0XHQkKCcjcHVibGlzaFBhZ2UnKS5hdHRyKCdkYXRhLXRvZ2dsZScsICd0b29sdGlwJyk7XG4gICAgXHRcdFx0XHRcdFx0JCgnI3B1Ymxpc2hQYWdlIHNwYW4udGV4dC1kYW5nZXInKS5zaG93KCk7XG4gICAgXHRcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdFx0JCgnI3B1Ymxpc2hQYWdlJykudG9vbHRpcCgnc2hvdycpO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0fVxuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vdXBkYXRlIHRoZSBzaXRlIG5hbWUgaW4gdGhlIHNtYWxsIHdpbmRvd1xuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZV8nK3JldC5zaXRlSUQrJyAud2luZG93IC50b3AgYicpLnRleHQoIHJldC5zaXRlTmFtZSApO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHR9KTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcbiAgICBcdFx0XHR9XG4gICAgXHRcdFxuICAgIFx0XHR9KTtcbiAgICBcdFx0ICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgIFxuICAgIH07XG4gICAgXG4gICAgc2l0ZVNldHRpbmdzLmluaXQoKTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4vKiBnbG9iYWxzIHNpdGVVcmw6ZmFsc2UsIGJhc2VVcmw6ZmFsc2UgKi9cbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgXG4gICAgdmFyIGFwcFVJID0ge1xuICAgICAgICBcbiAgICAgICAgZmlyc3RNZW51V2lkdGg6IDE5MCxcbiAgICAgICAgc2Vjb25kTWVudVdpZHRoOiAzMDAsXG4gICAgICAgIGxvYWRlckFuaW1hdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpLFxuICAgICAgICBzZWNvbmRNZW51VHJpZ2dlckNvbnRhaW5lcnM6ICQoJyNtZW51ICNtYWluICNlbGVtZW50Q2F0cywgI21lbnUgI21haW4gI3RlbXBsYXRlc1VsJyksXG4gICAgICAgIHNpdGVVcmw6IHNpdGVVcmwsXG4gICAgICAgIGJhc2VVcmw6IGJhc2VVcmwsXG4gICAgICAgIFxuICAgICAgICBzZXR1cDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRmFkZSB0aGUgbG9hZGVyIGFuaW1hdGlvblxuICAgICAgICAgICAgJChhcHBVSS5sb2FkZXJBbmltYXRpb24pLmZhZGVPdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKCcjbWVudScpLmFuaW1hdGUoeydsZWZ0JzogLWFwcFVJLmZpcnN0TWVudVdpZHRofSwgMTAwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFic1xuICAgICAgICAgICAgJChcIi5uYXYtdGFicyBhXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQodGhpcykudGFiKFwic2hvd1wiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKFwic2VsZWN0LnNlbGVjdFwiKS5zZWxlY3QyKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJzpyYWRpbywgOmNoZWNrYm94JykucmFkaW9jaGVjaygpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb29sdGlwc1xuICAgICAgICAgICAgJChcIltkYXRhLXRvZ2dsZT10b29sdGlwXVwiKS50b29sdGlwKFwiaGlkZVwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFibGU6IFRvZ2dsZSBhbGwgY2hlY2tib3hlc1xuICAgICAgICAgICAgJCgnLnRhYmxlIC50b2dnbGUtYWxsIDpjaGVja2JveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciBjaCA9ICR0aGlzLnByb3AoJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgICAgICAkdGhpcy5jbG9zZXN0KCcudGFibGUnKS5maW5kKCd0Ym9keSA6Y2hlY2tib3gnKS5yYWRpb2NoZWNrKCFjaCA/ICd1bmNoZWNrJyA6ICdjaGVjaycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEFkZCBzdHlsZSBjbGFzcyBuYW1lIHRvIGEgdG9vbHRpcHNcbiAgICAgICAgICAgICQoXCIudG9vbHRpcFwiKS5hZGRDbGFzcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoJCh0aGlzKS5wcmV2KCkuYXR0cihcImRhdGEtdG9vbHRpcC1zdHlsZVwiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJ0b29sdGlwLVwiICsgJCh0aGlzKS5wcmV2KCkuYXR0cihcImRhdGEtdG9vbHRpcC1zdHlsZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJChcIi5idG4tZ3JvdXBcIikub24oJ2NsaWNrJywgXCJhXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykuc2libGluZ3MoKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS5lbmQoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBGb2N1cyBzdGF0ZSBmb3IgYXBwZW5kL3ByZXBlbmQgaW5wdXRzXG4gICAgICAgICAgICAkKCcuaW5wdXQtZ3JvdXAnKS5vbignZm9jdXMnLCAnLmZvcm0tY29udHJvbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5pbnB1dC1ncm91cCwgLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnZm9jdXMnKTtcbiAgICAgICAgICAgIH0pLm9uKCdibHVyJywgJy5mb3JtLWNvbnRyb2wnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuaW5wdXQtZ3JvdXAsIC5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFibGU6IFRvZ2dsZSBhbGwgY2hlY2tib3hlc1xuICAgICAgICAgICAgJCgnLnRhYmxlIC50b2dnbGUtYWxsJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoID0gJCh0aGlzKS5maW5kKCc6Y2hlY2tib3gnKS5wcm9wKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcudGFibGUnKS5maW5kKCd0Ym9keSA6Y2hlY2tib3gnKS5jaGVja2JveCghY2ggPyAnY2hlY2snIDogJ3VuY2hlY2snKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJsZTogQWRkIGNsYXNzIHJvdyBzZWxlY3RlZFxuICAgICAgICAgICAgJCgnLnRhYmxlIHRib2R5IDpjaGVja2JveCcpLm9uKCdjaGVjayB1bmNoZWNrIHRvZ2dsZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAgICAgICAgICwgY2hlY2sgPSAkdGhpcy5wcm9wKCdjaGVja2VkJylcbiAgICAgICAgICAgICAgICAsIHRvZ2dsZSA9IGUudHlwZSA9PT0gJ3RvZ2dsZSdcbiAgICAgICAgICAgICAgICAsIGNoZWNrYm94ZXMgPSAkKCcudGFibGUgdGJvZHkgOmNoZWNrYm94JylcbiAgICAgICAgICAgICAgICAsIGNoZWNrQWxsID0gY2hlY2tib3hlcy5sZW5ndGggPT09IGNoZWNrYm94ZXMuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgICR0aGlzLmNsb3Nlc3QoJ3RyJylbY2hlY2sgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oJ3NlbGVjdGVkLXJvdycpO1xuICAgICAgICAgICAgICAgIGlmICh0b2dnbGUpICR0aGlzLmNsb3Nlc3QoJy50YWJsZScpLmZpbmQoJy50b2dnbGUtYWxsIDpjaGVja2JveCcpLmNoZWNrYm94KGNoZWNrQWxsID8gJ2NoZWNrJyA6ICd1bmNoZWNrJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gU3dpdGNoXG4gICAgICAgICAgICAkKFwiW2RhdGEtdG9nZ2xlPSdzd2l0Y2gnXVwiKS53cmFwKCc8ZGl2IGNsYXNzPVwic3dpdGNoXCIgLz4nKS5wYXJlbnQoKS5ib290c3RyYXBTd2l0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYXBwVUkuc2Vjb25kTWVudVRyaWdnZXJDb250YWluZXJzLm9uKCdjbGljaycsICdhOm5vdCguYnRuKScsIGFwcFVJLnNlY29uZE1lbnVBbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBzZWNvbmRNZW51QW5pbWF0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgICAgICQoJyNtZW51ICNtYWluIGEnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XG4gICAgICAgICAgICAvL3Nob3cgb25seSB0aGUgcmlnaHQgZWxlbWVudHNcbiAgICAgICAgICAgICQoJyNtZW51ICNzZWNvbmQgdWwgbGknKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcjbWVudSAjc2Vjb25kIHVsIGxpLicrJCh0aGlzKS5hdHRyKCdpZCcpKS5zaG93KCk7XG5cbiAgICAgICAgICAgIGlmKCAkKHRoaXMpLmF0dHIoJ2lkJykgPT09ICdhbGwnICkge1xuICAgICAgICAgICAgICAgICQoJyNtZW51ICNzZWNvbmQgdWwjZWxlbWVudHMgbGknKS5zaG93KCk7XHRcdFxuICAgICAgICAgICAgfVxuXHRcbiAgICAgICAgICAgICQoJy5tZW51IC5zZWNvbmQnKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgd2lkdGg6IGFwcFVJLnNlY29uZE1lbnVXaWR0aFxuICAgICAgICAgICAgfSwgNTAwKTtcdFxuICAgICAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH07XG4gICAgXG4gICAgLy9pbml0aWF0ZSB0aGUgVUlcbiAgICBhcHBVSS5zZXR1cCgpO1xuXG5cbiAgICAvLyoqKiogRVhQT1JUU1xuICAgIG1vZHVsZS5leHBvcnRzLmFwcFVJID0gYXBwVUk7XG4gICAgXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgXG4gICAgZXhwb3J0cy5nZXRSYW5kb21BcmJpdHJhcnkgPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xuICAgIH07XG5cbiAgICBleHBvcnRzLmdldFBhcmFtZXRlckJ5TmFtZSA9IGZ1bmN0aW9uIChuYW1lLCB1cmwpIHtcblxuICAgICAgICBpZiAoIXVybCkgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiWz8mXVwiICsgbmFtZSArIFwiKD0oW14mI10qKXwmfCN8JClcIiksXG4gICAgICAgICAgICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuICAgICAgICBpZiAoIXJlc3VsdHMpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoIXJlc3VsdHNbMl0pIHJldHVybiAnJztcbiAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICAgICAgICBcbiAgICB9O1xuICAgIFxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHRyZXF1aXJlKCcuL21vZHVsZXMvdWkuanMnKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL2FjY291bnQuanMnKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL3NpdGVzLmpzJyk7XG5cdHJlcXVpcmUoJy4vbW9kdWxlcy9zaXRlc2V0dGluZ3MuanMnKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL3B1Ymxpc2hpbmcuanMnKTtcblxufSgpKTsiLCIvKiFcbiAqIHB1Ymxpc2hlci5qcyAtIChjKSBSeWFuIEZsb3JlbmNlIDIwMTFcbiAqIGdpdGh1Yi5jb20vcnBmbG9yZW5jZS9wdWJsaXNoZXIuanNcbiAqIE1JVCBMaWNlbnNlXG4qL1xuXG4vLyBVTUQgQm9pbGVycGxhdGUgXFxvLyAmJiBEOlxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTsgLy8gbm9kZVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmYWN0b3J5KTsgLy8gYW1kXG4gIH0gZWxzZSB7XG4gICAgLy8gd2luZG93IHdpdGggbm9Db25mbGljdFxuICAgIHZhciBfcHVibGlzaGVyID0gcm9vdC5wdWJsaXNoZXI7XG4gICAgdmFyIHB1Ymxpc2hlciA9IHJvb3QucHVibGlzaGVyID0gZmFjdG9yeSgpO1xuICAgIHJvb3QucHVibGlzaGVyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByb290LnB1Ymxpc2hlciA9IF9wdWJsaXNoZXI7XG4gICAgICByZXR1cm4gcHVibGlzaGVyO1xuICAgIH1cbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHB1Ymxpc2hlciA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgdG9waWNzID0ge307XG4gICAgb2JqID0gb2JqIHx8IHt9O1xuXG4gICAgb2JqLnB1Ymxpc2ggPSBmdW5jdGlvbiAodG9waWMvKiwgbWVzc2FnZXMuLi4qLykge1xuICAgICAgaWYgKCF0b3BpY3NbdG9waWNdKSByZXR1cm4gb2JqO1xuICAgICAgdmFyIG1lc3NhZ2VzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0b3BpY3NbdG9waWNdLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0b3BpY3NbdG9waWNdW2ldLmhhbmRsZXIuYXBwbHkodG9waWNzW3RvcGljXVtpXS5jb250ZXh0LCBtZXNzYWdlcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG5cbiAgICBvYmouc3Vic2NyaWJlID0gZnVuY3Rpb24gKHRvcGljT3JTdWJzY3JpYmVyLCBoYW5kbGVyT3JUb3BpY3MpIHtcbiAgICAgIHZhciBmaXJzdFR5cGUgPSB0eXBlb2YgdG9waWNPclN1YnNjcmliZXI7XG5cbiAgICAgIGlmIChmaXJzdFR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBzdWJzY3JpYmUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpcnN0VHlwZSA9PT0gJ29iamVjdCcgJiYgIWhhbmRsZXJPclRvcGljcykge1xuICAgICAgICByZXR1cm4gc3Vic2NyaWJlTXVsdGlwbGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyT3JUb3BpY3MgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBoaXRjaC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaGl0Y2hNdWx0aXBsZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUgKHRvcGljLCBoYW5kbGVyLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVmZXJlbmNlID0geyBoYW5kbGVyOiBoYW5kbGVyLCBjb250ZXh0OiBjb250ZXh0IHx8IG9iaiB9O1xuICAgICAgdG9waWMgPSB0b3BpY3NbdG9waWNdIHx8ICh0b3BpY3NbdG9waWNdID0gW10pO1xuICAgICAgdG9waWMucHVzaChyZWZlcmVuY2UpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYXR0YWNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdG9waWMucHVzaChyZWZlcmVuY2UpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXRhY2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBlcmFzZSh0b3BpYywgcmVmZXJlbmNlKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc3Vic2NyaWJlTXVsdGlwbGUgKHBhaXJzKSB7XG4gICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IHt9O1xuICAgICAgZm9yICh2YXIgdG9waWMgaW4gcGFpcnMpIHtcbiAgICAgICAgaWYgKCFwYWlycy5oYXNPd25Qcm9wZXJ0eSh0b3BpYykpIGNvbnRpbnVlO1xuICAgICAgICBzdWJzY3JpcHRpb25zW3RvcGljXSA9IHN1YnNjcmliZSh0b3BpYywgcGFpcnNbdG9waWNdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdWJzY3JpcHRpb25zO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoaXRjaCAoc3Vic2NyaWJlciwgdG9waWMpIHtcbiAgICAgIHJldHVybiBzdWJzY3JpYmUodG9waWMsIHN1YnNjcmliZXJbdG9waWNdLCBzdWJzY3JpYmVyKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGl0Y2hNdWx0aXBsZSAoc3Vic2NyaWJlciwgdG9waWNzKSB7XG4gICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0b3BpY3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMucHVzaCggaGl0Y2goc3Vic2NyaWJlciwgdG9waWNzW2ldKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbnM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVyYXNlIChhcnIsIHZpY3RpbSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnIubGVuZ3RoOyBpIDwgbDsgaSsrKXtcbiAgICAgICAgaWYgKGFycltpXSA9PT0gdmljdGltKSBhcnIuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gcHVibGlzaGVyIGlzIGEgcHVibGlzaGVyLCBzbyBtZXRhIC4uLlxuICByZXR1cm4gcHVibGlzaGVyKHB1Ymxpc2hlcik7XG59KSk7XG4iXX0=
