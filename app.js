const fs = require('fs');

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
            0,
            0,
            0,
            0,
            0
        ];

        let pass = 0;
        let fail = 0;

        let typeIndex = 0;
        let currentDest = 0;
        let currentExt = 0;

        for(let i = 0; i < this.files.length; i++){

            f = this.files[i];

            typeIndex = types.indexOf(f.ext.toLowerCase());

            try{
                
                if(typeIndex === -1) throw new Error(`Unknown file type`);

                currentDest = destinations[typeIndex];
                currentExt = types[typeIndex];

                found[typeIndex]++;

                fs.renameSync(`Cache\\${f.guid}.uxx`,`${currentDest}\\${f.name}.${currentExt}`);
                pass++;
                console.log(`[Pass]: File Cache\\${f.guid}.uxx converted to ${currentDest}\\${f.name}.${currentExt}`);

            }catch(err){

                fail++;
                if(err.code === 'ENOENT'){
                    console.log(`[Warning]: The file ${f.guid}.uxx does not exist, skipping.`);
                }else{
                    console.log(err);
                }

            }
        }

        console.log(`[Finished]: Converted a total of ${pass} files out of a total of ${this.files.length}.`);
        console.log(`[Finished]: ${found[0]} u packages converted.`);
        console.log(`[Finished]: ${found[1]} Sound packages converted.`);
        console.log(`[Finished]: ${found[2]} Music packages converted.`);
        console.log(`[Finished]: ${found[3]} Texture packages converted.`);
        console.log(`[Finished]: ${found[4]} Maps converted.`);
    }


    clearIni(){

        const data = `[Cache]`;

        fs.writeFileSync(`Cache/Cache.ini`, data);
        console.log(`[Finished]: Cache.ini now cleared.`);
    }

    
}




const app = new CacheCoverter();