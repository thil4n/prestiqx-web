const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying PresTiqx NFT contracts...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy PresTiqxNFT contract
    const PresTiqxNFT = await ethers.getContractFactory("PresTiqxNFT");
    const feeRecipient = deployer.address; // Use deployer as initial fee recipient

    console.log("Deploying PresTiqxNFT...");
    const royalTixNFT = await PresTiqxNFT.deploy(feeRecipient);
    await royalTixNFT.deployed();
    console.log("PresTiqxNFT deployed to:", royalTixNFT.address);

    // Deploy PresTiqxMarketplace contract
    const PresTiqxMarketplace = await ethers.getContractFactory(
        "PresTiqxMarketplace"
    );

    console.log("Deploying PresTiqxMarketplace...");
    const marketplace = await PresTiqxMarketplace.deploy(
        royalTixNFT.address,
        feeRecipient
    );
    await marketplace.deployed();
    console.log("PresTiqxMarketplace deployed to:", marketplace.address);

    // Authorize the deployer as an organizer
    console.log("Authorizing deployer as organizer...");
    await royalTixNFT.authorizeOrganizer(deployer.address);
    console.log("Deployer authorized as organizer");

    // Create a sample event for testing
    console.log("Creating sample event...");
    const eventDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

    const createEventTx = await royalTixNFT.createEvent(
        "Royal Gala Evening",
        "An evening of unparalleled elegance and sophistication. Join the elite for a night of royal entertainment, gourmet dining, and exclusive networking.",
        "Grand Ballroom",
        eventDate,
        "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "Gala"
    );

    const receipt = await createEventTx.wait();
    const eventCreatedEvent = receipt.events?.find(
        (e) => e.event === "EventCreated"
    );
    const eventId = eventCreatedEvent?.args?.eventId;

    console.log("Sample event created with ID:", eventId.toString());

    // Add ticket tiers to the sample event
    console.log("Adding ticket tiers...");

    // Royal Standard tier
    await royalTixNFT.addTicketTier(
        eventId,
        "Royal Standard",
        ethers.utils.parseEther("0.3"),
        100,
        0, // Common
        [
            "General admission",
            "Welcome drink",
            "Digital program",
            "NFT certificate",
        ]
    );

    // Imperial VIP tier
    await royalTixNFT.addTicketTier(
        eventId,
        "Imperial VIP",
        ethers.utils.parseEther("0.5"),
        50,
        1, // Rare
        [
            "VIP seating",
            "Premium bar access",
            "Meet & greet",
            "Exclusive NFT variant",
            "Gift bag",
        ]
    );

    // Crown Royalty tier
    await royalTixNFT.addTicketTier(
        eventId,
        "Crown Royalty",
        ethers.utils.parseEther("1.0"),
        20,
        2, // Legendary
        [
            "Front row access",
            "Private lounge",
            "Personal concierge",
            "Ultra-rare NFT",
            "Luxury amenities",
            "After-party access",
        ]
    );

    console.log("Ticket tiers added");

    // Publish the event
    console.log("Publishing event...");
    await royalTixNFT.publishEvent(eventId);
    console.log("Event published");

    console.log("\n=== Deployment Summary ===");
    console.log("PresTiqxNFT:", royalTixNFT.address);
    console.log("PresTiqxMarketplace:", marketplace.address);
    console.log("Sample Event ID:", eventId.toString());
    console.log("Fee Recipient:", feeRecipient);
    console.log("Deployer (Authorized Organizer):", deployer.address);

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        royalTixNFT: royalTixNFT.address,
        marketplace: marketplace.address,
        feeRecipient: feeRecipient,
        sampleEventId: eventId.toString(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
    };

    const fs = require("fs");
    fs.writeFileSync(
        "deployment-info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nDeployment info saved to deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
