const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require("express");
require("dotenv").config(); // تحميل المتغيرات من .env

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const OWNER_ID = "844256993458913331"; // Your ID to receive orders
const userOrders = new Map(); // Store user orders
const activeUsers = new Set(); // Track users who started an order
const userMessages = new Map(); // Track messages to delete

// Product list
const products = [
    { name: "Cocaïne Brick", price: 31000 },
    { name: "Weed Brick", price: 28000 },
    { name: "Boîte de Lyrica", price: 550000 },
    { name: "Meth", price: 34000 },
    { name: "Héroïne", price: 600 }
];

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity('sinaloa shop', { type: 'WATCHING' });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!pro') {
        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('🛒 Produits disponibles')
            .setDescription("اضغط على الزر لبدء الطلب")
            .addFields(products.map(p => ({ name: p.name, value: `$${p.price}`, inline: true })))
            .setFooter({ text: "sinaloa shop" })
            .setTimestamp();

        const orderButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_order')
                    .setLabel('Place Order')
                    .setStyle(ButtonStyle.Primary)
            );

        try {
            await message.channel.send({ embeds: [embed], components: [orderButton] });
        } catch (error) {
            console.error("❌ Error sending embed:", error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
