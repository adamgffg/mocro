const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running ✅");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const CHANNEL_ID = "1344850937424121947"; // Ensure this is the correct ID
const OWNER_ID = "844256993458913331"; // Your ID to receive orders

// Product list
const products = [
    { name: "Produit1", price: 100 },
    { name: "Produit2", price: 200 },
    { name: "Produit3", price: 300 }
];

// Temporary storage for user orders
const userOrders = new Map();
const userMessages = new Map(); // Store messages from each buyer

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity('sinaloa shop', { type: 'WATCHING' });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '!or') {
        userOrders.set(message.author.id, []);
        userMessages.set(message.author.id, []);
        userMessages.get(message.author.id).push(message);

        setTimeout(() => {
            userMessages.get(message.author.id)?.forEach(msg => msg.delete().catch(() => {}));
            userMessages.delete(message.author.id);
        }, 100000);

        return message.reply("✅ يمكنك الآن إرسال طلباتك بصيغة: `اسم المنتج الكمية`، وعند الانتهاء استخدم `!confirm`")
            .then(msg => userMessages.get(message.author.id).push(msg));
    }

    if (userOrders.has(message.author.id)) {
        userMessages.get(message.author.id).push(message);

        if (command === '!confirm') {
            const orders = userOrders.get(message.author.id);
            if (!orders.length) {
                return message.reply("❌ You haven't added any orders!")
                    .then(msg => userMessages.get(message.author.id).push(msg));
            }

            const total = orders.reduce((sum, order) => sum + order.total, 0);
            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('📦 New Order')
                .setDescription(`New order from ${message.author.tag}`)
                .addFields(orders.map(o => ({ name: o.product, value: `🔢 Quantity: ${o.quantity} | 💰 Total: $${o.total}`, inline: false })))
                .addFields({ name: '💰 Total Amount', value: `$${total}`, inline: false })
                .setFooter({ text: "sinaloa shop" })
                .setTimestamp();

            try {
                const owner = await client.users.fetch(OWNER_ID);
                await owner.send({ embeds: [embed] });
                console.log("✅ Order sent to owner.");
            } catch (error) {
                console.error("❌ Error sending order to owner:", error);
            }

            userOrders.delete(message.author.id);
            return message.reply("✅ Your order has been confirmed and sent for review!")
                .then(msg => userMessages.get(message.author.id).push(msg));
        }

        const productName = command;
        const quantity = parseInt(args[0]);

        if (isNaN(quantity) || quantity <= 0) {
            return message.reply("❌ Please enter a valid quantity!")
                .then(msg => userMessages.get(message.author.id).push(msg));
        }

        const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
        if (!product) {
            return message.reply("❌ Product not found!")
                .then(msg => userMessages.get(message.author.id).push(msg));
        }

        const total = product.price * quantity;
        userOrders.get(message.author.id).push({ product: productName, quantity, total });
        return message.reply(`✅ Added ${productName} (${quantity}) to your order! Send more or use \`!confirm\` when done.`)
            .then(msg => userMessages.get(message.author.id).push(msg));
    }
});

client.login("MTMzNTU1NDYwNjAwODIzODEzMw.GwWjYF.fMhQSH58hRi28s4V_H5osi2cyxaPKQ8wAqVb-Y");
