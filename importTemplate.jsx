{
    /* developed by Moses Journey 
        mail@mrjourney.net
        
        
      */
    function ImportTemplate(thisObj){
        try{
        function ImportTemplate_buildUI(thisObj){
            // info
            var scriptName = "ImportTemplate";
            var scriptVersion = "v.02";
            var appVer = app.version;
            
            function getScriptFolder(){  // function to find path to this script
                 try {   
                      var activeScript = File(app.activeScript);   
                 } catch(e) {   
                      // running from ESTK ...   
                      var activeScript = File(e.fileName);   
                 }   
                 return activeScript.parent;  
            } 

            // preferences
           
            var defaultTemplateFileLocation =getScriptFolder().toString()+"/defaultTemplate.aet";
            
            if (! app.settings.haveSetting(scriptName, "templateFile")){app.settings.saveSetting(scriptName,"templateFile",defaultTemplateFileLocation);}
            
            
            // functions =================================================
            
            // generic function to merge one folder into another
            function mergeFolderContents(srcFolder, targetFolder)
            {
                var item;
                
                // Loop through srcFolder.items in reverse (so that any removal of folders doesn't mess up the looping)
                for (var i=srcFolder.numItems; i>=1; i--)
                {
                    item = srcFolder.item(i);
                    
                    if (!(item instanceof FolderItem))			// Move non-folder items to srcFolder
                        item.parentFolder = targetFolder;
                    else											// For folders, check for matching named folder in targetFolder and merge if exists
                    {
                        // Look for first matching named subfolder in targetFolder
                        matchingSubFolder = null;
                        for (j=1; j<=targetFolder.numItems; j++)
                        {
                            targetSubItem = targetFolder.item(j);
                            if ((targetSubItem instanceof FolderItem) && (targetSubItem.name === item.name))
                            {
                                matchingSubFolder = targetSubItem;
                                break;
                            }
                        }
                        
                        // If found a matching subfolder, merge recursively, else merge up directly
                        if (matchingSubFolder !== null)
                        {
                            // Merge subfolder recursively
                            mergeFolderContents(item, matchingSubFolder);
                            
                            // Remove folder (which should be empty, but just checking)
                            if (item.numItems === 0)
                                item.remove();
                        }
                        else
                            item.parentFolder = targetFolder;
                    }
                }
            }
            
            // function to update template file location
            function changeTemplate() {
                var templateFile = File.openDialog("Choose a template file","After Effects Template:*.aet;*.aep,All files:*", false);
                if ((templateFile != null) &&  templateFile.exists)
                {
                    templateFile = templateFile;

                    // Remember the template for the next session
                    app.settings.saveSetting(scriptName,"templateFile", templateFile.absoluteURI);
                } else {
                    return;
                }
            }
            
            // function to actually import template file set in preferences
            function importTemplate() {
                
                try {
                    var masterFolder = app.project.importFile(new ImportOptions(File(app.settings.getSetting(scriptName, "templateFile"))));
                    app.beginUndoGroup("Import template file");
                }
                    catch(e)
                {
                    alert("Template file does not exist. Please use the \"...\" button to choose a template file.");
                    changeTemplate();
                    return;
                }
                mergeFolderContents(masterFolder,app.project.rootFolder);
                masterFolder.remove();

                app.endUndoGroup();
            }
       
            // end functions ==================================================
            
            // create window
            var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable: true});
            
            // set up initial layout of panel groups
                res = "group{orientation:'column', alignment:['fill','fill'],\
                            logoGroup: Group{alignment:['fill','top'],alignChildren:['left','bottom'],minimumSize:[100,12],\
                                scriptName: StaticText {preferredSize:[150,12]},\
                            },\
                            mainPanel: Panel{type:'panel',alignment:['fill','fill'],\
                                templateButtonGroup: Group{orientation:'row', alignment:['left','top'],alignChildren:['left','bottom'],spacing:3,\
                                    templateButton: Button {preferredSize:[150,-1]},\
                                    changeTemplateButton: Button {preferredSize:[18,18]},\
                                },\
                            },\
                        }";
            
            myPanel.grp = myPanel.add(res);

            //Setup panel sizing
            myPanel.layout.layout(true);
            myPanel.grp.minimumSize = myPanel.grp.size;
            
            //Make panel resizeable
            myPanel.layout.resize();
            myPanel.onResizing = myPanel.onResize = function() {this.layout.resize()};

            //Version number and script name
            myPanel.grp.logoGroup.scriptName.text = scriptName+" "+scriptVersion;

            // tools setup
            var buttonPanel = myPanel.grp.mainPanel.templateButtonGroup;
                buttonPanel.spacing = 0;
                
                //Template Button settings
                buttonPanel.templateButton.text = "Import Project Template";
                buttonPanel.templateButton.helpTip= "Click this button to import the contents of your template file\rNote: This is not undoable";
                buttonPanel.templateButton.onClick = importTemplate;
                
                //Change Template Location Button settings
                buttonPanel.changeTemplateButton.text = "...";
                buttonPanel.changeTemplateButton.helpTip= "Click this button to change the location of your template file";
                buttonPanel.changeTemplateButton.onClick = changeTemplate;
                
                buttonPanel.editspacing = 0;
                
 
            
            return myPanel;
        }
    
        var ImportTemplatePal = ImportTemplate_buildUI(thisObj);
        
        if((ImportTemplatePal != null) && (ImportTemplatePal instanceof Window)){
            ImportTemplatePal.center();
            ImportTemplatePal.show();
        }
        } catch (err) {
            alert(err.line+"\r"+err.toString());
        }
    }
    ImportTemplate(this);
}