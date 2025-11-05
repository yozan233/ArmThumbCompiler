
async function callAS(env) {
return new Promise((resolve) => {
        require(['./arm-none-eabi-as'], (Module) => {
        resolve(Module(env));
    });
})
}
async function callObjcopy(env) {
    return new Promise((resolve) => {
        require(['./arm-none-eabi-objcopy'], (Module) => {
            resolve(Module(env));
        });
    })
}

async function assembleThumb(code,filename) {
    return new Promise((resolve, reject) => {
        const asmFile = `${filename}.asm`;
        const oFile = `${filename}.o`;
        let out = "";

        const env = {};
        env.preRun = [(m) => m.FS.writeFile(asmFile, code)];
        env.print = (data) => {
            out += data + "\n";
        }
        env.printErr = (data) => {
            out += data + "\n";
        }

        env.postRun = [
            async (m) => {
                if(m.FS.findObject(oFile)){
                    const data = await m.FS.readFile(oFile);
                    getBinaryData(data,filename,resolve);
                }
                else{
                    reject(out);
                }
            }
        ]
        env.arguments = [asmFile, "-mthumb","-o",oFile];
        callAS(env);

    });
    
}

async function getBinaryData(data,filename,resolve) {
    const oFile = `${filename}.o`;
    const binFile = `${filename}.bin`;

    const env = {};
    env.preRun = [(m) => m.FS.writeFile(oFile, data)];
    env.postRun = [
        async (m) => {
            const binData = await m.FS.readFile(binFile)
            resolve(binData);
        }
    ]
    env.arguments = ["-O", "binary", oFile, binFile];
    callObjcopy(env);
}

