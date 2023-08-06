/* modules */
const Discord = require('discord.js');
const { MessageAttachment } = require('discord.js');
const fs = require('fs');
const express = require('express');
const app = express();
let normalData;
let godData;
fs.readFile('inscriptions.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    normalData = JSON.parse(jsonString);
});
fs.readFile('gods.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    godData = JSON.parse(jsonString);
});

/* global variables */
const Global = require('./Global.js').config;

const client = new Discord.Client();

/* discord client */
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    // Check if the message comes from an allowed channel
    const allowedChannels = Global.fileChannel.split(',');
    if (!allowedChannels.includes(msg.channel.id)) {
        return;
    }
    if (msg.content.startsWith("/submit")) {
        let commandParts = msg.content.split(' ');
         if(commandParts.length!== 2){
            return message.reply('Invalid number of arguments. The correct format is `/submit bc1p....`');
    
         }
         const btcAddress = commandParts[1];

        // Check if the address starts with 'bc1p'
        if (!btcAddress.startsWith('bc1p')) {
            return message.reply('The Bitcoin address must start with "bc1p"');
        }

        // More thorough validation can be done here, for now we'll just log the address
        console.log(`Bitcoin address submitted: ${btcAddress}`);
    }

    
    if (msg.content.startsWith("/summon")) {

        // Parse the id from the command
        let commandParts = msg.content.split(' ');
    
        let type, id;
        
        // Check if 'god' parameter is present
        if(commandParts.length >= 3 && commandParts[1].toLowerCase() === 'god') {
            type = 'god';
            id = commandParts[2];
        } else if (commandParts.length >= 2) {
            type = 'normal';
            id = commandParts[1];
        } else {
            console.error("Invalid command format. Expected /command [type] [id].");
            return;
        }
    
        // Ensure that the id can be padded
        if(typeof id === 'string') {
            // Pad the id with leading zeros
            id = id.padStart(4, '0');
        } else {
            console.error("Invalid id format. Expected string.");
            return;
        }
    
        // Choose the correct data based on the type
        let data = type === 'god' ? godData : normalData;
    
        // Find the entry with the matching id or name
        const entry = data.find(e => e.id === id || e.meta.name.split('#')[1] === id);
    
        if (entry) {
            // If an entry was found, send the URL
            msg.reply({ files: [entry.meta.high_res_img_url] });
        } else {
            // If no entry was found, send an error message
            msg.reply(`No NFT found with id/name: ${id}`);
        }
    }
  if (msg.content.startsWith("/rarity") || msg.content.startsWith("/traits")) {
    const rarityChannel =  Global.rarityChannel.split(',');
    if (!rarityChannel.includes(msg.channel.id)) {
        return;
    }

    // Parse the id from the command
    let commandParts = msg.content.split(' ');
    // If commandParts.length is less than 2, then it means that no id was supplied with the command
    if(commandParts.length < 2) {
        console.error("Invalid command format. Expected /command [id].");
        return;
    }

    let id = commandParts[1];

    // Ensure that the id can be padded
    if(typeof id === 'string') {
        // Pad the id with leading zeros
        id = id.padStart(4, '0');
    } else {
        console.error("Invalid id format. Expected string.");
        return;
    }
    let data = normalData;
    // Check that data is defined and it's an array
    if(!Array.isArray(data)) {
        console.error("Data is not an array.");
        return;
    }
    
    // Find the entry with the matching id or name
    const entry = data.find(e => e.id === id || (e.meta && e.meta.name && e.meta.name.split('#')[1] === id));

    // If no entry was found, then log an error
    if(!entry) {
        console.error("No entry found for id:", id);
        return;
    }

    
        if (entry) {
            // Calculate the rarity of each NFT in the collection
            let rarities = data.map(item => {
                let rarity = item.meta.attributes.reduce((sum, attr) => {
                    // Count the number of occurrences of each trait's value in the whole collection
                    let count = data.reduce((sum, current) => {
                        let foundAttr = current.meta.attributes.find(a => a.trait_type === attr.trait_type && a.value === attr.value);
                        return sum + (foundAttr ? 1 : 0);
                    }, 0);
    
                    // Calculate the rarity and add it to the sum
                    return sum + (count / data.length);
                }, 0);
    
                return {
                    id: item.id,
                    rarity: rarity
                };
            });
    
            // Sort the rarities in ascending order
            rarities.sort((a, b) => a.rarity - b.rarity);
    
            // Find the position of the queried NFT in the ranking
            let position = rarities.findIndex(r => r.id === entry.id) + 1;
    
            // If an entry was found, compose a reply with the name and traits
            let reply = `Name: ${entry.meta.name}\nTraits:\n`;
    
            for (let attr of entry.meta.attributes) {
                // Count the number of occurrences of each trait's value in the whole collection
                let count = data.reduce((sum, current) => {
                    let foundAttr = current.meta.attributes.find(a => a.trait_type === attr.trait_type && a.value === attr.value);
                    return sum + (foundAttr ? 1 : 0);
                }, 0);
    
                // Calculate the percentage
                let percentage = (count / data.length) * 100;
    
                reply += `${attr.trait_type}: ${attr.value} (${percentage.toFixed(2)}%)\n`;
            }
    
            reply += `\nRarity ranking: ${position}\n\n*Experimental. Collection not complete. Rarity rankings may change.*`;
    
            msg.reply(reply);
        } else {
            // If no entry was found, send an error message
            msg.reply(`No NFT found with id/name: ${id}`);
        }
    }
    
    
});




app.listen(Global.port, () => {
    console.clear();
    console.log(`Server is running @ http://${Global.host}:${Global.port}`);
    client.login(Global.token);
});
