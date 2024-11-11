const fs = require('fs');
const path = require('node:path'); 
const config = require("./cache-config.json");


const bOverwrite = config.bOverwrite;
const cacheFolder = config.cacheFolder;
const cacheFile = config.cacheFile;

const cacheIni = path.join(cacheFolder, cacheFile);


class CacheCoverter{

    constructor(){

        try{

            console.log(`[-------------------------------------------------------]`);
            console.log(`[-----CLI Unreal Tournament Cache Converter-------------]`);
            console.log(`[------By Scott Adkin 6th December 2020-----------------]`);
            console.log(`[------Linux Update 10th November 2024------------------]`);
            console.log(`[-------------------------------------------------------]`);

            this.files = [];

            this.checkFolders();

            this.readIni();

            this.convertFiles();
            this.clearIni();

        }catch(err){
            console.log(err);
        }
    }

    checkFolders(){

        const targets = ["System",
            "Sounds",
            "Music",
            "Textures",
            "Maps"
        ]

        for(let i = 0; i < targets.length; i++){

            const t = targets[i];

            fs.stat(t, (err, stats) =>{
    
                if(err){

                    console.log(`[Notice]: Failed to find folder ${t} (${err.code})`);  

                    fs.mkdirSync(path.join(t));

                    console.log(`[Notice]: Created folder ${t}`);  

                    return;
                }

            });
        }
        
    }

    readIni(){

        this.data = fs.readFileSync(cacheIni).toString();

        const reg = /^(.+)$/img;
        this.lines = this.data.match(reg);

        const keyValueReg = /^(.+?)=(.+)\.(.+)$/i;

        for(let i = 0; i < this.lines.length; i++){

            const keyValueResult = keyValueReg.exec(this.lines[i]);

            if(keyValueResult !== null){
                this.files.push({
                    "guid": keyValueResult[1],
                    "name": keyValueResult[2],
                    "ext": keyValueResult[3].toLowerCase()
                });
            }
        }

        console.log(`[Note]: Found ${this.files.length} files to convert.`);
    }

    convertFiles(){

        const types = [
            "u",
            "uax",
            "umx",
            "utx",
            "unr"
        ];

        const destinations = [
            "System",
            "Sounds",
            "Music",
            "Textures",
            "Maps"
        ];

        const found = [
           {"found": 0, "pass": 0, "dup": 0, "fail": 0},
           {"found": 0, "pass": 0, "dup": 0, "fail": 0},
           {"found": 0, "pass": 0, "dup": 0, "fail": 0},
           {"found": 0, "pass": 0, "dup": 0, "fail": 0},
           {"found": 0, "pass": 0, "dup": 0, "fail": 0}
        ];

        let pass = 0;
        let fail = 0;
        let dups = 0;
    

        for(let i = 0; i < this.files.length; i++){

            const f = this.files[i];

            let typeIndex = types.indexOf(f.ext.toLowerCase());

            try{
                
                if(typeIndex === -1) throw new Error(`Unknown file type`);

                let bCurrentExist = false;
                const currentDest = destinations[typeIndex];
                const currentExt = types[typeIndex];

                found[typeIndex].found++;

                const currentFile = path.join(currentDest, `${f.name}.${currentExt}`);

                try{

                    fs.accessSync(currentFile,fs.constants.R_OK);   

                    bCurrentExist = true;

                    if(!bOverwrite){
                        console.log(`[Warning]: File ${currentFile} already Exists, not replacing.`);
                    }

                    dups++;
                    found[typeIndex].dup++;      

                }catch(err){
                    if(err.code !== 'ENOENT') console.log(err);
                }


                const uxxFile = path.join(cacheFolder, `${f.guid}.uxx`);
                
                if(bOverwrite || !bCurrentExist){

                   
                    fs.renameSync(uxxFile, currentFile);
                    found[typeIndex].pass++;
                    pass++;
                    console.log(`[Pass]: File ${uxxFile} converted to ${currentFile}.`);
                }else{
                    fs.rmSync(uxxFile);
                    console.log(`[Pass]: ${uxxFile} Deleted.`);
                }

                    

            }catch(err){

                fail++;
                found[typeIndex].fail++;

                this.failedFiles.push(f.guid);

                if(err.code === 'ENOENT'){
                    console.log(`[Warning]: The file ${f.guid}.uxx does not exist, skipping.`);
                }else{
                    console.log(err);
                }

            }
        }

        console.log(`[Finished]: Converted a total of ${pass} files out of a total of ${this.files.length}.`);
        console.log(`[Finished]: Found ${found[0].found} u packages, ${found[0].pass} converted, ${found[0].dup} duplicates, and ${found[0].fail} failed.`);
        console.log(`[Finished]: Found ${found[1].found} Sound packages, ${found[1].pass} converted, ${found[1].dup} duplicates, and ${found[1].fail} failed.`);
        console.log(`[Finished]: Found ${found[2].found} Music packages, ${found[2].pass} converted, ${found[2].dup} duplicates, and ${found[2].fail} failed.`);
        console.log(`[Finished]: Found ${found[3].found} Texture packages, ${found[3].pass} converted, ${found[3].dup} duplicates, and ${found[3].fail} failed.`);
        console.log(`[Finished]: Found ${found[4].found} Maps, ${found[4].pass} converted, ${found[4].dup} duplicates, and ${found[4].fail} failed.`);
        console.log(`[Finished]: Failed conversions are usually caused by the file no longer existing in the Cache folder.`);
        console.log(`[Finished]: Duplicate overwriting is set to ${bOverwrite}, to change this behaviour set bOverwrite to ${!bOverwrite} in cache-config.json.`);

    }


    clearIni(){

        const data = `[Cache]`;

        fs.writeFileSync(cacheIni, data);
        console.log(`[Finished]: cache.ini now cleared.`);
    }

    
}




const app = new CacheCoverter();
