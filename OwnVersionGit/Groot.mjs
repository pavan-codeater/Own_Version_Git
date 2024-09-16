#!/usr//bin/env nodechmod 

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { timeStamp } from 'console';
import {diffLines} from 'diff';
import {Command} from 'commander';

const program=new Command();
class Groot{
    constructor(repoPath='.'){
        this.repoPath=path.join(repoPath,'.groot');
        this.objectsPath=path.join(this.repoPath,'objects')
        this.headPath=path.join(this.repoPath,'HEAD');
        this.indexPath=path.join(this.repoPath,'index');
        this.init();
    }


    async init(){
        await fs.mkdir(this.objectsPath,{recursive:true});
        try{
            await fs.writeFile(this.headPath,'',{flag:'wx'});
            await fs.writeFile(this.indexPath,JSON.stringify([]),{flag:'wx'});
        }catch(e){
            console.log("Intialized .groot folder")
        }
    }

    hashObject(content){
        return crypto.createHash('sha1').update(content,'utf-8').digest('hex');
      }

    async add(fileToBeAdded){
        const filedata= await fs.readFile(fileToBeAdded,{encoding:'utf-8'});
        const fileHash=this.hashObject(filedata);
        console.log(fileHash);
        const newFileHashedObjectPath=path.join(this.objectsPath,fileHash);
        await fs.writeFile(newFileHashedObjectPath,filedata);
        await this.updateStagingArea(fileToBeAdded,fileHash);

    }

    async updateStagingArea(filePath,fileHash){
        const index=JSON.parse(await fs.readFile(this.indexPath,{encoding:'utf-8'}));
        index.push({path:filePath,hash:fileHash});
        await fs.writeFile(this.indexPath,JSON.stringify(index));
    }

    async commit(message){
        const index=JSON.parse(await fs.readFile(this.indexPath,{encoding :'utf-8'}));
        const parentCommit=await this.getCurrentHead();
        const commitData={
            timeStamp:new Date().toISOString(),
            message,
            false:index,
            parent:parentCommit
        }

        const commitHash=this.hashObject(JSON.stringify(commitData));
        const commitPath=path.join(this.objectsPath,commitHash);
        await fs.writeFile(commitPath,JSON.stringify(commitData));
        await fs.writeFile(this.headPath,commitHash);
        await fs.writeFile(this.indexPath,JSOn.stringify([]));
        console.log(`Commit successfully created ${commitHash}`)
    }

 async getCurrentHead(){
    try{
        return await fs.readFile(this.headPath,{encoding:'utf-8'});
    }catch(er){
        return null;
    }
 }

 async log(){
    let currentCommitHash=await this.getCurrentHead();
    while(currentCommitHash){
        const commitData=JSON.parse(await fs.readFile(this.objectsPath,currentCommitHash),{encoding:'utf-8'});
        console.log(`Commit :${currentCommitHash}\n Date:${commitData.timeStamp}`);
        currentCommitHash=commitData.parent;
    }
 }

 async showCommitDiff(commitHash){
    const commitData=JSON.parse(await this.getCommitData(commitHash));
    if(!commitData){
        console.log("commit not found");
        return;
    }
    console.log("changes in the last commit are");
    for(const file of commitData.files){
        console.log(`File :${file.path}`);
        const fileContent=await this.getFileContent(file.hash);
        console.log(fileContent);

        if(commitData.parent){
            const parentCommit=JSON.parse(await this.getCommitData(commitData.parent));
            const getParentFileContent=await this.getParentFileContent(parentCommitData,file.path);
            if(getParentFileContent!==undefined){
                console.log('\nDiff');
                const diff=diffLines(getParentFileContent,fileContent);
                console.log(diff);
                diff.forEach((part)=>{
                    if(part.added){
                      process.stdout.write(chalk,green(part.value));
                    }else if(part.removed){
                        process.stdout.write(chalk.red(part.value));
                    }
                    else{
                        process.stdout.write(chalk.grey(part.value));
                    }
                });
                console.log();
            } else{
                console.log('New file in this commit')
            }
        }else{
            console.log('First Commit')
        }
    }  
 }

 async getParentFileContent(parentCommitData,filePath){
    const parentFile=parentCommitData.files(file=>file.path===filePath);
    if(parentFile){
        return await this.getFileContent(parentFile.hash);
    }
 }

 async getCommitData(commitHash){
    const commitPath=path.join(this.objectsPath,commitHash);
    try{
        return await fs.readFile(commitPath,{encoding:'utf-8'});

    }catch(er){
        console.log("Failed to read the commit Data");
        return null;
    }
 }

 async getFileContent(fileHash){
    const objectsPath=path.join(this.objectsPath,fileHash);
    return fs.readFile(objectPath,{encoding:'utf-8'});
 }


}

 

(async ()=>{
    const groot=new Groot();
await groot.add('sample.txt');
await groot.commit('FIrst Commit');
await groot.log();
await groot.showCommitDiff('')
})



