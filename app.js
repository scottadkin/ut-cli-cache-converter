const fs = require('fs');

const bOverwrite = false;

class CacheCoverter{

    constructor(){

        try{

            console.log(`[------------------------------------------------------]`);
            console.log(`[-----CLI Unreal Tournament Cache Converter-------------]`);
            console.log(`[------By Scott Adkin 6th December 2020----------------]`);
            console.log(`[------------------------------------------------------]`);

            this.files = [];

            this.readIni();

            this.convertFiles();
            this.clearIni();

        }catch(err){
            console.log(err);
        }

    }

    readIni(){

        this.data = fs.readFileSync('Cache/Cache.ini').toString();

        const reg = /^(.+)$/img;
        this.lines = this.data.match(reg);

        const keyValueReg = /^(.+?)=(.+)\.(.+)$/i;
        let keyValueResult = 0;

        for(let i = 0; i < this.lines.length; i++){

            keyValueResult = keyValueReg.exec(this.lines[i]);

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

        let f = 0;

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

        let typeIndex = 0;
        let currentDest = 0;
        let currentExt = 0;

        let bCurrentExist = false;

        for(let i = 0; i < this.files.length; i++){

            f = this.files[i];

            typeIndex = types.indexOf(f.ext.toLowerCase());

            try{
                
                if(typeIndex === -1) throw new Error(`Unknown file type`);

                bCurrentExist = false;
                currentDest = destinations[typeIndex];
                currentExt = types[typeIndex];

                found[typeIndex].found++;

                try{

                    fs.accessSync(`${currentDest}\\${f.name}.${currentExt}`,fs.constants.R_OK);   

                    bCurrentExist = true;

                    if(!bOverwrite){
                        console.log(`[Warning]: File ${currentDest}\\${f.name}.${currentExt} already Exists, not replacing.`);
                    }

                    dups++;
                    found[typeIndex].dup++;      

                }catch(err){
                    if(err.code !== 'ENOENT') console.log(err);
                }


                if(bOverwrite || !bCurrentExist){

                    fs.renameSync(`Cache\\${f.guid}.uxx`,`${currentDest}\\${f.name}.${currentExt}`);
                    found[typeIndex].pass++;
                    pass++;
                    console.log(`[Pass]: File Cache\\${f.guid}.uxx converted to ${currentDest}\\${f.name}.${currentExt}.`);
                }else{
                    fs.rmSync(`Cache\\${f.guid}.uxx`);
                    console.log(`[Pass]: Cache\\${f.guid}.uxx Deleted.`);
                }

                    

            }catch(err){

                fail++;
                found[typeIndex].fail++;

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
        console.log(`[Finished]: Failed conversions and usually caused by the file no longer existing in the Cache folder.`);
        console.log(`[Finished]: Duplicate overwriting is set to ${bOverwrite}, to change this behaviour set bOverwrite to ${!bOverwrite} in app.js.`);

    }


    clearIni(){

        const data = `[Cache]`;

        fs.writeFileSync(`Cache/Cache.ini`, data);
        console.log(`[Finished]: Cache.ini now cleared.`);
    }

    
}




const app = new CacheCoverter();